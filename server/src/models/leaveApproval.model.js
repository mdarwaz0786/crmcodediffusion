import mongoose from "mongoose";

const leaveApprovalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    startDate: {
      type: String,
      required: true,
      indxe: true,
    },
    endDate: {
      type: String,
      required: true,
      index: true,
    },
    leaveStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    leaveDuration: {
      type: Number,
    },
    reason: {
      type: String,
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

export default mongoose.model("LeaveApproval", leaveApprovalSchema);
