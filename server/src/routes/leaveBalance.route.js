import express from "express";
import { leaveBalance } from "../controllers/leaveBalance.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/leaveBalance/:employeeId", isLoggedIn, leaveBalance);

export default router;