// controllers/paymentController.js
import Payment from "../models/payment.model.js";

export const paymentSuccess = async (req, res) => {
  const { txnid } = req.body;
  await Payment.findOneAndUpdate(
    { transactionId: txnid },
    { paymentStatus: "Success", paymentDate: new Date(), payUResponse: req.body },
    { new: true },
  );
  res.send("Payment Successful. Thank you!");
};

export const paymentFailure = async (req, res) => {
  const { txnid } = req.body;
  await Payment.findOneAndUpdate(
    { transactionId: txnid },
    { paymentStatus: "Failed", payUResponse: req.body },
  );
  res.send("Payment Failed. Please try again.");
};
