import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
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

departmentSchema.pre("save", function (next) {
  const capitalizeWords = (string) => {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});


export default mongoose.model("Department", departmentSchema);
