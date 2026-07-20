import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Doctor Appointment API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/appointments", appointmentRoutes);

// Error middleware
app.use(errorHandler);

export default app;
