import { Router } from "express";

import protect from "../middleware/auth.js";
import authorize from "../middleware/role.middleware.js";
import {
  createProfile,
  getDoctor,
  getDoctors,
  searchDoctor,
  updateProfile,
} from "../controllers/doctor.controller.js";

const router = Router();

// Public
router.get("/", getDoctors);

router.get("/search", searchDoctor);

router.get("/:id", getDoctor);

// Doctor only
router.post("/profile", protect, authorize("doctor"), createProfile);

router.put("/profile", protect, authorize("doctor"), updateProfile);

export default router;
