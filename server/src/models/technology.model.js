import mongoose from "mongoose";

const technologySchema = new mongoose.Schema(
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

technologySchema.pre("save", function (next) {
  const capitalizeWords = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});

technologySchema.index({ name: 1, company: 1 }, { unique: true });

export default mongoose.model("Technology", technologySchema);
