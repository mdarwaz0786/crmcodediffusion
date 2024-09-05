import mongoose from "mongoose";

const workHistorySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    teamMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    workDescription: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("WorkHistory", workHistorySchema);
