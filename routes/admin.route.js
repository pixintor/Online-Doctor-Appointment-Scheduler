const express = require("express");

const router = express.Router();

const adminController =
  require("../controllers/admin.controller");

const protect =
  require("../middleware/auth.middleware");

const authorize =
  require("../middleware/role.middleware");

router.use(protect);
router.use(authorize("admin"));

router.get(
  "/users",
  adminController.getAllUsers
);

router.get(
  "/users/:id",
  adminController.getUserById
);

router.patch(
  "/users/:id/deactivate",
  adminController.deactivateUser
);

router.patch(
  "/users/:id/activate",
  adminController.activateUser
);

router.get(
  "/doctors",
  adminController.getAllDoctors
);

router.get(
  "/doctors/:id",
  adminController.getDoctorById
);

router.post(
  "/doctors",
  adminController.createDoctor
);

router.patch(
  "/doctors/:id",
  adminController.updateDoctor
);

router.delete(
  "/doctors/:id",
  adminController.deleteDoctor
);

router.get(
  "/patients",
  adminController.getAllPatients
);

router.get(
  "/patients/:id",
  adminController.getPatientById
);

router.get(
  "/appointments",
  adminController.getAllAppointments
);

router.get(
  "/reports/summary",
  adminController.getSummaryReport
);

router.get(
  "/reports/appointments",
  adminController.getAppointmentReport
);

router.get(
  "/reports/doctors",
  adminController.getDoctorReport
);


module.exports = router;

