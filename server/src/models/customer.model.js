import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    GSTNumber: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

customerSchema.pre("save", function (next) {
  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  if (this.companyName) {
    this.companyName = capitalizeWords(this.companyName);
  };

  if (this.email) {
    this.email = this.email.toLowerCase();
  };

  next();
});

export default mongoose.model("Customer", customerSchema);
