import express from "express";
import { createProjectCategory, deleteProjectCategory, fetchAllProjectCategory, fetchSingleProjectCategory, updateProjectCategory } from "../controllers/projectCategory.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-projectCategory", authenticateUser, checkMasterActionPermission("projectCategory", "create"), createProjectCategory);
router.get("/all-projectCategory", authenticateUser, fetchAllProjectCategory);
router.get("/single-projectCategory/:id", authenticateUser, fetchSingleProjectCategory);
router.put("/update-projectCategory/:id", authenticateUser, checkMasterActionPermission("projectCategory", "update"), checkFieldUpdatePermission('projectCategory', fields), updateProjectCategory);
router.delete("/delete-projectCategory/:id", authenticateUser, checkMasterActionPermission("projectCategory", "delete"), deleteProjectCategory);

export default router;




