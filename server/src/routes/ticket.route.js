import express from "express";
import { createTicket, deleteTicket, fetchAllTickets, fetchSingleTicket, updateTicket } from "../controllers/ticket.controller.js";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

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
];

// router object
const router = express.Router();

// routes
router.post("/create-ticket", isLoggedIn, checkMasterActionPermission("ticket", "create"), createTicket);
router.get("/all-ticket", isLoggedIn, fetchAllTickets);
router.get("/single-ticket/:id", isLoggedIn, fetchSingleTicket);
router.put("/update-ticket/:id", isLoggedIn, checkMasterActionPermission("ticket", "update"), checkFieldUpdatePermission('ticket', fields), updateTicket);
router.delete("/delete-ticket/:id", isLoggedIn, checkMasterActionPermission("ticket", "delete"), deleteTicket);

export default router;