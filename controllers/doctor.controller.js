import {
  createDoctorProfile,
  getAllDoctors,
  getDoctorById,
  searchDoctors,
  updateDoctorProfile,
} from "../services/doctor.service.js";
import asyncHandler from "../utills/asyncHandler.js";

// POST /api/doctors/profile
export const createProfile = asyncHandler(async (req, res) => {
  const doctor = await createDoctorProfile(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Doctor profile created successfully",
    data: doctor,
  });
});

// GET /api/doctors
export const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await getAllDoctors();

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

// GET /api/doctors/:id
export const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await getDoctorById(req.params.id);

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

// GET /api/doctors/search?specialization=cardio
export const searchDoctor = asyncHandler(async (req, res) => {
  const doctors = await searchDoctors(req.query.specialization);

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

// PUT /api/doctors/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const doctor = await updateDoctorProfile(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: "Doctor profile updated successfully",
    data: doctor,
  });
});
