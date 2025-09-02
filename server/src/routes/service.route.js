import express from "express";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import { createService, deleteService, getAllServices, getServiceById, updateService } from "../controllers/service.controller.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ["name", "description"]
// router object
const router = express.Router();

// routes
router.post("/create-Service", authenticateUser, checkMasterActionPermission("service", "create"), createService);
router.get("/all-Service", authenticateUser, getAllServices);
router.get("/single-service/:id", authenticateUser, getServiceById);
router.put("/update-service/:id", authenticateUser, checkMasterActionPermission("service", "update"), updateService);
router.delete("/delete-service/:id", authenticateUser, checkMasterActionPermission("service", "delete"), checkFieldUpdatePermission("service", fields), deleteService);

export default router;





