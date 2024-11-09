import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    attendanceDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Holiday", "Sunday"],
      default: "Absent",
    },
    punchInTime: {
      type: String,
    },
    punchIn: {
      type: Boolean,
      default: false,
    },
    punchOutTime: {
      type: String,
    },
    punchOut: {
      type: Boolean,
      default: false,
    },
    hoursWorked: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Attendance", attendanceSchema);