import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    joining: {
      type: String,
    },
    dob: {
      type: String,
    },
    monthlySalary: {
      type: String,
      trim: true,
    },
    UAN: {
      type: String,
      trim: true,
    },
    PAN: {
      type: String,
      trim: true,
    },
    bankAccount: {
      type: String,
      trim: true,
    },
    workingHoursPerDay: {
      type: String,
      default: "08:30",
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficeLocation",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    allotedLeaveBalance: {
      type: String,
      default: "2",
    },
    currentLeaveBalance: {
      type: String,
      default: "2",
    },
    usedLeaveBalance: {
      type: String,
      default: "0",
    },
    approvedLeaves: {
      type: [{
        date: { type: String },
        reason: { type: String },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        isUtilized: { type: Boolean, default: false },
      }],
      default: [],
    },
    leaveBalanceUsedHistory: {
      type: [{
        date: { type: String },
        previousBalance: { type: String },
        deductedBalance: { type: String },
        updatedBalance: { type: String },
        reason: { type: String, trim: true },
      }],
      default: [],
    },
    eligibleCompOffDate: {
      type: [{
        date: { type: String },
        reason: { type: String, trim: true },
        isApplied: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: false },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        isUtilized: { type: Boolean, default: false },
        utilizedDate: { type: String },
      }],
      default: [],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    reportingTo: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

teamSchema.pre("save", async function (next) {
  try {
    const capitalizeWords = (string) => {
      if (!string) return "";
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    if (this.name) {
      this.name = capitalizeWords(this.name);
    };

    if (this.email) {
      this.email = this.email.toLowerCase();
    };

    next();

  } catch (error) {
    next(error);
  };
});

const Team = mongoose.model("Team", teamSchema);

export default Team;

