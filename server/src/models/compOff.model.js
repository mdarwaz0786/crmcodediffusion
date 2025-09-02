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
    compOffDate: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
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

export default mongoose.model("CompOff", compOffSchema);