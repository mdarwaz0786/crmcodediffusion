import express from "express";
import { createProjectPriority, deleteProjectPriority, fetchAllProjectPriority, fetchSingleProjectPriority, updateProjectPriority } from '../controllers/projectPriority.controller.js';
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-projectPriority", isLoggedIn, checkMasterActionPermission("projectPriority", "create"), createProjectPriority);
router.get("/all-projectPriority", isLoggedIn, fetchAllProjectPriority);
router.get("/single-projectPriority/:id", isLoggedIn, fetchSingleProjectPriority);
router.put("/update-projectPriority/:id", isLoggedIn, checkMasterActionPermission("projectPriority", "update"), checkFieldUpdatePermission('projectPriority', fields), updateProjectPriority);
router.delete("/delete-projectPriority/:id", isLoggedIn, checkMasterActionPermission("projectPriority", "delete"), deleteProjectPriority);

export default router;




