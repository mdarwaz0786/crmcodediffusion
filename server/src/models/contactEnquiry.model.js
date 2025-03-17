import mongoose from "mongoose";

const contactEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    mobile: {
      type: String,
      trim: true,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: [
        "Web Designing",
        "Web Development",
        "E-Commerce Solution",
        "Mobile Application",
        "Social Media Optimization",
        "Industrial Trainning",
      ],
    },
  },
  {
    timestamps: true,
  },
);

contactEnquirySchema.pre("save", async function (next) {
  try {
    const capitalizeWords = (string) => {
      if (!string) return "";
      return string.charAt(0).toUpperCase() + string.slice(1);
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

export default mongoose.model("ContactEnquiry", contactEnquirySchema);

