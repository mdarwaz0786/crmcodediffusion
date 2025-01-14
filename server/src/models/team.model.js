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
    },
    UAN: {
      type: String,
    },
    PAN: {
      type: String,
    },
    bankAccount: {
      type: String,
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
      type: String,
      default: "IT",
    },
    leaveBalance: {
      type: String,
      default: "0",
    },
    leaves: [{
      type: String,
    }],
    compOff: [{
      type: String,
    }],
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    reportingTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    }],
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
      return string
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
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
