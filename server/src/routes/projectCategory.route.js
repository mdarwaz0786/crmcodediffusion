import express from "express";
import { createProjectCategory, deleteProjectCategory, fetchAllProjectCategory, fetchSingleProjectCategory, updateProjectCategory } from "../controllers/projectCategory.controller.js";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-projectCategory", isLoggedIn, checkMasterActionPermission("projectCategory", "create"), createProjectCategory);
router.get("/all-projectCategory", isLoggedIn, fetchAllProjectCategory);
router.get("/single-projectCategory/:id", isLoggedIn, fetchSingleProjectCategory);
router.put("/update-projectCategory/:id", isLoggedIn, checkMasterActionPermission("projectCategory", "update"), checkFieldUpdatePermission('projectCategory', fields), updateProjectCategory);
router.delete("/delete-projectCategory/:id", isLoggedIn, checkMasterActionPermission("projectCategory", "delete"), deleteProjectCategory);

export default router;




