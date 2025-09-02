import express from "express";
import { paymentSuccess, paymentFailure, getAllPayments, getPaymentById, updatePayment, deletePayment, redirectTo } from "../controllers/payment.controller.js";
import { authenticateUser } from "../middleware/newAuth.middleware.js";
import checkMasterActionPermission from "../middleware/masterActionPermission.middleware.js";
import checkFieldUpdatePermission from "../middleware/checkFieldUpdatePermission.middleware.js";

const fields = ["projectName"];

// Router object
const router = express.Router();

router.post("/success", paymentSuccess);
router.post("/failure", paymentFailure);
router.get("/payu-payment", redirectTo);
router.get("/all-payment", authenticateUser, getAllPayments);
router.get("/single-payment/:id", authenticateUser, getPaymentById);
router.put("/update-payment/:id", authenticateUser, checkMasterActionPermission("payment", "update"), checkFieldUpdatePermission("payment", fields), updatePayment);
router.delete("/delete-payment/:id", authenticateUser, checkMasterActionPermission("payment", "delete"), deletePayment);

export default router;
