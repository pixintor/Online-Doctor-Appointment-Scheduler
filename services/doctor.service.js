import Doctor from "../models/Doctor.js";
import AppError from "../utills/AppError.js";

export const createDoctorProfile = async (userId, doctorData) => {
  const existingDoctor = await Doctor.findOne({ user: userId });

  if (existingDoctor) {
    throw new AppError("Doctor profile already exists.", 409);
  }

  const doctor = await Doctor.create({
    user: userId,
    ...doctorData,
  });

  return doctor;
};
export const getAllDoctors = async () => {
  return await Doctor.find().populate("user", "firstName lastName email phone");
};

export const getDoctorById = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).populate(
    "user",
    "firstName lastName email phone",
  );

  if (!doctor) {
    throw new AppError("Doctor not found.", 404);
  }

  return doctor;
};

export const searchDoctors = async (specialization) => {
  return await Doctor.find({
    specialization: {
      $regex: specialization,
      $options: "i",
    },
  }).populate("user", "firstName lastName email phone");
};

export const updateDoctorProfile = async (userId, updateData) => {
  const doctor = await Doctor.findOne({ user: userId });

  if (!doctor) {
    throw new AppError("Doctor profile not found.", 404);
  }

  Object.assign(doctor, updateData);

  await doctor.save();

  return doctor;
};
