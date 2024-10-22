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
  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});

export default mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);
