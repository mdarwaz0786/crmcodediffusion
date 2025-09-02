import express from "express";
import { createProjectTiming, deleteProjectTiming, fetchAllProjectTiming, fetchSingleProjectTiming, updateProjectTiming } from './../controllers/ProjectTiming.Controller.js';
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-projectTiming", authenticateUser, checkMasterActionPermission("projectTiming", "create"), createProjectTiming);
router.get("/all-projectTiming", authenticateUser, fetchAllProjectTiming);
router.get("/single-projectTiming/:id", authenticateUser, fetchSingleProjectTiming);
router.put("/update-projectTiming/:id", authenticateUser, checkMasterActionPermission("projectTiming", "update"), checkFieldUpdatePermission('projectTiming', fields), updateProjectTiming);
router.delete("/delete-projectTiming/:id", authenticateUser, checkMasterActionPermission("projectTiming", "delete"), deleteProjectTiming);

export default router;




