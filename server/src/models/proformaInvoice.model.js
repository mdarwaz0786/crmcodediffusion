import mongoose from "mongoose";

const proformaInvoiceSchema = new mongoose.Schema(
  {
    proformaInvoiceId: {
      type: String,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    tax: {
      type: String,
      enum: ["Inclusive", "Exclusive"],
      required: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    projectCost: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    GSTNumber: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
    },
    shipTo: {
      type: String,
      required: true,
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
    total: {
      type: String,
      default: 0,
    },
    balanceDue: {
      type: String,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

proformaInvoiceSchema.index({ date: 1 });

export default mongoose.model("ProformaInvoice", proformaInvoiceSchema);
