import mongoose from "mongoose";

const workSummarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("WorkSummary", workSummarySchema);
