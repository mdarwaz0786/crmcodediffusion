import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      trim: true,
      required: true,
    },
    type: {
      type: String,
      default: "Holiday",
    },
    date: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

holidaySchema.pre("save", function (next) {
  const capitalizeWords = (string) => {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join(" ");
  };

  if (this.reason) {
    this.reason = capitalizeWords(this.reason);
  };

  next();
});

export default mongoose.model("Holiday", holidaySchema);

