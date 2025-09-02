import express from "express";
import { createAttendance, deleteAttendance, fetchAllAttendance, fetchMonthlyStatistic, fetchSingleAttendance, updateAttendance } from "../controllers/attendance.controller.js";
import { authenticateUser } from "../middleware/newAuth.middleware.js";

// router object
const router = express.Router();

// routes
router.post("/create-attendance", authenticateUser, createAttendance);
router.get("/all-attendance", authenticateUser, fetchAllAttendance);
router.get("/single-attendance/:id", authenticateUser, fetchSingleAttendance);
router.get("/monthly-statistic", authenticateUser, fetchMonthlyStatistic);
router.put("/update-attendance", authenticateUser, updateAttendance);
router.delete("/delete-attendance/:id", authenticateUser, deleteAttendance);

export default router;




