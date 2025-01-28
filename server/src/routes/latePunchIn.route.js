import express from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { createLatePunchIn, deleteLatePunchIn, getAllLatePunchIns, getLatePunchInById, getPendingPunchInRequests, updateLatePunchIn } from "../controllers/latePunchIn.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-latePunchIn", isLoggedIn, createLatePunchIn);
router.get("/all-latePunchIn", isLoggedIn, getAllLatePunchIns);
router.get("/single-latePunchIn/:id", isLoggedIn, getLatePunchInById);
router.get("/pending-latePunchIn", isLoggedIn, getPendingPunchInRequests);
router.put("/update-latePunchIn/:id", isLoggedIn, updateLatePunchIn);
router.delete("/delete-latePunchIn/:id", isLoggedIn, deleteLatePunchIn);

export default router;