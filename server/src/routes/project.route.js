import express from "express";
import { createProject, deleteProject, fetchAllProject, fetchSingleProject, fetchWorkDetail, updateProject } from "../controllers/project.controller.js";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = [
  'projectId', 'projectName', 'customer', 'projectType', 'projectCategory', 'projectTiming', 'projectPriority', 'projectStatus', 'responsiblePerson',
  'teamLeader', 'technology', 'projectPrice', 'payment', 'totalPaid', 'totalDues', 'startDate', 'endDate', 'totalHour', 'workDetail', 'totalSpentHour', 'totalRemainingHour', 'description',
];

// router object
const router = express.Router();

// routes
router.post("/create-project", isLoggedIn, checkMasterActionPermission("project", "create"), createProject);
router.get("/all-project", isLoggedIn, fetchAllProject);
router.get("/work-detail", isLoggedIn, fetchWorkDetail);
router.get("/single-project/:id", isLoggedIn, fetchSingleProject);
router.put("/update-project/:id", isLoggedIn, checkMasterActionPermission("project", "update"), checkFieldUpdatePermission('project', fields), updateProject);
router.delete("/delete-project/:id", isLoggedIn, checkMasterActionPermission("project", "delete"), deleteProject);

export default router;




