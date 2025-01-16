import express from "express";
import { createDepartment, deleteDepartment, fetchAllDepartment, fetchSingleDepartment, updateDepartment } from "../controllers/department.controller.js";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-department", isLoggedIn, checkMasterActionPermission("department", "create"), createDepartment);
router.get("/all-department", isLoggedIn, fetchAllDepartment);
router.get("/single-department/:id", isLoggedIn, fetchSingleDepartment);
router.put("/update-department/:id", isLoggedIn, checkMasterActionPermission("department", "update"), checkFieldUpdatePermission('department', fields), updateDepartment);
router.delete("/delete-department/:id", isLoggedIn, checkMasterActionPermission("department", "delete"), deleteDepartment);

export default router;





