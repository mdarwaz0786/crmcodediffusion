import express from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { createWorkSummary, deleteWorkSummary, getAllWorkSummaries, getTodayWorkSummary, getWorkSummaryById, groupWorkSummaryByEmployee, updateWorkSummary } from "../controllers/workSummary.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-workSummary", isLoggedIn, createWorkSummary);
router.get("/all-workSummary", isLoggedIn, getAllWorkSummaries);
router.get("/today-workSummary", isLoggedIn, getTodayWorkSummary);
router.get("/byEmployee", isLoggedIn, groupWorkSummaryByEmployee);
router.get("/single-workSummary/:id", isLoggedIn, getWorkSummaryById);
router.put("/update-workSummary/:id", isLoggedIn, updateWorkSummary);
router.delete("/delete-workSummary/:id", isLoggedIn, deleteWorkSummary);

export default router;





