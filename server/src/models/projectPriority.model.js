import mongoose from "mongoose";

const projectPrioritySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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

projectPrioritySchema.pre("save", function (next) {
  const capitalizeWords = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});

projectPrioritySchema.index({ name: 1, company: 1 }, { unique: true });

export default mongoose.model("ProjectPriority", projectPrioritySchema);
