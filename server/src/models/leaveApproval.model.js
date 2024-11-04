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
    leaveType: {
      type: String,
      enum: ["Full Day", "Half Day"],
      default: "Full Day",
    },
    leaveApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    leaveStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("LeaveApproval", leaveApprovalSchema);
