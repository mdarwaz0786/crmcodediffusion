import express from "express";
import { createAppSetting, deleteAppSetting, getAllAppSetting, getSingleAppSetting, updateAppSetting } from "../controllers/appSetting.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-appSetting", isLoggedIn, createAppSetting);
router.get("/all-appSetting", isLoggedIn, getAllAppSetting);
router.get("/app-appSetting", getAllAppSetting);
router.get("/single-appSetting/:id", isLoggedIn, getSingleAppSetting);
router.put("/update-appSetting/:id", isLoggedIn, updateAppSetting);
router.delete("/delete-appSetting/:id", isLoggedIn, deleteAppSetting);

export default router;