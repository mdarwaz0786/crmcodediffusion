import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    employee: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    }],
    date: {
      type: String,
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    toAll: {
      type: Boolean,
      default: false,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Notification", notificationSchema);
