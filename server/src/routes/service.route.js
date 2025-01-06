import express from "express";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import { createService, deleteService, getAllServices, getServiceById, updateService } from "../controllers/service.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-Service", isLoggedIn, createService);
router.get("/all-Service", isLoggedIn, getAllServices);
router.get("/single-service/:id", isLoggedIn, getServiceById);
router.put("/update-service/:id", isLoggedIn, updateService);
router.delete("/delete-service/:id", isLoggedIn, deleteService);

export default router;





