import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  numberOfEmployee: {
    type: Number,
    required: true,
  },
  employeeIdPrefix: {
    type: String,
    required: true,
  },
  projectIdPrefix: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  punchInTime: {
    type: String,
    required: true,
  },
  punchOutTime: {
    type: String,
    required: true,
  },
  halfDayThreshold: {
    type: String,
    required: true,
  },
  weeklyOff: [{
    type: String,
    enum: ["Sunday", "Saturday"],
    required: true,
  }],
  paidLeavePerMonth: {
    type: String,
    required: true,
  },
  leaveSystemStartDate: {
    type: String,
  },
  allowMultiDevice: {
    type: Boolean,
    default: true,
  },
  deviceId: {
    type: String,
  },
  fcmToken: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model("Company", companySchema);
