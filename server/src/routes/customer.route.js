import express from "express";
import { createCustomer, deleteCustomer, fetchAllCustomer, fetchSingleCustomer, loggedInCustomer, loginCustomer, updateCustomer } from "../controllers/customer.controller.js";
import { isLoggedIn } from './../middleware/auth.middleware.js';
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ['name', 'email', 'password', 'mobile', 'GSTNumber', 'state', 'companyName', 'address', 'role', 'fcmToken'];

// router object
const router = express.Router();

// routes
router.post("/create-customer", isLoggedIn, checkMasterActionPermission("customer", "create"), createCustomer);
router.post("/login-customer", loginCustomer);
router.get("/loggedin-customer", isLoggedIn, loggedInCustomer);
router.get("/all-customer", isLoggedIn, fetchAllCustomer);
router.get("/single-customer/:id", isLoggedIn, fetchSingleCustomer);
router.put("/update-customer/:id", isLoggedIn, checkMasterActionPermission("customer", "update"), checkFieldUpdatePermission('customer', fields), updateCustomer);
router.delete("/delete-customer/:id", isLoggedIn, checkMasterActionPermission("customer", "delete"), deleteCustomer);

export default router;




