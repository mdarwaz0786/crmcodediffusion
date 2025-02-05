import mongoose from "mongoose";

const compOffSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    attendanceDate: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("CompOff", compOffSchema);