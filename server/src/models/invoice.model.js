import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      unique: true,
    },
    tax: {
      type: String,
      enum: ["Inclusive", "Exclusive"],
      required: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficeLocation",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    amount: {
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
    proformaInvoiceDetails: {
      proformaInvoiceId: {
        type: String,
      },
      proformaInvoiceDate: {
        type: String,
      },
      transactionId: {
        type: String,
      },
      projectName: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true
      },
      phone: {
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
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Invoice", invoiceSchema);
