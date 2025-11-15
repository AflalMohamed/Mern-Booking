import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Step 1️⃣: Define the TypeScript interface
 * This represents the shape of a User object in TypeScript.
 */
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  matchPassword(enteredPassword: string): Promise<boolean>;
}

/**
 * Step 2️⃣: Define the Mongoose schema
 */
const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

/**
 * Step 3️⃣: Pre-save hook to hash password before saving
 */
userSchema.pre<IUser>("save", async function (next) {
  // If password is not modified, skip hashing
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Step 4️⃣: Method to check if password matches
 */
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Step 5️⃣: Export the model
 */
const User = mongoose.model<IUser>("User", userSchema);

export default User;
