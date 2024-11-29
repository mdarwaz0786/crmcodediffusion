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
      enum: ["Holiday", "Sunday"],
      required: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

holidaySchema.pre("save", function (next) {
  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  if (this.reason) {
    this.reason = capitalizeWords(this.reason);
  };

  next();
});

// Enforce unique employee + date combination to prevent duplicates
holidaySchema.index({ date: 1 }, { unique: true });

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;
