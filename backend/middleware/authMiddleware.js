import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

/**
 * Protect routes: require a valid Bearer JWT.
 * Attaches the authenticated user (without password) to req.user.
 * Handles session expiration by returning 401 on invalid/expired tokens.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }
    if (!user.active) {
      res.status(403);
      throw new Error("Account is deactivated");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});
