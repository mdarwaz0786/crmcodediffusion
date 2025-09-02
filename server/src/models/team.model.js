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
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    approvedLeaves: {
      type: [{
        date: { type: String },
        reason: { type: String },
      }],
      default: [],
    },
    eligibleCompOffDate: {
      type: [{
        attendanceDate: { type: String },
        reason: { type: String, trim: true },
        isApplied: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: false },
        compOffDate: { type: String },
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
    fcmToken: {
      type: String,
      default: null,
    },
    deviceId: {
      type: String,
      default: null,
    },
    allowMultiDevice: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
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

export default mongoose.model("Team", teamSchema);

