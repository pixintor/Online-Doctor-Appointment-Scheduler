import { body } from "express-validator";

export const bookAppointmentValidator = [
  body("doctorId").notEmpty().withMessage("Doctor is required"),

  body("appointmentDate")
    .isISO8601()
    .withMessage("Valid appointment date is required"),

  body("appointmentTime")
    .notEmpty()
    .withMessage("Appointment time is required"),

  body("reason").trim().notEmpty().withMessage("Reason is required"),
];
