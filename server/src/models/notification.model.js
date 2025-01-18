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
    sendBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    message: {
      type: String,
      trim: true,
    },
    toAll: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Notification", notificationSchema);
