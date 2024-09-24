import express from "express";
import { createTechnology, deleteTechnology, fetchAllTechnology, fetchSingleTechnology, updateTechnology } from "../controllers/technology.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'description'];

// router object
const router = express.Router();

// routes
router.post("/create-technology", isLoggedIn, checkMasterActionPermission("technology", "create"), createTechnology);
router.get("/all-technology", isLoggedIn, fetchAllTechnology);
router.get("/single-technology/:id", isLoggedIn, fetchSingleTechnology);
router.put("/update-technology/:id", isLoggedIn, checkMasterActionPermission("technology", "update"), checkFieldUpdatePermission('technology', fields), updateTechnology);
router.delete("/delete-technology/:id", isLoggedIn, checkMasterActionPermission("technology", "delete"), deleteTechnology);

export default router;





