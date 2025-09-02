import express from "express";
import { createTechnology, deleteTechnology, fetchAllTechnology, fetchSingleTechnology, updateTechnology } from "../controllers/technology.controller.js";
import { authenticateUser } from "../middleware/newAuth.middleware.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-technology", authenticateUser, checkMasterActionPermission("technology", "create"), createTechnology);
router.get("/all-technology", authenticateUser, fetchAllTechnology);
router.get("/single-technology/:id", authenticateUser, fetchSingleTechnology);
router.put("/update-technology/:id", authenticateUser, checkMasterActionPermission("technology", "update"), checkFieldUpdatePermission('technology', fields), updateTechnology);
router.delete("/delete-technology/:id", authenticateUser, checkMasterActionPermission("technology", "delete"), deleteTechnology);

export default router;





