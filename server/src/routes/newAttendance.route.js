import express from "express";
import { newCreateAttendance, newDeleteAttendance, newFetchAllAttendance, newFetchMonthlyStatistic, newFetchSingleAttendance, newUpdateAttendance } from "../controllers/newAttendance.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-newAttendance", newCreateAttendance);
router.get("/all-newAttendance", newFetchAllAttendance);
router.get("/single-newAttendance/:id", newFetchSingleAttendance);
router.get("/monthly-newStatistic", newFetchMonthlyStatistic);
router.put("/update-newAttendance", newUpdateAttendance);
router.delete("/delete-newAttendance/:id", newDeleteAttendance);

export default router;




