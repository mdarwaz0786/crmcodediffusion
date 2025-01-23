import express from "express";
import multer from 'multer';
import { createHoliday, deleteHoliday, fetchAllHoliday, fetchSingleHoliday, fetchUpcomingHoliday, getHolidaysByMonth, updateHoliday, uploadHolidays } from "../controllers/holiday.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

// router object
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// routes
router.post("/create-holiday", isLoggedIn, createHoliday);
router.post("/upload-holiday", isLoggedIn, upload.single('file'), uploadHolidays);
router.get("/upcoming-holiday", isLoggedIn, fetchUpcomingHoliday);
router.get("/byMonth-holiday", isLoggedIn, getHolidaysByMonth);
router.get("/all-holiday", isLoggedIn, fetchAllHoliday);
router.get("/single-holiday/:id", isLoggedIn, fetchSingleHoliday);
router.put("/update-holiday/:id", isLoggedIn, updateHoliday);
router.delete("/delete-holiday/:id", isLoggedIn, deleteHoliday);

export default router;