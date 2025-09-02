import express from "express";
import { createRole, deleteRole, fetchAllRole, fetchSingleRole, updateRole } from "../controllers/role.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'permissions'];

// router object
const router = express.Router();

// routes
router.post("/create-role", authenticateUser, checkMasterActionPermission("role", "create"), createRole);
router.get("/all-role", authenticateUser, fetchAllRole);
router.get("/single-role/:id", authenticateUser, fetchSingleRole);
router.put("/update-role/:id", authenticateUser, checkMasterActionPermission("role", "update"), checkFieldUpdatePermission('role', fields), updateRole);
router.delete("/delete-role/:id", authenticateUser, checkMasterActionPermission("role", "delete"), deleteRole);

export default router;