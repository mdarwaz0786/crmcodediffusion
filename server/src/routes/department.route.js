import express from "express";
import { createDepartment, deleteDepartment, fetchAllDepartment, fetchSingleDepartment, updateDepartment } from "../controllers/department.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-department", authenticateUser, checkMasterActionPermission("department", "create"), createDepartment);
router.get("/all-department", authenticateUser, fetchAllDepartment);
router.get("/single-department/:id", authenticateUser, fetchSingleDepartment);
router.put("/update-department/:id", authenticateUser, checkMasterActionPermission("department", "update"), checkFieldUpdatePermission('department', fields), updateDepartment);
router.delete("/delete-department/:id", authenticateUser, checkMasterActionPermission("department", "delete"), deleteDepartment);

export default router;





