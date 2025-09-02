import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      trim: true,
    },
    projectId: {
      type: String,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    projectType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectType",
    },
    projectCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectCategory",
    },
    projectTiming: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectTiming",
    },
    projectPriority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectPriority",
    },
    projectStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectStatus",
    },
    technology: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Technology",
      },
    ],
    responsiblePerson: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    teamLeader: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    projectPrice: {
      type: Number,
      default: 0,
      trim: true,
    },
    projectDeadline: {
      type: String,
    },
    totalHour: {
      type: Number,
      default: 0,
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

projectSchema.pre("save", function (next) {
  if (this.isNew) {
    this.totalDues = this.projectPrice;
    this.totalRemainingHour = this.totalHour;
  };

  const capitalizeWords = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});

export default mongoose.model("Project", projectSchema);
