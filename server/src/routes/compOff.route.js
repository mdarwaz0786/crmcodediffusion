import express from "express";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { createCompOff, deleteCompOff, getAllCompOffs, getCompOffById, updateCompOff } from "../controllers/compOff.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-compOff", isLoggedIn, createCompOff);
router.get("/all-compOff", isLoggedIn, getAllCompOffs);
router.get("/single-compOff/:id", isLoggedIn, getCompOffById);
router.put("/update-compOff/:id", isLoggedIn, updateCompOff);
router.delete("/delete-compOff/:id", isLoggedIn, deleteCompOff);

export default router;