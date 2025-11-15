import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

interface DecodedToken {
  id: string;
}

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * Middleware to protect routes for logged-in users
 */
export const protectUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

      // Fetch user from DB, exclude password
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;

      console.log("✅ protectUser: User authenticated:", user.email, user.role);
      next();
    } catch (err: any) {
      console.error("❌ protectUser: Token verification failed:", err.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.warn("❌ protectUser: No token provided");
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

/**
 * Middleware to allow only admins
 */
export const protectAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    console.warn("❌ protectAdmin: No user attached to request");
    return res.status(401).json({ message: "Not authorized" });
  }

  console.log("protectAdmin: User role:", req.user.role);

  if (req.user.role === "admin") {
    next();
  } else {
    console.warn("❌ protectAdmin: Access denied for role", req.user.role);
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
};
