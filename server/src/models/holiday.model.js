import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    type: {
      type: String,
      default: "Holiday",
      trim: true,
    },
    date: {
      type: String,
      trim: true,
      required: true,
      index: true,
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

holidaySchema.pre("save", function (next) {
  const capitalizeWords = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (this.reason) {
    this.reason = capitalizeWords(this.reason);
  };

  next();
});

export default mongoose.model("Holiday", holidaySchema);

