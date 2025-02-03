import mongoose from "mongoose";

const purchaseInvoiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    amount: {
      type: String,
      trim: true,
    },
    bill: {
      type: [String],
    },
    date: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

purchaseInvoiceSchema.pre("save", function (next) {
  const capitalizeWords = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});

export default mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);
