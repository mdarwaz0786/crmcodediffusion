import mongoose from "mongoose";

const proformaInvoiceSchema = new mongoose.Schema(
  {
    proformaInvoiceId: {
      type: String,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    amount: {
      type: Number,
      required: true,
      trim: true,
    },
    tax: {
      type: String,
      enum: ["Inclusive", "Exclusive"],
      required: true,
    },
    CGST: {
      type: Number,
    },
    SGST: {
      type: Number,
    },
    IGST: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    balanceDue: {
      type: Number,
    },
    date: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ProformaInvoice", proformaInvoiceSchema);
