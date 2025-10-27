import express from "express";
import { markAttendanceDateRange, markAttendanceSingleDay, newCreateAttendance, newDeleteAttendance, newFetchAllAttendance, newFetchMonthlyStatistic, newFetchMonthlyStatisticMobile, newFetchSingleAttendance, newUpdateAttendance, newUpdatePunchTimeAttendance } from "../controllers/newAttendance.controller.js";
import { authenticateUser } from "../middleware/newAuth.middleware.js";

// router object
const router = express.Router();

// routes
router.post("/create-newAttendance", authenticateUser, newCreateAttendance);
router.get("/all-newAttendance", authenticateUser, newFetchAllAttendance);
router.get("/single-newAttendance/:id", authenticateUser, newFetchSingleAttendance);
router.get("/monthly-newStatistic", authenticateUser, newFetchMonthlyStatistic);
router.get("/monthly-newStatistic-mobile", authenticateUser, newFetchMonthlyStatisticMobile);
router.put("/update-newAttendance", authenticateUser, newUpdateAttendance);
router.delete("/delete-newAttendance/:id", authenticateUser, newDeleteAttendance);
router.post("/mark-attendanceDateRange", authenticateUser, markAttendanceDateRange);
router.post("/mark-attendanceSingleDay", authenticateUser, markAttendanceSingleDay);
router.put("/update-punchTime", authenticateUser, newUpdatePunchTimeAttendance);

export default router;




