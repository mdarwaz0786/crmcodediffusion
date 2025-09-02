import express from "express";
import { createPlan, deletePlan, getPlanById, getPlans, updatePlan } from "../controllers/plan.controller.js";
import { authenticateUser } from "../middleware/newAuth.middleware.js";

// router object
const router = express.Router();

// routes
router.post("/create-plan", authenticateUser, createPlan);
router.get("/get-all-plan", authenticateUser, getPlans);
router.get("/get-single-plan/:id", authenticateUser, getPlanById);
router.put("/update-plan/:id", authenticateUser, updatePlan);
router.delete("/delete-plan/:id", authenticateUser, deletePlan);

export default router;