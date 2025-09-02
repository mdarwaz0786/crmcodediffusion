import express from "express";
import { createProjectStatus, deleteProjectStatus, fetchAllProjectStatus, fetchSingleProjectStatus, updateProjectStatus } from "../controllers/projectStatus.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['status', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-projectStatus", authenticateUser, checkMasterActionPermission("projectStatus", "create"), createProjectStatus);
router.get("/all-projectStatus", authenticateUser, fetchAllProjectStatus);
router.get("/single-projectStatus/:id", authenticateUser, fetchSingleProjectStatus);
router.put("/update-projectStatus/:id", authenticateUser, checkMasterActionPermission("projectStatus", "update"), checkFieldUpdatePermission('projectStatus', fields), updateProjectStatus);
router.delete("/delete-projectStatus/:id", authenticateUser, checkMasterActionPermission("projectStatus", "delete"), deleteProjectStatus);

export default router;




