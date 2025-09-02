import express from "express";
import { createAppSetting, deleteAppSetting, getAllAppSetting, getSingleAppSetting, updateAppSetting } from "../controllers/appSetting.controller.js";
import { authenticateUser } from "../middleware/newAuth.middleware.js";

const router = express.Router();

router.post("/create-appSetting", authenticateUser, createAppSetting);
router.get("/all-appSetting", authenticateUser, getAllAppSetting);
router.get("/app-appSetting", getAllAppSetting);
router.get("/single-appSetting/:id", authenticateUser, getSingleAppSetting);
router.put("/update-appSetting/:id", authenticateUser, updateAppSetting);
router.delete("/delete-appSetting/:id", authenticateUser, deleteAppSetting);

export default router;