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

const User = require("../models/User");
const {
  hashPassword,
  comparePassword
} = require("../utils/password");

const generateToken = require("../utils/generateToken");

exports.register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: role || "patient"
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User
      .findOne({ email })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated"
      });
    }

    const isPasswordValid = await comparePassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
  } catch (error) {
    next(error);
  }
};
