import mongoose from "mongoose";

const projectStatusSchema = new mongoose.Schema(
  {
    status: {
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

projectStatusSchema.pre("save", function (next) {
  const capitalizeWords = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  if (this.status) {
    this.status = capitalizeWords(this.status);
  };

  next();
});

projectStatusSchema.index({ name: 1, company: 1 }, { unique: true });

export default mongoose.model("ProjectStatus", projectStatusSchema);
