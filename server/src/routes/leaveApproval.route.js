import express from "express";
import { createLeaveApproval, deleteLeaveApproval, fetchAllLeaveApproval, fetchSingleLeaveApproval, updateLeaveApproval } from "../controllers/leaveApproval.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

// router object
const router = express.Router();

// routes
router.post("/create-leaveApproval", isLoggedIn, createLeaveApproval);
router.get("/all-leaveApproval", isLoggedIn, fetchAllLeaveApproval);
router.get("/single-leaveApproval/:id", isLoggedIn, fetchSingleLeaveApproval);
router.put("/update-leaveApproval", isLoggedIn, updateLeaveApproval);
router.delete("/delete-leaveApproval/:id", isLoggedIn, deleteLeaveApproval);

export default router;