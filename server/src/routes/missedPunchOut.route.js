import express from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { createMissedPunchOut, deleteMissedPunchOut, getAllMissedPunchOuts, getMissedPunchOutById, getPendingPunchOutRequests, updateMissedPunchOut } from "../controllers/missedPunchOut.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-missedPunchOut", isLoggedIn, createMissedPunchOut);
router.get("/all-missedPunchOut", isLoggedIn, getAllMissedPunchOuts);
router.get("/single-missedPunchOut/:id", isLoggedIn, getMissedPunchOutById);
router.get("/pending-missedPunchOut", isLoggedIn, getPendingPunchOutRequests);
router.put("/update-missedPunchOut/:id", isLoggedIn, updateMissedPunchOut);
router.delete("/delete-missedPunchOut/:id", isLoggedIn, deleteMissedPunchOut);

export default router;