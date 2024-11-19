import express from "express";
import { createAttendance, deleteAttendance, fetchAllAttendance, fetchMonthlyStatistic, fetchSingleAttendance, updateAttendance } from "../controllers/attendance.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

// router object
const router = express.Router();

// routes
router.post("/create-attendance", isLoggedIn, createAttendance);
router.get("/all-attendance", isLoggedIn, fetchAllAttendance);
router.get("/single-attendance/:id", isLoggedIn, fetchSingleAttendance);
router.get("/monthly-statistic", isLoggedIn, fetchMonthlyStatistic);
router.put("/update-attendance", isLoggedIn, updateAttendance);
router.delete("/delete-attendance/:id", isLoggedIn, deleteAttendance);

export default router;




