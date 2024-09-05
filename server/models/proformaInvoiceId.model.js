import mongoose from "mongoose";

const proformaInvoiceIdSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    sequence: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

export default mongoose.model("ProformaInvoiceId", proformaInvoiceIdSchema);


