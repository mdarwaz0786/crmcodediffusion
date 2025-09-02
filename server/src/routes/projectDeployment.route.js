import express from "express";
import { createProjectDeployment, deleteProjectDeployment, fetchAllExpiringDeployment, fetchAllProjectDeployment, fetchSingleProjectDeployment, updateProjectDeployment } from "../controllers/projectDeployment.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['websiteName', 'websiteLink', 'client', 'domainPurchaseDate', 'domainExpiryDate', 'hostingPurchaseDate', 'hostingExpiryDate', 'sslPurchaseDate', 'sslExpiryDate'];

// router object
const router = express.Router();

// routes
router.post("/create-projectDeployment", authenticateUser, checkMasterActionPermission("projectDeployment", "create"), createProjectDeployment);
router.get("/all-projectDeployment", authenticateUser, fetchAllProjectDeployment);
router.get("/all-expiring-projectDeployment", authenticateUser, fetchAllExpiringDeployment);
router.get("/single-projectDeployment/:id", authenticateUser, fetchSingleProjectDeployment);
router.put("/update-projectDeployment/:id", authenticateUser, checkMasterActionPermission("projectDeployment", "update"), checkFieldUpdatePermission('projectDeployment', fields), updateProjectDeployment);
router.delete("/delete-projectDeployment/:id", authenticateUser, checkMasterActionPermission("projectDeployment", "delete"), deleteProjectDeployment);

export default router;




