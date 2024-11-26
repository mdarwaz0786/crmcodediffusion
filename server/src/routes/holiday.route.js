import express from "express";
import { createHoliday, deleteHoliday, fetchAllHoliday, fetchSingleHoliday, fetchUpcomingHoliday, updateHoliday } from "../controllers/holiday.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

// router object
const router = express.Router();

// routes
router.post("/create-holiday", isLoggedIn, createHoliday);
router.get("/upcoming-holiday", isLoggedIn, fetchUpcomingHoliday);
router.get("/all-holiday", isLoggedIn, fetchAllHoliday);
router.get("/single-holiday/:id", isLoggedIn, fetchSingleHoliday);
router.put("/update-holiday/:id", isLoggedIn, updateHoliday);
router.delete("/delete-holiday/:id", isLoggedIn, deleteHoliday);

export default router;