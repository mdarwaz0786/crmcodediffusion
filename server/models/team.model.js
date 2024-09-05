import mongoose from "mongoose";
import bcrypt from "bcrypt";

const teamSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    joining: {
      type: String,
    },
    dob: {
      type: String,
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    reportingTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Hash the password before saving the document
teamSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    };

    // Helper function to capitalize first letter of each word
    const capitalizeWords = (str) => {
      return str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    };

    if (this.name) {
      this.name = capitalizeWords(this.name);
    };

    if (this.email) {
      this.email = this.email.toLowerCase();
    };

    next();

  } catch (error) {
    next(error);
  };
});

export default mongoose.model("Team", teamSchema);
