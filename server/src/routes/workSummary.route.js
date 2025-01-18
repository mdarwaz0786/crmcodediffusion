import express from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { createWorkSummary, deleteWorkSummary, getAllWorkSummaries, getTodayWorkSummary, getWorkSummaryById, updateWorkSummary } from "../controllers/workSummary.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-workSummary", createWorkSummary);
router.get("/all-workSummary", getAllWorkSummaries);
router.get("/today-workSummary", getTodayWorkSummary);
router.get("/single-workSummary/:id", isLoggedIn, getWorkSummaryById);
router.put("/update-workSummary/:id", isLoggedIn, updateWorkSummary);
router.delete("/delete-workSummary/:id", isLoggedIn, deleteWorkSummary);

export default router;





