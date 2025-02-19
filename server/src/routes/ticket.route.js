import express from "express";
import multer from "multer";
import { createTicket, deleteTicket, fetchAllTickets, fetchSingleTicket, updateTicket } from "../controllers/ticket.controller.js";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const fields = [
  "ticketId",
  "title",
  "description",
  "status",
  "priority",
  "ticketType",
  "project",
  "assignedTo",
  "createdBy",
  "createdByModel",
  "resolutionDetails",
  "image",
];

// router object
const router = express.Router();

// routes
router.post("/create-ticket", isLoggedIn, checkMasterActionPermission("ticket", "create"), upload.single("image"), createTicket);
router.get("/all-ticket", isLoggedIn, fetchAllTickets);
router.get("/single-ticket/:id", isLoggedIn, fetchSingleTicket);
router.put("/update-ticket/:id", isLoggedIn, checkMasterActionPermission("ticket", "update"), upload.single("image"), checkFieldUpdatePermission('ticket', fields), updateTicket);
router.delete("/delete-ticket/:id", isLoggedIn, checkMasterActionPermission("ticket", "delete"), deleteTicket);

export default router;