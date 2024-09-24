import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
    },
    projects: [
      {
        project: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
          required: true,
        },
        amount: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    quantity: {
      type: String,
      default: 1,
    },
    tax: {
      type: String,
      enum: ["Inclusive", "Exclusive"],
      required: true,
    },
    date: {
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

export default mongoose.model("Invoice", invoiceSchema);
