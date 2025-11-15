// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface DateRange {
  start: string;
  end: string;
}

interface Hotel {
  _id: string;
  name: string;
  city: string;
  pricePerNight: number;
  totalRooms: number;
  description?: string;
  images?: string[];
  availableDates: DateRange[];
  maintenanceDates: DateRange[];
}

interface FormState {
  name: string;
  city: string;
  pricePerNight: string;
  totalRooms: string;
  description: string;
  existingImages: string[];
  newImages: File[];
  availableDates: DateRange[];
  maintenanceDates: DateRange[];
}

const emptyForm = (): FormState => ({
  name: "",
  city: "",
  pricePerNight: "",
  totalRooms: "",
  description: "",
  existingImages: [],
  newImages: [],
  availableDates: [],
  maintenanceDates: [],
});

const formatDateForInput = (date?: string) => {
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const AdminDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Fetch Hotels
  const fetchHotels = async () => {
    if (!token) return;
    try {
      setFetching(true);
      const res = await axios.get("/admin/hotels", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(res.data || []);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to fetch hotels");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!user || (user as any).role !== "admin") return;
    fetchHotels();
  }, [user, token]);

  // Input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "images" && files) {
      const newFiles = Array.from(files);
      setForm((prev) => ({ ...prev, newImages: newFiles }));
      setPreviewImages(newFiles.map((f) => URL.createObjectURL(f)));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value } as any));
  };

  // Date range handlers
  const addDateRange = (type: "availableDates" | "maintenanceDates") =>
    setForm((prev) => ({
      ...prev,
      [type]: [...prev[type], { start: "", end: "" }],
    }));

  const updateDateRange = (
    type: "availableDates" | "maintenanceDates",
    index: number,
    field: "start" | "end",
    value: string
  ) =>
    setForm((prev) => {
      const clone = [...prev[type]];
      clone[index] = { ...clone[index], [field]: value };
      return { ...prev, [type]: clone };
    });

  const removeDateRange = (
    type: "availableDates" | "maintenanceDates",
    index: number
  ) =>
    setForm((prev) => {
      const clone = [...prev[type]];
      clone.splice(index, 1);
      return { ...prev, [type]: clone };
    });

  const removeExistingImage = (index: number) =>
    setForm((prev) => {
      const clone = [...prev.existingImages];
      clone.splice(index, 1);
      return { ...prev, existingImages: clone };
    });

  const openAddModal = () => {
    setForm(emptyForm());
    setPreviewImages([]);
    setEditingHotelId(null);
    setShowModal(true);
  };

  const openEditModal = (hotel: Hotel) => {
    setForm({
      name: hotel.name,
      city: hotel.city,
      pricePerNight: hotel.pricePerNight.toString(),
      totalRooms: hotel.totalRooms.toString(),
      description: hotel.description || "",
      existingImages: hotel.images || [],
      newImages: [],
      availableDates: hotel.availableDates.map((d) => ({
        start: formatDateForInput(d.start),
        end: formatDateForInput(d.end),
      })),
      maintenanceDates: hotel.maintenanceDates.map((d) => ({
        start: formatDateForInput(d.start),
        end: formatDateForInput(d.end),
      })),
    });
    setPreviewImages([]);
    setEditingHotelId(hotel._id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.city || !form.pricePerNight || !form.totalRooms) {
      alert("Please fill required fields.");
      return;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("city", form.city);
      fd.append("pricePerNight", form.pricePerNight);
      fd.append("totalRooms", form.totalRooms);
      fd.append("description", form.description || "");
      fd.append("availableDates", JSON.stringify(form.availableDates));
      fd.append("maintenanceDates", JSON.stringify(form.maintenanceDates));
      fd.append("existingImages", JSON.stringify(form.existingImages || []));
      form.newImages.forEach((f) => fd.append("images", f));

      if (editingHotelId)
        await axios.put(`/admin/hotels/${editingHotelId}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
      else
        await axios.post("/admin/hotels", fd, {
          headers: { Authorization: `Bearer ${token}` },
        });

      await fetchHotels();
      setShowModal(false);
      setEditingHotelId(null);
      setForm(emptyForm());
      setPreviewImages([]);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save hotel");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this hotel?")) return;
    try {
      await axios.delete(`/admin/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Deleted successfully");
      fetchHotels();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete");
    }
  };

  const displayRange = (r: DateRange) => `${r.start} → ${r.end}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🏨 Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">Hello, {user?.username}</span>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add Hotel Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Add Hotel
        </button>
      </div>

      {/* Hotel List */}
      {fetching ? (
        <p className="text-center text-gray-500 animate-pulse">Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p className="text-center text-gray-500">No hotels found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((h) => (
            <div
              key={h._id}
              className="bg-white rounded-2xl shadow p-4 flex flex-col hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="h-44 w-full mb-3 overflow-hidden rounded-xl bg-gray-100">
                {h.images && h.images[0] ? (
                  <img
                    src={`http://localhost:5000/uploads/${h.images[0]}`}
                    alt={h.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{h.name}</h3>
                <p className="text-sm text-gray-600">🏙️ {h.city}</p>
                <p className="text-sm text-gray-600">Rs.{h.pricePerNight}/night</p>
                <p className="text-sm text-gray-600">Rooms: {h.totalRooms}</p>
                <p className="mt-2 text-sm text-gray-500 line-clamp-3">{h.description}</p>
                <div className="mt-2 text-xs text-gray-700">
                  <div>
                    <strong>Available:</strong>{" "}
                    {h.availableDates.map(displayRange).join(", ") || "—"}
                  </div>
                  <div>
                    <strong>Maintenance:</strong>{" "}
                    {h.maintenanceDates.map(displayRange).join(", ") || "—"}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEditModal(h)}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(h._id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <h2 className="text-2xl font-semibold text-center">
                {editingHotelId ? "Edit Hotel" : "Add Hotel"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Hotel name"
                  className="border rounded px-3 py-2 w-full"
                />
                <input
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="border rounded px-3 py-2 w-full"
                />
                <input
                  name="pricePerNight"
                  value={form.pricePerNight}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Price per night"
                  className="border rounded px-3 py-2 w-full"
                />
                <input
                  name="totalRooms"
                  value={form.totalRooms}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Total rooms"
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="border rounded px-3 py-2 w-full h-28"
              />

              {/* Existing Images */}
              {form.existingImages.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Existing Images (remove ✖)</div>
                  <div className="flex gap-2 overflow-x-auto">
                    {form.existingImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={`http://localhost:5000/uploads/${img}`}
                          alt={`img-${idx}`}
                          className="h-20 w-28 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div>
                <label className="block text-sm font-medium mb-1">Upload images</label>
                <input name="images" type="file" multiple onChange={handleInputChange} />
                {previewImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mt-2">
                    {previewImages.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt={`preview-${i}`}
                        className="h-20 w-28 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Date ranges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["availableDates", "maintenanceDates"].map((type) => (
                  <div key={type}>
                    <div className="font-semibold mb-2">
                      {type === "availableDates" ? "Available Dates" : "Maintenance Dates"}
                    </div>
                    <div className="space-y-2">
                      {form[type as "availableDates" | "maintenanceDates"].map(
                        (range, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="date"
                              value={range.start}
                              onChange={(e) =>
                                updateDateRange(
                                  type as any,
                                  idx,
                                  "start",
                                  e.target.value
                                )
                              }
                              className="border px-2 py-1 rounded"
                            />
                            <input
                              type="date"
                              value={range.end}
                              onChange={(e) =>
                                updateDateRange(type as any, idx, "end", e.target.value)
                              }
                              className="border px-2 py-1 rounded"
                            />
                            <button
                              onClick={() => removeDateRange(type as any, idx)}
                              className="text-red-600 font-bold"
                            >
                              ✖
                            </button>
                          </div>
                        )
                      )}
                      <button
                        onClick={() => addDateRange(type as any)}
                        className="text-indigo-600 text-sm"
                      >
                        + Add {type === "availableDates" ? "available" : "maintenance"} range
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-4 border-t bg-white">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingHotelId(null);
                  setPreviewImages([]);
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-indigo-600 px-4 py-2 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Saving..." : editingHotelId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
