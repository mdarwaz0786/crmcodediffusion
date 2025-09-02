import express from "express";
import { createInvoice, deleteInvoice, fetchAllInvoice, fetchInvoiceByProject, fetchSingleInvoice, updateInvoice } from "../controllers/invoice.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['amount', 'tax', 'date'];

// router object
const router = express.Router();

// routes
router.post("/create-invoice", authenticateUser, checkMasterActionPermission("invoice", "create"), createInvoice);
router.get("/all-invoice", authenticateUser, fetchAllInvoice);
router.get("/single-invoice/:id", authenticateUser, fetchSingleInvoice);
router.get("/byProject/:projectId", authenticateUser, fetchInvoiceByProject);
router.put("/update-invoice/:id", authenticateUser, checkMasterActionPermission("invoice", "update"), checkFieldUpdatePermission('invoice', fields), updateInvoice);
router.delete("/delete-invoice/:id", authenticateUser, checkMasterActionPermission("invoice", "delete"), deleteInvoice);

export default router;