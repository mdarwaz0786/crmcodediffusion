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
  const capitalizeWords = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
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
