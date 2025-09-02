import express from "express";
import { createDesignation, deleteDesignation, fetchAllDesignation, fetchSingleDesignation, updateDesignation } from "../controllers/designation.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-designation", authenticateUser, checkMasterActionPermission("designation", "create"), createDesignation);
router.get("/all-designation", authenticateUser, fetchAllDesignation);
router.get("/single-designation/:id", authenticateUser, fetchSingleDesignation);
router.put("/update-designation/:id", authenticateUser, checkMasterActionPermission("designation", "update"), checkFieldUpdatePermission('designation', fields), updateDesignation);
router.delete("/delete-designation/:id", authenticateUser, checkMasterActionPermission("designation", "delete"), deleteDesignation);

export default router;





