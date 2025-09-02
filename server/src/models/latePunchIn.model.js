import mongoose from "mongoose";

const latePunchInSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },
    attendanceDate: {
      type: String,
      required: true,
      index: true,
    },
    punchInTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("LatePunchIn", latePunchInSchema);
