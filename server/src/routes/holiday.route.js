import express from "express";
import { createHoliday, deleteHoliday, fetchAllHoliday, fetchSingleHoliday, updateHoliday } from "../controllers/holiday.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-holiday", createHoliday);
router.get("/all-holiday", fetchAllHoliday);
router.get("/single-holiday/:id", fetchSingleHoliday);
router.put("/update-holiday/:id", updateHoliday);
router.delete("/delete-holiday/:id", deleteHoliday);

export default router;