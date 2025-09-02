import express from "express";
import { leaveBalance } from "../controllers/leaveBalance.controller.js";
import { authenticateUser } from "../middleware/newAuth.middleware.js";

const router = express.Router();

router.get("/leaveBalance/:employeeId", authenticateUser, leaveBalance);

export default router;