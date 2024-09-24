import express from "express";
import { testController } from "../controllers/test.controller.js";

// router object
const router = express.Router();

// routes
router.get("/test", testController);

export default router;