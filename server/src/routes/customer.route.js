import express from "express";
import { createCustomer, deleteCustomer, fetchAllCustomer, fetchSingleCustomer, loggedInCustomer, loginCustomer, updateCustomer } from "../controllers/customer.controller.js";
import { authenticateUser } from './../middleware/newAuth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'email', 'password', 'mobile', 'GSTNumber', 'state', 'companyName', 'address', 'role'];

// router object
const router = express.Router();

// routes
router.post("/create-customer", authenticateUser, checkMasterActionPermission("customer", "create"), createCustomer);
router.post("/login-customer", loginCustomer);
router.get("/loggedin-customer", authenticateUser, loggedInCustomer);
router.get("/all-customer", authenticateUser, fetchAllCustomer);
router.get("/single-customer/:id", authenticateUser, fetchSingleCustomer);
router.put("/update-customer/:id", authenticateUser, checkMasterActionPermission("customer", "update"), checkFieldUpdatePermission('customer', fields), updateCustomer);
router.delete("/delete-customer/:id", authenticateUser, checkMasterActionPermission("customer", "delete"), deleteCustomer);

export default router;




