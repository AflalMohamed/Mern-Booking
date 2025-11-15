import express from "express";
import {
  addHotel,
  updateHotel,
  deleteHotel,
  getHotels,
} from "../controllers/adminController";
import { protectUser, protectAdmin } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

router.get("/hotels", protectUser, protectAdmin, getHotels);
router.post("/hotels", protectUser, protectAdmin, upload.array("images", 5), addHotel);
router.put("/hotels/:id", protectUser, protectAdmin, upload.array("images", 5), updateHotel);
router.delete("/hotels/:id", protectUser, protectAdmin, deleteHotel);

export default router;
