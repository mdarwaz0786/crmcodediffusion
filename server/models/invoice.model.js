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
          type: Number,
          required: true,
          trim: true,
        },
      },
    ],
    quantity: {
      type: Number,
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
      type: Number,
      default: 0,
    },
    CGST: {
      type: Number,
      default: 0,
    },
    SGST: {
      type: Number,
      default: 0,
    },
    IGST: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Invoice", invoiceSchema);
