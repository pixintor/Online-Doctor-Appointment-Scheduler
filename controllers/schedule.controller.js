import asyncHandler from "../utills/asyncHandler.js";
import {
  getDoctorSchedules,
  createSchedule as createScheduleService,
  updateSchedule as updateScheduleService,
} from "../services/schedule.service.js";

// POST /api/schedules
export const createSchedule = asyncHandler(async (req, res) => {
  const schedule = await createScheduleService(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Schedule created successfully.",
    data: schedule,
  });
});

// GET /api/schedules/<doctorId>
export const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await getDoctorSchedules(req.params.doctorId);

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules,
  });
});

// PUT /api/schedules/<scheduleId>
export const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await updateScheduleService(
    req.params.id,
    req.user.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Schedule updated successfully.",
    data: schedule,
  });
});
