import express from "express";
import { createRole, deleteRole, fetchAllRole, fetchSingleRole, updateRole } from "../controllers/role.controller.js";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'permissions'];

// router object
const router = express.Router();

// routes
router.post("/create-role", isLoggedIn, checkMasterActionPermission("role", "create"), createRole);
router.get("/all-role", isLoggedIn, fetchAllRole);
router.get("/single-role/:id", isLoggedIn, fetchSingleRole);
router.put("/update-role/:id", isLoggedIn, checkMasterActionPermission("role", "update"), checkFieldUpdatePermission('role', fields), updateRole);
router.delete("/delete-role/:id", isLoggedIn, checkMasterActionPermission("role", "delete"), deleteRole);

export default router;