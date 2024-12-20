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
      enum: ["Sick Leave", "Casual Leave", "Earned Leave", "Annual Leave", "Maternity Leave", "Paternity Leave", "Parental Leave", "Bereavement Leave", "Wedding Leave", "Relocation Leave", "Emergency Leave", "Other"],
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
