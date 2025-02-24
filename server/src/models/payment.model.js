// models/payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    proformaInvoiceId: {
      type: String,
    },
    projectName: {
      type: String,
      trim: true,
    },
    projectCost: {
      type: String,
      trim: true,
    },
    clientName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    GSTNumber: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    shipTo: {
      type: String,
      trim: true,
    },
    tax: {
      type: String,
      enum: ["Inclusive", "Exclusive"],
      trim: true,
    },
    amount: {
      type: Number,
      trim: true,
    },
    transactionId: {
      type: String,
      unique: true,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
      trim: true,
    },
    paymentDate: {
      type: Date,
    },
    payUResponse: {
      type: Object,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Payment", paymentSchema);
