import express from "express";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import { createTicket, deleteTicket, fetchAllTickets, fetchSingleTicket, updateTicket } from "../controllers/ticket.controller.js";

// router object
const router = express.Router();

// routes
router.post("/create-ticket", isLoggedIn, createTicket);
router.get("/all-ticket", isLoggedIn, fetchAllTickets);
router.get("/single-ticket/:id", isLoggedIn, fetchSingleTicket);
router.put("/update-ticket/:id", isLoggedIn, updateTicket);
router.delete("/delete-ticket/:id", isLoggedIn, deleteTicket);

export default router;