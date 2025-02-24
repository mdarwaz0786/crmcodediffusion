// routes/paymentRoutes.js
import express from "express";
import { paymentSuccess, paymentFailure, getAllPayments, getPaymentById, updatePayment, deletePayment, redirectTo } from "../controllers/payment.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js"

// Router object
const router = express.Router();

router.post("/success", paymentSuccess);
router.post("/failure", paymentFailure);
router.post("/redirect/:txnId", redirectTo);
router.get("/all-payment", isLoggedIn, getAllPayments);
router.get("/single-payment/:id", isLoggedIn, getPaymentById);
router.put("/update-payment/:id", isLoggedIn, updatePayment);
router.delete("/delete-payment/:id", isLoggedIn, deletePayment);

export default router;
