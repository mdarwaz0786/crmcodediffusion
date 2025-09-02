import express from "express";
import { authenticateUser } from "../middleware/newAuth.middleware.js";
import { createWorkSummary, deleteWorkSummary, getAllWorkSummaries, getTodayWorkSummary, getWorkSummaryById, groupWorkSummaryByEmployee, updateWorkSummary } from "../controllers/workSummary.controller.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ["summary"];

// router object
const router = express.Router();

// routes
router.post("/create-workSummary", authenticateUser, checkMasterActionPermission("workSummary", "create"), createWorkSummary);
router.get("/all-workSummary", authenticateUser, getAllWorkSummaries);
router.get("/single-workSummary/:id", authenticateUser, getWorkSummaryById);
router.get("/today-workSummary", authenticateUser, getTodayWorkSummary);
router.get("/byEmployee", authenticateUser, groupWorkSummaryByEmployee);
router.put("/update-workSummary/:id", authenticateUser, checkMasterActionPermission("workSummary", "update"), checkFieldUpdatePermission("workSummary", fields), updateWorkSummary);
router.delete("/delete-workSummary/:id", authenticateUser, checkMasterActionPermission("workSummary", "delete"), deleteWorkSummary);

export default router;





