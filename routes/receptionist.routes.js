const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const receptionistController =
  require("../controllers/receptionist.controller");

router.use(protect);
router.use(
  authorize("receptionist", "admin")
);

router.post(
  "/patients",
  receptionistController.registerPatient
);

router.get(
  "/patients/search",
  receptionistController.searchPatients
);

router.get(
  "/appointments/today",
  receptionistController.getTodaysAppointments
);

router.get(
  "/appointments",
  receptionistController.getAppointments
);

router.get(
  "/appointments/:id/slip",
  receptionistController.getAppointmentSlip
);

router.get(
  "/appointments/:id",
  receptionistController.getAppointmentById
);

router.get(
  "/doctors/:doctorId/calendar",
  receptionistController.getDoctorCalendar
);

module.exports = router;