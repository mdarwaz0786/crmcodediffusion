import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    attendanceDate: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Holiday", "Sunday"],
      default: "Absent",
    },
    punchInTime: {
      type: String, // Format "HH:MM"
    },
    punchOutTime: {
      type: String, // Format "HH:MM"
    },
    hoursWorked: {
      type: String, // Format "HH:MM"
      default: "00:00",
    },
  },
  {
    timestamps: true,
  },
);

// Helper function to calculate hours worked in HH:MM format based on punch times
function calculateHoursWorked(punchIn, punchOut) {
  const [inHours, inMinutes] = punchIn.split(":").map(Number);
  const [outHours, outMinutes] = punchOut.split(":").map(Number);

  const inTotalMinutes = inHours * 60 + inMinutes;
  const outTotalMinutes = outHours * 60 + outMinutes;
  const totalMinutesWorked = Math.max(outTotalMinutes - inTotalMinutes, 0); // Ensure no negative values

  // Convert total minutes worked to HH:MM format
  const hours = Math.floor(totalMinutesWorked / 60);
  const minutes = totalMinutesWorked % 60;

  // Format hours and minutes as "HH:MM"
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Middleware to set `status` and calculate `hoursWorked`
attendanceSchema.pre("save", function (next) {
  // If it's a Holiday or Sunday, reset punch times and hours worked
  if (this.status === "Holiday" || this.status === "Sunday") {
    this.punchInTime = "";
    this.punchOutTime = "";
    this.hoursWorked = "00:00";
  } else if (this.punchInTime && this.punchOutTime) {
    // If both punchInTime and punchOutTime are filled, mark status as Present
    this.status = "Present";
    this.hoursWorked = calculateHoursWorked(this.punchInTime, this.punchOutTime);
  } else {
    // If punch times are missing, mark as Absent and set hours worked to 00:00
    this.status = "Absent";
    this.hoursWorked = "00:00";
  };

  next();
});

export default mongoose.model("Attendance", attendanceSchema);
