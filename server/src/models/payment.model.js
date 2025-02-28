// models/payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    proformaInvoiceId: {
      type: String,
    },
    proformaInvoiceDate: {
      type: String,
    },
    tax: {
      type: String,
      enum: ["Inclusive", "Exclusive"],
      trim: true,
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficeLocation",
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
    companyName: {
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
    subtotal: {
      type: String,
      default: 0,
    },
    CGST: {
      type: String,
      default: 0,
    },
    SGST: {
      type: String,
      default: 0,
    },
    IGST: {
      type: String,
      default: 0,
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
    failureReason: {
      type: String,
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
