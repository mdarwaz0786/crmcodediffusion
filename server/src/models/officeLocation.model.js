import mongoose from "mongoose";

const officeLocationSchema = new mongoose.Schema(
  {
    uniqueCode: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    websiteLink: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
    },
    noReplyEmail: {
      type: String,
      trim: true,
    },
    noReplyEmailAppPassword: {
      type: String,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    GSTNumber: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    accountName: {
      type: String,
      trim: true,
    },
    accountType: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    IFSCCode: {
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
    attendanceRadius: {
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
  const capitalizeWords = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});

officeLocationSchema.index({ uniqueCode: 1, company: 1 }, { unique: true });

export default mongoose.model("OfficeLocation", officeLocationSchema);