const express = require("express");

const router = express.Router();

const patientController = require("../controllers/patient.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.get(
  "/me",
  authorize("patient"),
  patientController.getMyProfile
);

router.patch(
  "/me",
  authorize("patient"),
  patientController.updateMyProfile
);

router.patch(
  "/me/account",
  authorize("patient"),
  patientController.updateMyAccount
);

router.get(
  "/me/appointments",
  authorize("patient"),
  patientController.getMyAppointments
);

router.get(
  "/me/appointments/upcoming",
  authorize("patient"),
  patientController.getUpcomingAppointments
);

router.get(
  "/me/appointments/history",
  authorize("patient"),
  patientController.getAppointmentHistory
);

router.get(
  "/",
  authorize("admin", "receptionist"),
  patientController.getAllPatients
);

router.get(
  "/:id",
  authorize("admin", "receptionist"),
  patientController.getPatientById
);

router.patch(
  "/:id/deactivate",
  authorize("admin"),
  patientController.deactivatePatient
);


module.exports = router;

