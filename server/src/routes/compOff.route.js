import express from "express";
import { authenticateUser } from "../middleware/newAuth.middleware.js";
import { createCompOff, deleteCompOff, getAllCompOffs, getCompOffById, getPendingCompOffRequests, updateCompOff } from "../controllers/compOff.controller.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ["status"];

// router object
const router = express.Router();

// routes
router.post("/create-compOff", authenticateUser, checkMasterActionPermission("compOff", "create"), createCompOff);
router.get("/all-compOff", authenticateUser, getAllCompOffs);
router.get("/single-compOff/:id", authenticateUser, getCompOffById);
router.get("/pending-compOff", authenticateUser, getPendingCompOffRequests);
router.put("/update-compOff/:id", authenticateUser, checkMasterActionPermission("compOff", "update"), checkFieldUpdatePermission("compOff", fields), updateCompOff);
router.delete("/delete-compOff/:id", authenticateUser, checkMasterActionPermission("compOff", "delete"), deleteCompOff);

export default router;