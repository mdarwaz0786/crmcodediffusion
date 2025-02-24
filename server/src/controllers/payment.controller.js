import mongoose from "mongoose";
import Payment from "../models/payment.model.js";

export const paymentSuccess = async (req, res) => {
  const { txnid } = req.body;

  // Start a session for the transaction
  const session = await mongoose.startSession();

  try {
    // Begin the transaction
    session.startTransaction();

    // Update the payment status to "Success"
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: txnid },
      {
        paymentStatus: "Success",
        paymentDate: new Date(),
        payUResponse: req.body,
      },
      { new: true, session }, // Add session here to make this part of the transaction
    );

    // Check if the payment record was found
    if (!updatedPayment) {
      await session.abortTransaction(); // Abort the transaction if payment record is not found
      return res.status(404).json({ success: false, message: "Payment record not found." });
    };

    // Commit the transaction if all updates are successful
    await session.commitTransaction();

    return res.status(200).json({ success: true, message: "Payment Successful. Thank you!" });
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction in case of error
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
  } finally {
    session.endSession(); // End the session
  };
};

export const paymentFailure = async (req, res) => {
  const { txnid } = req.body;

  // Start a session for the transaction
  const session = await mongoose.startSession();

  try {
    // Begin the transaction
    session.startTransaction();

    // Update the payment status to "Failed"
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: txnid },
      { paymentStatus: "Failed", payUResponse: req.body },
      { new: true, session }, // Add session here to make this part of the transaction
    );

    // Check if the payment record was found
    if (!updatedPayment) {
      await session.abortTransaction(); // Abort the transaction if payment record is not found
      return res.status(404).json({ success: false, message: "Payment record not found." });
    };

    // Commit the transaction if all updates are successful
    await session.commitTransaction();

    return res.status(400).json({ success: false, message: "Payment Failed. Please try again." });
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction in case of error
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
  } finally {
    session.endSession(); // End the session
  };
};
