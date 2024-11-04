import express from "express";
import { createLeaveApproval, deleteLeaveApproval, fetchAllLeaveApproval, fetchSingleLeaveApproval, updateLeaveApproval } from "../controllers/leaveApproval.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-leaveApproval", createLeaveApproval);
router.get("/all-leaveApproval", fetchAllLeaveApproval);
router.get("/single-leaveApproval/:id", fetchSingleLeaveApproval);
router.put("/update-leaveApproval/:id", updateLeaveApproval);
router.delete("/delete-leaveApproval/:id", deleteLeaveApproval);

export default router;