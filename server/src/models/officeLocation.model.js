import mongoose from "mongoose";

const officeLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Code Diffusion Technologies",
    },
    logo: {
      type: String,
    },
    email: {
      type: String,
    },
    contact: {
      type: String,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
    addressLine1: {
      type: String,
    },
    addressLine2: {
      type: String,
    },
    addressLine3: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("OfficeLocation", officeLocationSchema);