import mongoose from "mongoose";

const projectStatusSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

projectStatusSchema.pre("save", function (next) {
  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  if (this.status) {
    this.status = capitalizeWords(this.status);
  };

  next();
});

export default mongoose.model("ProjectStatus", projectStatusSchema);
