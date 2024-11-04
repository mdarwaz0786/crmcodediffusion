import mongoose from "mongoose";
import Employee from "../models/team.model.js";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    attendanceStatus: {
      type: String,
      enum: ["Present", "Absent", "Holiday", "Sunday"],
      default: "Absent",
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
    requiredHoursForDay: {
      type: String,
      default: function () {
        return this.employee?.requiredHoursPerDay || 8;
      },
    },
    halfDayLeaveApproved: {
      type: Boolean,
      default: false,
    },
    salaryDeductionForDay: {
      type: String,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to calculate total hours worked and salary deduction
attendanceSchema.pre("save", async function (next) {
  if (this.checkInTime && this.checkOutTime) {
    const [checkInH, checkInM] = this.checkInTime.split(":").map(Number);
    const [checkOutH, checkOutM] = this.checkOutTime.split(":").map(Number);
    const totalMinutesWorked = (checkOutH * 60 + checkOutM) - (checkInH * 60 + checkInM);
    const hoursWorked = Math.floor(totalMinutesWorked / 60);
    const minutesWorked = totalMinutesWorked % 60;
    this.totalHoursWorked = parseFloat((hoursWorked + minutesWorked / 60).toFixed(2));
  };

  const employee = await Employee.findById(this.employee);
  const dailyRate = employee.monthlySalary / 30;

  // No deduction for certain attendance statuses
  if (["On Leave", "Present", "Holiday", "Sunday"].includes(this.attendanceStatus)) {
    this.salaryDeductionForDay = 0;
  } else if (this.attendanceStatus === "Half Day" && !this.halfDayLeaveApproved) {
    this.salaryDeductionForDay = dailyRate / 2;
  } else if (this.attendanceStatus === "Absent") {
    this.salaryDeductionForDay = dailyRate;
  } else if (this.totalHoursWorked < this.requiredHoursForDay && this.attendanceStatus === "Present") {
    const deduction = ((this.requiredHoursForDay - this.totalHoursWorked) / this.requiredHoursForDay) * dailyRate;
    this.salaryDeductionForDay = deduction > 0 ? deduction : 0;
  };

  next();
});

export default mongoose.model("Attendance", attendanceSchema);
