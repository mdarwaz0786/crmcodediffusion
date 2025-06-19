import express from "express";
import { leaveBalance } from "../controllers/leaveBalance.controller.js";

const router = express.Router();

router.get("/leaveBalance/:employeeId", leaveBalance);

export default router;