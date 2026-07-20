import Doctor from "../models/Doctor.js";
import Schedule from "../models/Schedule.js";
import AppError from "../utills/AppError.js";

export const createSchedule = async (userId, data) => {
  const doctor = await Doctor.findOne({ user: userId });

  if (!doctor) {
    throw new AppError("Doctor profile not found.", 404);
  }

  const existingSchedule = await Schedule.findOne({
    doctor: doctor._id,
    day: data.day,
  });

  if (existingSchedule) {
    throw new AppError(`Schedule for ${data.day} already exists.`, 409);
  }

  return await Schedule.create({
    doctor: doctor._id,
    ...data,
  });
};

export const getDoctorSchedules = async (doctorId) => {
  return await Schedule.find({
    doctor: doctorId,
    isAvailable: true,
  }).sort({ day: 1 });
};

export const updateSchedule = async (scheduleId, userId, data) => {
  const doctor = await Doctor.findOne({ user: userId });

  if (!doctor) {
    throw new AppError("Doctor profile not found.", 404);
  }

  const schedule = await Schedule.findOne({
    _id: scheduleId,
    doctor: doctor._id,
  });

  if (!schedule) {
    throw new AppError("Schedule not found.", 404);
  }

  Object.assign(schedule, data);

  await schedule.save();

  return schedule;
};
