import express from "express";
import { authenticateUser } from "../middleware/newAuth.middleware.js";
import { createLatePunchIn, deleteLatePunchIn, getAllLatePunchIns, getLatePunchInById, getPendingPunchInRequests, updateLatePunchIn } from "../controllers/latePunchIn.controller.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ["status"];

// router object
const router = express.Router();

// routes
router.post("/create-latePunchIn", authenticateUser, checkMasterActionPermission("latePunchIn", "create"), createLatePunchIn);
router.get("/all-latePunchIn", authenticateUser, getAllLatePunchIns);
router.get("/single-latePunchIn/:id", authenticateUser, getLatePunchInById);
router.get("/pending-latePunchIn", authenticateUser, getPendingPunchInRequests);
router.put("/update-latePunchIn/:id", authenticateUser, checkMasterActionPermission("latePunchIn", "update"), checkFieldUpdatePermission("latePunchIn", fields), updateLatePunchIn);
router.delete("/delete-latePunchIn/:id", authenticateUser, checkMasterActionPermission("latePunchIn", "delete"), deleteLatePunchIn);

export default router;