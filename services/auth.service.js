import bcrypt from "bcrypt";
import User from "../models/User.js";

const registerUser = async (userData) => {
  const { firstName, lastName, email, password, phone, role } = userData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    role,
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  // Find the user
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Prevent inactive users from logging in
  if (!user.isActive) {
    throw new Error("Account has been deactivated");
  }

  // Compare passwords
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  return user;
};

export default {
  registerUser,
  loginUser,
};
