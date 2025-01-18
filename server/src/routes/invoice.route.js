import express from "express";
import { createInvoice, deleteInvoice, fetchAllInvoice, fetchInvoiceByProject, fetchSingleInvoice, updateInvoice } from "../controllers/invoice.controller.js";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['invoiceId', 'project', 'amount', 'tax', 'date', 'CGST', 'SGST', 'IGST', 'total', 'subtotal', 'balanceDue'];

// router object
const router = express.Router();

// routes
router.post("/create-invoice", isLoggedIn, checkMasterActionPermission("invoice", "create"), createInvoice);
router.get("/all-invoice", isLoggedIn, fetchAllInvoice);
router.get("/single-invoice/:id", isLoggedIn, fetchSingleInvoice);
router.get("/byProject/:projectId", isLoggedIn, fetchInvoiceByProject);
router.put("/update-invoice/:id", isLoggedIn, checkMasterActionPermission("invoice", "update"), checkFieldUpdatePermission('invoice', fields), updateInvoice);
router.delete("/delete-invoice/:id", isLoggedIn, checkMasterActionPermission("invoice", "delete"), deleteInvoice);

export default router;