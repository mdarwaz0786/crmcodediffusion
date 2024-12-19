import mongoose from "mongoose";

const leaveApprovalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Sick Leave", "Casual Leave", "Other"],
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
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("LeaveApproval", leaveApprovalSchema);
