const express = require("express");

const router = express.Router();

const reportController =
  require("../controllers/report.controller");

const protect =
  require("../middleware/auth.middleware");

const authorize =
  require("../middleware/role.middleware");

router.use(protect);

router.get(
  "/summary",
  authorize("admin"),
  reportController.getSummaryReport
);

router.get(
  "/appointments",
  authorize("admin"),
  reportController.getAppointmentReport
);

router.get(
  "/appointments/daily",
  authorize("admin", "receptionist"),
  reportController.getDailyAppointmentReport
);

router.get(
  "/doctors",
  authorize("admin"),
  reportController.getDoctorReport
);

router.get(
  "/patients",
  authorize("admin"),
  reportController.getPatientReport
);

router.get(
  "/specialties",
  authorize("admin"),
  reportController.getSpecialtyReport
);

router.get(
  "/monthly",
  authorize("admin"),
  reportController.getMonthlyReport
);


module.exports = router;

