import express from "express";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import { createAddOnService, deleteAddOnService, getAddOnServiceById, getAllAddOnServices, updateAddOnService } from "../controllers/addOnService.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-addOnService", isLoggedIn, createAddOnService);
router.get("/all-addOnService", isLoggedIn, getAllAddOnServices);
router.get("/single-addOnService/:id", isLoggedIn, getAddOnServiceById);
router.put("/update-addOnservice/:id", isLoggedIn, updateAddOnService);
router.delete("/delete-addOnService/:id", isLoggedIn, deleteAddOnService);

export default router;