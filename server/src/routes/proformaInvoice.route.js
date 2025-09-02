import express from "express";
import { createInvoice, deleteInvoice, fetchAllInvoice, fetchSingleInvoice, updateInvoice } from "../controllers/proformaInvoice.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['tax', 'date', 'projectCost'];

// router object
const router = express.Router();

// routes
router.post("/create-proformaInvoice", authenticateUser, checkMasterActionPermission("proformaInvoice", "create"), createInvoice);
router.get("/all-proformaInvoice", authenticateUser, fetchAllInvoice);
router.get("/single-proformaInvoice/:id", authenticateUser, fetchSingleInvoice);
router.put("/update-proformaInvoice/:id", authenticateUser, checkMasterActionPermission("proformaInvoice", "update"), checkFieldUpdatePermission('proformaInvoice', fields), updateInvoice);
router.delete("/delete-proformaInvoice/:id", authenticateUser, checkMasterActionPermission("proformaInvoice", "delete"), deleteInvoice);

export default router;