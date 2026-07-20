import { Router } from "express";

import authorize from "../middleware/role.middleware.js";
import protect from "../middleware/auth.js";
import {
  createSchedule,
  getSchedules,
  updateSchedule,
} from "../controllers/schedule.controller.js";

const router = Router();

// Public
router.get("/:doctorId", getSchedules);

// Doctor only
router.post("/", protect, authorize("doctor"), createSchedule);

router.put("/:id", protect, authorize("doctor"), updateSchedule);

export default router;
