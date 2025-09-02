import mongoose from "mongoose";

const addOnServiceSchema = new mongoose.Schema(
  {
    clientName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    projectName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    serviceName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    totalProjectCost: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("AddOnService", addOnServiceSchema);
