import express from "express";
import { createProject, deleteProject, fetchAllProject, fetchSingleProject, updateProject } from "../controllers/project.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = [
  'projectName',
  'customer',
  'projectType',
  'projectCategory',
  'projectPriority',
  'projectStatus',
  'responsiblePerson',
  'teamLeader',
  'projectDeadline',
  'technology',
  'projectPrice',
  'totalHour',
  'description',
];

// router object
const router = express.Router();

// routes
router.post("/create-project", authenticateUser, checkMasterActionPermission("project", "create"), createProject);
router.get("/all-project", authenticateUser, fetchAllProject);
router.get("/single-project/:id", authenticateUser, fetchSingleProject);
router.put("/update-project/:id", authenticateUser, checkMasterActionPermission("project", "update"), checkFieldUpdatePermission('project', fields), updateProject);
router.delete("/delete-project/:id", authenticateUser, checkMasterActionPermission("project", "delete"), deleteProject);

export default router;




