import express from "express";
import { createPurchaseInvoice, deletePurchaseInvoice, fetchAllPurchaseInvoice, fetchSinglePurchaseInvoice, updatePurchaseInvoice } from "../controllers/purchaseInvoice.controller.js";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'amount', 'date', 'bill'];

// router object
const router = express.Router();

// routes
router.post("/create-purchaseInvoice", isLoggedIn, checkMasterActionPermission("purchaseInvoice", "create"), createPurchaseInvoice);
router.get("/all-purchaseInvoice", isLoggedIn, fetchAllPurchaseInvoice);
router.get("/single-purchaseInvoice/:id", isLoggedIn, fetchSinglePurchaseInvoice);
router.put("/update-purchaseInvoice/:id", isLoggedIn, checkMasterActionPermission("purchaseInvoice", "update"), checkFieldUpdatePermission('purchaseInvoice', fields), updatePurchaseInvoice);
router.delete("/delete-purchaseInvoice/:id", isLoggedIn, checkMasterActionPermission("purchaseInvoice", "delete"), deletePurchaseInvoice);

export default router;




