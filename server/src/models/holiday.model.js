import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    reason: {
      type: String,
    },
    type: {
      type: String,
      enum: ["Holiday", "Sunday"],
      required: true,
    },
    date: {
      type: String,
      required: true,
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

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;
