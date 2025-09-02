import express from "express";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import { createProjectWork, deleteProjectWork, getGroupedProjectWork, getProjectWorkById, getProjectWorks, updateProjectWork } from "../controllers/projectWork.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-projectWork", authenticateUser, createProjectWork);
router.get("/all-projectWork", authenticateUser, getProjectWorks);
router.get("/single-projectWork/:id", authenticateUser, getProjectWorkById);
router.get("/byEmployee", authenticateUser, getGroupedProjectWork);
router.put("/update-projectWork/:id", authenticateUser, updateProjectWork);
router.delete("/delete-projectWork/:id", authenticateUser, deleteProjectWork);

export default router;