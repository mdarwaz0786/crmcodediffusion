// routes/paymentRoutes.js
import express from "express";
import { paymentSuccess, paymentFailure } from "../controllers/payment.controller.js";
const router = express.Router();

router.post("/success", paymentSuccess);
router.post("/failure", paymentFailure);

export default router;
