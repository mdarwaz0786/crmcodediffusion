import express from "express";
import { createProjectDeployment, deleteProjectDeployment, fetchAllExpiringDeployment, fetchAllProjectDeployment, fetchSingleProjectDeployment, updateProjectDeployment } from "../controllers/projectDeployment.controller.js";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['websiteName', 'websiteLink', 'client', 'domainPurchaseDate', 'domainExpiryDate', 'domainExpireIn', 'domainExpiryStatus', 'hostingPurchaseDate', 'hostingExpiryDate', 'hostingExpireIn', 'hostingExpiryStatus', 'sslPurchaseDate', 'sslExpiryDate', 'sslExpireIn', 'sslExpiryStatus'];

// router object
const router = express.Router();

// routes
router.post("/create-projectDeployment", isLoggedIn, checkMasterActionPermission("projectDeployment", "create"), createProjectDeployment);
router.get("/all-projectDeployment", isLoggedIn, fetchAllProjectDeployment);
router.get("/all-expiring-projectDeployment", isLoggedIn, fetchAllExpiringDeployment);
router.get("/single-projectDeployment/:id", isLoggedIn, fetchSingleProjectDeployment);
router.put("/update-projectDeployment/:id", isLoggedIn, checkMasterActionPermission("projectDeployment", "update"), checkFieldUpdatePermission('projectDeployment', fields), updateProjectDeployment);
router.delete("/delete-projectDeployment/:id", isLoggedIn, checkMasterActionPermission("projectDeployment", "delete"), deleteProjectDeployment);

export default router;




