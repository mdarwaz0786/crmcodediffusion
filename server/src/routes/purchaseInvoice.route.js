import express from "express";
import { createPurchaseInvoice, deletePurchaseInvoice, fetchAllPurchaseInvoice, fetchSinglePurchaseInvoice, updatePurchaseInvoice } from "../controllers/purchaseInvoice.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'amount', 'date', 'bill'];

// router object
const router = express.Router();

// routes
router.post("/create-purchaseInvoice", authenticateUser, checkMasterActionPermission("purchaseInvoice", "create"), createPurchaseInvoice);
router.get("/all-purchaseInvoice", authenticateUser, fetchAllPurchaseInvoice);
router.get("/single-purchaseInvoice/:id", authenticateUser, fetchSinglePurchaseInvoice);
router.put("/update-purchaseInvoice/:id", authenticateUser, checkMasterActionPermission("purchaseInvoice", "update"), checkFieldUpdatePermission('purchaseInvoice', fields), updatePurchaseInvoice);
router.delete("/delete-purchaseInvoice/:id", authenticateUser, checkMasterActionPermission("purchaseInvoice", "delete"), deletePurchaseInvoice);

export default router;




