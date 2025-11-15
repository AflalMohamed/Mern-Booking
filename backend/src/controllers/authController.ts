import { Request, Response } from "express";
import User from "../models/User";
import generateToken from "../utils/generateToken";

/**
 * @desc Register new user
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    // 1️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 2️⃣ Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || "user",
    });

    // 3️⃣ Respond with token
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user.id.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2️⃣ Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3️⃣ Respond with token
    res.json({
  token: generateToken(user.id.toString()),
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role}
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
