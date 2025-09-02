import express from "express";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import { createEnquiry, deleteEnquiry, getEnquiries, getEnquiryById, updateEnquiry } from "../controllers/contactEnquiry.controller.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

// router object
const router = express.Router();

const fields = ['name', 'email', 'mobile', 'message', 'serviceType'];

// routes
router.post("/create-enquiry", createEnquiry);
router.get("/all-enquiry", authenticateUser, getEnquiries);
router.get("/single-enquiry/:id", authenticateUser, getEnquiryById);
router.put("/update-enquiry/:id", authenticateUser, checkMasterActionPermission("enquiry", "update"), checkFieldUpdatePermission('enquiry', fields), updateEnquiry);
router.delete("/delete-enquiry/:id", authenticateUser, checkMasterActionPermission("enquiry", "delete"), deleteEnquiry);

export default router;




