import express from "express";
import { createLeaveApproval, deleteLeaveApproval, fetchAllLeaveApproval, fetchSingleLeaveApproval, getLeaveApprovalByEmployee, getPendingLeaveApprovalRequests, updateLeaveApproval } from "../controllers/leaveApproval.controller.js";
import { authenticateUser } from "../middleware/newAuth.middleware.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";

// router object
const router = express.Router();

// routes
router.post("/create-leaveApproval", authenticateUser, checkMasterActionPermission("leaveApproval", "create"), createLeaveApproval);
router.get("/all-leaveApproval", authenticateUser, fetchAllLeaveApproval);
router.get("/employee-leaveApproval/:employeeId", authenticateUser, getLeaveApprovalByEmployee);
router.get("/single-leaveApproval/:id", authenticateUser, fetchSingleLeaveApproval);
router.get("/pending-leaveApproval", authenticateUser, getPendingLeaveApprovalRequests);
router.put("/update-leaveApproval", authenticateUser, checkMasterActionPermission("leaveApproval", "update"), updateLeaveApproval);
router.delete("/delete-leaveApproval/:id", authenticateUser, checkMasterActionPermission("leaveApproval", "delete"), deleteLeaveApproval);

export default router;