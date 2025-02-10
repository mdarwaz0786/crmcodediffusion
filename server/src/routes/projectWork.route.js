import express from "express";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import { createProjectWork, deleteProjectWork, getProjectWorkById, getProjectWorks, updateProjectWork } from "../controllers/projectWork.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-projectWork", isLoggedIn, createProjectWork);
router.get("/all-projectWork", isLoggedIn, getProjectWorks);
router.get("/single-projectWork/:id", isLoggedIn, getProjectWorkById);
router.put("/update-projectWork/:id", isLoggedIn, updateProjectWork);
router.delete("/delete-projectWork/:id", isLoggedIn, deleteProjectWork);

export default router;