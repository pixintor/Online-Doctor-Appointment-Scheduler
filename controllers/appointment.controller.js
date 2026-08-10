import asyncHandler from "../utills/asyncHandler.js";
import appointmentService from "../services/appointment.service.js";

const bookAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.bookAppointment(
    req.user.id,
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully.",
    data: appointment,
  });
});

const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getPatientAppointments(
    req.user.id,
  );

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

const getDoctorAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getDoctorAppointments(
    req.user.id,
  );

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.updateAppointmentStatus(
    req.params.id,
    req.user.id,
    req.body.status,
  );

  res.status(200).json({
    success: true,
    message: "Appointment updated successfully.",
    data: appointment,
  });
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.cancelAppointment(
    req.params.id,
    req.user.id,
  );

  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully.",
    data: appointment,
  });
});

export default {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateStatus,
  cancelAppointment,
};
