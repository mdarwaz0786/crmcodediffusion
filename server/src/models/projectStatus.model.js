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
  const capitalizeWords = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  if (this.status) {
    this.status = capitalizeWords(this.status);
  };

  next();
});

export default mongoose.model("ProjectStatus", projectStatusSchema);
