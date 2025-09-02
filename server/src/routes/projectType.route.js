import express from "express";
import { createProjectType, deleteProjectType, fetchAllProjectType, fetchSingleProjectType, updateProjectType } from "../controllers/projectType.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-projectType", authenticateUser, checkMasterActionPermission("projectType", "create"), createProjectType);
router.get("/all-projectType", authenticateUser, fetchAllProjectType);
router.get("/single-projectType/:id", authenticateUser, fetchSingleProjectType);
router.put("/update-projectType/:id", authenticateUser, checkMasterActionPermission("projectType", "update"), checkFieldUpdatePermission('projectType', fields), updateProjectType);
router.delete("/delete-projectType/:id", authenticateUser, checkMasterActionPermission("projectType", "delete"), deleteProjectType);

export default router;




