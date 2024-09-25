import express from "express";
import { createInvoice, deleteInvoice, fetchAllInvoice, fetchSingleInvoice, updateInvoice } from "../controllers/proformaInvoice.controller.js";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['proformaInvoiceId', 'projects', 'quantity', 'tax', 'date', 'CGST', 'SGST', 'IGST', 'total', 'subtotal', 'balanceDue'];

// router object
const router = express.Router();

// routes
router.post("/create-proformaInvoice", isLoggedIn, checkMasterActionPermission("proformaInvoice", "create"), createInvoice);
router.get("/all-proformaInvoice", isLoggedIn, fetchAllInvoice);
router.get("/single-proformaInvoice/:id", isLoggedIn, fetchSingleInvoice);
router.put("/update-proformaInvoice/:id", isLoggedIn, checkMasterActionPermission("proformaInvoice", "update"), checkFieldUpdatePermission('proformaInvoice', fields), updateInvoice);
router.delete("/delete-proformaInvoice/:id", isLoggedIn, checkMasterActionPermission("proformaInvoice", "delete"), deleteInvoice);

export default router;