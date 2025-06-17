import mongoose from "mongoose";

const leedsSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
    },
    lname: {
      type: String,
    },
    mobile: {
      type: String,
    },
    email: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Leed", leedsSchema);