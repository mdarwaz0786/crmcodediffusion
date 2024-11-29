import mongoose from "mongoose";

const officeLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Code Diffusion Technologies",
      trim: true,
    },
    logo: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    latitude: {
      type: String,
      trim: true,
    },
    longitude: {
      type: String,
      trim: true,
    },
    addressLine1: {
      type: String,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    addressLine3: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

officeLocationSchema.pre("save", function (next) {
  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});

export default mongoose.model("OfficeLocation", officeLocationSchema);