import mongoose from "mongoose";

const projectPrioritySchema = new mongoose.Schema(
  {
    name: {
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

projectPrioritySchema.pre("save", function (next) {
  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});

export default mongoose.model("ProjectPriority", projectPrioritySchema);
