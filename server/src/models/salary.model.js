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
  salaryPaid: {
    type: Boolean,
    default: false,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
});

export default mongoose.model("Salary", salarySchema);
