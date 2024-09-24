import express from "express";
import { createAttendance, deleteAttendance, fetchAllAttendance, fetchSingleAttendance, updateAttendance } from "../controllers/attendance.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['employee', 'markedBy', 'attendance', 'date', 'checkInTime', 'checkOutTime', 'totalHoursWorked'];

// router object
const router = express.Router();

// routes
router.post("/create-attendance", isLoggedIn, checkMasterActionPermission("attendance", "create"), createAttendance);
router.get("/all-attendance", isLoggedIn, fetchAllAttendance);
router.get("/single-attendance/:id", isLoggedIn, fetchSingleAttendance);
router.put("/update-attendance/:id", isLoggedIn, checkMasterActionPermission("attendance", "update"), checkFieldUpdatePermission("attendance", fields), updateAttendance);
router.delete("/delete-attendance/:id", isLoggedIn, checkMasterActionPermission("attendance", "delete"), deleteAttendance);

export default router;




