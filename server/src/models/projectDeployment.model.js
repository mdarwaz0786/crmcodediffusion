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
  },
  {
    timestamps: true,
  },
);

projectDeploymentSchema.pre("save", function (next) {
  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  if (this.websiteName) {
    this.websiteName = capitalizeWords(this.websiteName);
  };

  next();
});

export default mongoose.model("ProjectDeployment", projectDeploymentSchema);
