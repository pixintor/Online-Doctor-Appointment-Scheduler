import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utills/asyncHandler.js";
import AppError from "../utills/AppError.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized. No token provided.", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired token.", 401);
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new AppError("User no longer exists.", 401);
  }

  req.user = user;

  next();
});

export default protect;
