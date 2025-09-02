import express from "express";
import multer from 'multer';
import { createHoliday, deleteHoliday, fetchAllHoliday, fetchSingleHoliday, fetchUpcomingHoliday, getHolidaysByMonth, updateHoliday, uploadHolidays } from "../controllers/holiday.controller.js";
import { authenticateUser } from "../middleware/newAuth.middleware.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ["date", "reason"];

// router object
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// routes
router.post("/create-holiday", authenticateUser, checkMasterActionPermission("holiday", "create"), createHoliday);
router.post("/upload-holiday", authenticateUser, checkMasterActionPermission("holiday", "create"), upload.single('file'), uploadHolidays);
router.get("/upcoming-holiday", authenticateUser, fetchUpcomingHoliday);
router.get("/byMonth-holiday", authenticateUser, getHolidaysByMonth);
router.get("/all-holiday", authenticateUser, fetchAllHoliday);
router.get("/single-holiday/:id", authenticateUser, fetchSingleHoliday);
router.put("/update-holiday/:id", authenticateUser, checkMasterActionPermission("holiday", "update"), checkFieldUpdatePermission('holiday', fields), updateHoliday);
router.delete("/delete-holiday/:id", authenticateUser, checkMasterActionPermission("holiday", "delete"), deleteHoliday);

export default router;