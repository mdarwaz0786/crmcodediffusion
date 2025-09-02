import express from "express";
import { createNotification, deleteNotification, getNotificationById, getNotifications, getNotificationsByEmployee, updateNotification } from "../controllers/notification.controller.js";
import { authenticateUser } from "../middleware/newAuth.middleware.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ["message"];

// router object
const router = express.Router();

// routes
router.post("/create-notification", authenticateUser, checkMasterActionPermission("notification", "create"), createNotification);
router.get("/all-notification", authenticateUser, getNotifications);
router.get("/single-notification/:id", authenticateUser, getNotificationById);
router.get("/notificationByEmployee", authenticateUser, getNotificationsByEmployee);
router.put("/update-notification", authenticateUser, checkMasterActionPermission("notification", "update"), checkFieldUpdatePermission("notification", fields), updateNotification);
router.delete("/delete-notification", authenticateUser, checkMasterActionPermission("notification", "delete"), deleteNotification);

export default router;



