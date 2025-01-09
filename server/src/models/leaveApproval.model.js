import mongoose from "mongoose";

const leaveApprovalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    leaveApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
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
    }
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("LeaveApproval", leaveApprovalSchema);
