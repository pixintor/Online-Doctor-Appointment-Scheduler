import { Router } from "express";

import appointmentController from "../controllers/appointment.controller.js";
import authorize from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { bookAppointmentValidator } from "../validators/appointment.validator.js";
import protect from "../middleware/auth.js";

const router = Router();

// Patient
router.post(
  "/",
  protect,
  authorize("patient"),
  bookAppointmentValidator,
  validate,
  appointmentController.bookAppointment,
);

router.get(
  "/my",
  protect,
  authorize("patient"),
  appointmentController.getMyAppointments,
);

router.patch(
  "/:id/cancel",
  protect,
  authorize("patient"),
  appointmentController.cancelAppointment,
);

// Doctor
router.get(
  "/doctor",
  protect,
  authorize("doctor"),
  appointmentController.getDoctorAppointments,
);

router.patch(
  "/:id/status",
  protect,
  authorize("doctor"),
  appointmentController.updateStatus,
);

export default router;
