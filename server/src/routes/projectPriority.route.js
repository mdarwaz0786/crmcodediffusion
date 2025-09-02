import express from "express";
import { createProjectPriority, deleteProjectPriority, fetchAllProjectPriority, fetchSingleProjectPriority, updateProjectPriority } from '../controllers/projectPriority.controller.js';
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-projectPriority", authenticateUser, checkMasterActionPermission("projectPriority", "create"), createProjectPriority);
router.get("/all-projectPriority", authenticateUser, fetchAllProjectPriority);
router.get("/single-projectPriority/:id", authenticateUser, fetchSingleProjectPriority);
router.put("/update-projectPriority/:id", authenticateUser, checkMasterActionPermission("projectPriority", "update"), checkFieldUpdatePermission('projectPriority', fields), updateProjectPriority);
router.delete("/delete-projectPriority/:id", authenticateUser, checkMasterActionPermission("projectPriority", "delete"), deleteProjectPriority);

export default router;




