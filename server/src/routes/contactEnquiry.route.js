import express from "express";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import { createEnquiry, deleteEnquiry, getEnquiries, getEnquiryById, updateEnquiry } from "../controllers/contactEnquiry.controller.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

// router object
const router = express.Router();

const fields = ['name', 'email', 'mobile', 'message', 'serviceType'];

// routes
router.post("/create-enquiry", createEnquiry);
router.get("/all-enquiry", isLoggedIn, getEnquiries);
router.get("/single-enquiry/:id", isLoggedIn, getEnquiryById);
router.put("/update-enquiry/:id", isLoggedIn, checkMasterActionPermission("enquiry", "update"), checkFieldUpdatePermission('enquiry', fields), updateEnquiry);
router.delete("/delete-enquiry/:id", isLoggedIn, checkMasterActionPermission("enquiry", "delete"), deleteEnquiry);

export default router;




