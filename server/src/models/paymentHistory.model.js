import mongoose from "mongoose";

const paymentHistorySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    teamMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    amount: {
      type: Number,
      default: 0,
      trim: true,
    },
    date: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("PaymentHistory", paymentHistorySchema);
