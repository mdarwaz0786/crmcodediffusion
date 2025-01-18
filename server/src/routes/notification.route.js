import express from "express";
import { createNotification, deleteNotification, getNotificationById, getNotifications, getNotificationsByEmployeeOrAll, updateNotification } from "../controllers/notification.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

// router object
const router = express.Router();

// routes
router.post("/create-notification", isLoggedIn, createNotification);
router.get("/all-notification", isLoggedIn, getNotifications);
router.get("/single-notification/:id", isLoggedIn, getNotificationById);
router.get("/notificationByEmployee", isLoggedIn, getNotificationsByEmployeeOrAll);
router.get("/notificationByEmployee", isLoggedIn, getNotificationById);
router.put("/update-notification", isLoggedIn, updateNotification);
router.delete("/delete-notification", isLoggedIn, deleteNotification);

export default router;



