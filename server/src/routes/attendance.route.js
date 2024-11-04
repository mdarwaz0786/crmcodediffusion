import express from "express";
import { calculateMonthlySalary, createAttendance, deleteAttendance, fetchAllAttendance, fetchSingleAttendance, updateAttendance } from "../controllers/attendance.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-attendance", createAttendance);
router.get("/all-attendance", fetchAllAttendance);
router.get("/single-attendance/:id", fetchSingleAttendance);
router.put("/update-attendance/:id", updateAttendance);
router.delete("/delete-attendance/:id", deleteAttendance);
router.get("/salary/:employeeId/:year/:month", calculateMonthlySalary);

export default router;




