import express from "express";
import multer from "multer";
import { createTicket, deleteTicket, fetchAllTickets, fetchSingleTicket, updateTicket } from "../controllers/ticket.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const fields = [
  "status",
  "assignedTo",
  "resolutionDetails",
];

// router object
const router = express.Router();

// routes
router.post("/create-ticket", authenticateUser, checkMasterActionPermission("ticket", "create"), upload.single("image"), createTicket);
router.get("/all-ticket", authenticateUser, fetchAllTickets);
router.get("/single-ticket/:id", authenticateUser, fetchSingleTicket);
router.put("/update-ticket/:id", authenticateUser, checkMasterActionPermission("ticket", "update"), checkFieldUpdatePermission('ticket', fields), upload.single("image"), updateTicket);
router.delete("/delete-ticket/:id", authenticateUser, checkMasterActionPermission("ticket", "delete"), deleteTicket);

export default router;