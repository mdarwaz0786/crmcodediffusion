import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  monthlySalary: {
    type: Number,
  },
  salaryPaid: {
    type: Boolean,
    default: false,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  salaryCalculationDetail: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

// Compound index to prevent duplicates
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Salary", salarySchema);
