import express from "express";
import { authenticateUser } from "../middleware/newAuth.middleware.js";
import { createMissedPunchOut, deleteMissedPunchOut, getAllMissedPunchOuts, getMissedPunchOutById, getPendingPunchOutRequests, updateMissedPunchOut } from "../controllers/missedPunchOut.controller.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ["status"];

// router object
const router = express.Router();

// routes
router.post("/create-missedPunchOut", authenticateUser, createMissedPunchOut);
router.get("/all-missedPunchOut", authenticateUser, getAllMissedPunchOuts);
router.get("/single-missedPunchOut/:id", authenticateUser, getMissedPunchOutById);
router.get("/pending-missedPunchOut", authenticateUser, getPendingPunchOutRequests);
router.put("/update-missedPunchOut/:id", authenticateUser, checkMasterActionPermission("missedPunchOut", "update"), checkFieldUpdatePermission("missedPunchOut", fields), updateMissedPunchOut);
router.delete("/delete-missedPunchOut/:id", authenticateUser, checkMasterActionPermission("missedPunchOut", "delete"), deleteMissedPunchOut);

export default router;