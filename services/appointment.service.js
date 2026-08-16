import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Schedule from "../models/Schedule.js";
import AppError from "../utills/AppError.js";
import { isTimeWithinRange } from "../utills/time.js";
import emailService from "./email.service.js";


const bookAppointment = async (patientId, data) => {
  const { doctorId, appointmentDate, appointmentTime, reason } = data;

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new AppError("Doctor not found.", 404);
  }

  const day = new Date(appointmentDate).toLocaleDateString("en-US", {
    weekday: "long",
  });

  const schedule = await Schedule.findOne({
    doctor: doctorId,
    day,
    isAvailable: true,
  });

  if (
    !schedule ||
    !isTimeWithinRange(
      appointmentTime,
      schedule.startTime,
      schedule.endTime,
    )
  ) {
    throw new AppError(
      "Doctor is unavailable at the selected time.",
      400,
    );
  }

  const existingAppointment = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate,
    appointmentTime,
    status: {
      $in: ["pending", "accepted"],
    },
  });

  if (existingAppointment) {
    throw new AppError(
      "This time slot has already been booked.",
      409,
    );
  }

  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    appointmentDate,
    appointmentTime,
    reason,
  });

  const populatedAppointment = await Appointment.findById(
    appointment._id,
  )
    .populate("patient", "firstName lastName email phone")
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "firstName lastName email",
      },
    });

  // Send email notifications
  try {
    await emailService.sendAppointmentBookedEmail(
      populatedAppointment,
    );

    await emailService.sendDoctorNewAppointmentEmail(
      populatedAppointment,
    );
  } catch (error) {
    console.error(
      "Appointment created, but email notification failed:",
      error.message,
    );
  }

  return populatedAppointment;
};


const getPatientAppointments = async (patientId) => {
  return await Appointment.find({ patient: patientId })
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "firstName lastName email",
      },
    })
    .sort({ appointmentDate: -1 });
};


const getDoctorAppointments = async (doctorUserId) => {
  const doctor = await Doctor.findOne({ user: doctorUserId });

  if (!doctor) {
    throw new AppError("Doctor profile not found.", 404);
  }

  return await Appointment.find({
    doctor: doctor._id,
  })
    .populate("patient", "firstName lastName email phone")
    .sort({ appointmentDate: -1 });
};


const updateAppointmentStatus = async (
  appointmentId,
  doctorUserId,
  status,
) => {
  const doctor = await Doctor.findOne({ user: doctorUserId });

  if (!doctor) {
    throw new AppError("Doctor profile not found.", 404);
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    doctor: doctor._id,
  });

  if (!appointment) {
    throw new AppError("Appointment not found.", 404);
  }

  appointment.status = status;

  await appointment.save();

  const populatedAppointment = await Appointment.findById(
    appointment._id,
  )
    .populate("patient", "firstName lastName email phone")
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "firstName lastName email",
      },
    });

  // Notify patient about status change
  try {
    await emailService.sendAppointmentStatusEmail(
      populatedAppointment,
    );
  } catch (error) {
    console.error(
      "Appointment status updated, but email notification failed:",
      error.message,
    );
  }

  return populatedAppointment;
};


const cancelAppointment = async (appointmentId, patientId) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patient: patientId,
  });

  if (!appointment) {
    throw new AppError("Appointment not found.", 404);
  }

  appointment.status = "cancelled";

  await appointment.save();

  const populatedAppointment = await Appointment.findById(
    appointment._id,
  )
    .populate("patient", "firstName lastName email phone")
    .populate({
      path: "doctor",
      populate: {
        path: "user",
        select: "firstName lastName email",
      },
    });

  // Notify doctor about cancellation
  try {
    await emailService.sendAppointmentCancellationEmail(
      populatedAppointment,
    );
  } catch (error) {
    console.error(
      "Appointment cancelled, but email notification failed:",
      error.message,
    );
  }

  return populatedAppointment;
};


export default {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
};