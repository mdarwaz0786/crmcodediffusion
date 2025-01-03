import mongoose from "mongoose";

const proformaInvoiceSchema = new mongoose.Schema(
  {
    proformaInvoiceId: {
      type: String,
    },
    date: {
      type: String,
      required: true,
    },
    tax: {
      type: String,
      enum: ["Inclusive", "Exclusive"],
      required: true,
    },
    projects: [
      {
        projectName: {
          type: String,
          required: true,
        },
        projectCost: {
          type: String,
          required: true,
        },
        quantity: {
          type: String,
          default: 1,
        },
      }
    ],
    clientName: {
      type: String,
      required: true,
    },
    GSTNumber: {
      type: String,
      required: true,
    },
    shipTo: {
      type: String,
      required: true,
    },
    billTo: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
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

export default mongoose.model("ProformaInvoice", proformaInvoiceSchema);
