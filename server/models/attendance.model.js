import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    attendance: {
      type: String,
      default: "Present",
    },
    date: {
      type: String,
    },
    checkInTime: {
      type: String,
    },
    checkOutTime: {
      type: String,
    },
    totalHoursWorked: {
      type: String,
    },
    lateBy: {
      type: String,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Attendance", attendanceSchema);


