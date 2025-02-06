import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["Present", "Half Day", "Absent", "Holiday", "Sunday", "Saturday", "On Leave", "Comp Off"],
      default: "Present",
      index: true,
    },
    punchInTime: {
      type: String,
      default: null,
    },
    punchIn: {
      type: Boolean,
      default: false,
    },
    punchOutTime: {
      type: String,
      default: null,
    },
    punchOut: {
      type: Boolean,
      default: false,
    },
    hoursWorked: {
      type: String,
      default: "00:00",
    },
    lateIn: {
      type: String,
      default: "00:00",
    },
    dayName: {
      type: String,
    },
    isHoliday: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Enforce unique employee + date combination to prevent duplicates
attendanceSchema.index({ employee: 1, attendanceDate: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);