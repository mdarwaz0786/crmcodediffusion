import express from "express";
import { newCreateAttendance, newDeleteAttendance, newFetchAllAttendance, newFetchMonthlyStatistic, newFetchSingleAttendance, newUpdateAttendance, newUpdatePunchTimeAttendance } from "../controllers/newAttendance.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

// router object
const router = express.Router();

// routes
router.post("/create-newAttendance", isLoggedIn, newCreateAttendance);
router.get("/all-newAttendance", isLoggedIn, newFetchAllAttendance);
router.get("/single-newAttendance/:id", isLoggedIn, newFetchSingleAttendance);
router.get("/monthly-newStatistic", isLoggedIn, newFetchMonthlyStatistic);
router.put("/update-newAttendance", isLoggedIn, newUpdateAttendance);
router.put("/update-punchTime", isLoggedIn, newUpdatePunchTimeAttendance);
router.delete("/delete-newAttendance/:id", isLoggedIn, newDeleteAttendance);

export default router;




