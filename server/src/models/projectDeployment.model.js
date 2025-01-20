import mongoose from "mongoose";

const projectDeploymentSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      trim: true,
    },
    websiteLink: {
      type: String,
      trim: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    domainPurchaseDate: {
      type: String,
    },
    domainExpiryDate: {
      type: String,
    },
    domainExpireIn: {
      type: String,
    },
    domainExpiryStatus: {
      type: String,
      enum: ["Live", "Expired"],
    },
    domainExpiryNotified: {
      type: Boolean,
      default: false,
    },
    hostingPurchaseDate: {
      type: String,
    },
    hostingExpiryDate: {
      type: String,
    },
    hostingExpireIn: {
      type: String,
    },
    hostingExpiryStatus: {
      type: String,
      enum: ["Live", "Expired"],
    },
    hostingExpiryNotified: {
      type: Boolean,
      default: false,
    },
    sslPurchaseDate: {
      type: String,
    },
    sslExpiryDate: {
      type: String,
    },
    sslExpireIn: {
      type: String,
    },
    sslExpiryStatus: {
      type: String,
      enum: ["Live", "Expired"],
    },
    sslExpiryNotified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Capitalize words in websiteName before saving
projectDeploymentSchema.pre("save", function (next) {
  const capitalizeWords = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join(" ");
  };

  if (this.websiteName) {
    this.websiteName = capitalizeWords(this.websiteName);
  };

  next();
});

export default mongoose.model("ProjectDeployment", projectDeploymentSchema);
