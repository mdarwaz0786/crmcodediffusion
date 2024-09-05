import express from "express";
import { createHoliday, markSundaysAsHoliday } from "../controllers/holiday.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import moment from "moment";

const router = express.Router();

// Route to create a new holiday and mark attendance as holiday with name for all employees
router.post("/create-holiday", isLoggedIn, createHoliday);

// Route to automatically mark Sunday as a holiday
router.post("/mark-sunday", async (req, res) => {
  try {
    // Check if today is Sunday (0 represents Sunday)
    if (moment().day() === 0) {
      await markSundaysAsHoliday();
      return res.status(200).json({ success: true, message: "Sunday marked as holiday successfully." });
    } else {
      return res.status(400).json({ success: false, message: "Today is not Sunday. This action is not allowed." });
    };
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error while marking Sunday as holiday.", error: error.message });
  };
});

export default router;
