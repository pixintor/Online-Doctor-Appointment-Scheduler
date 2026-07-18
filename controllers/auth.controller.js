import authService from "../services/auth.service.js";
import generateToken from "../utills/generateToken.js";
import asyncHandler from "../utills/asyncHandler.js";
import AppError from "../utills/AppError.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  const token = generateToken({
    id: user._id,
    role: user.role,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const user = await authService.loginUser(req.body);

  const token = generateToken({
    id: user._id,
    role: user.role,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});
