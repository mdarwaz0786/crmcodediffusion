import express from "express";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import { createAddOnService, deleteAddOnService, getAddOnServiceById, getAddOnServiceByProjectId, getAllAddOnServices, updateAddOnService } from "../controllers/addOnService.controller.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ["clientName", "projectName", "serviceName", "totalProjectCost"];

// router object
const router = express.Router();

// routes
router.post("/create-addOnService", authenticateUser, checkMasterActionPermission("addOnService", "create"), createAddOnService);
router.get("/all-addOnService", authenticateUser, getAllAddOnServices);
router.get("/single-addOnService/:id", authenticateUser, getAddOnServiceById);
router.get("/single-addOnService-byProjectId/:projectId", authenticateUser, getAddOnServiceByProjectId);
router.put("/update-addOnservice/:id", authenticateUser, checkMasterActionPermission("addOnService", "update"), checkFieldUpdatePermission('addOnService', fields), updateAddOnService);
router.delete("/delete-addOnService/:id", authenticateUser, checkMasterActionPermission("addOnService", "delete"), deleteAddOnService);

export default router;