import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      trim: true,
    },
    projectId: {
      type: String,
      unique: true,
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
    payment: [
      {
        teamMember: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
        },
        amount: {
          type: Number,
          default: 0,
          trim: true,
        },
        date: {
          type: String,
        },
      },
    ],
    totalPaid: {
      type: Number,
      default: 0,
    },
    totalDues: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
    totalHour: {
      type: Number,
      default: 0,
      trim: true,
    },
    workDetail: [
      {
        teamMember: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
        },
        startTime: {
          type: String,
        },
        endTime: {
          type: String,
        },
        workDescription: {
          type: String,
          trim: true,
        },
        date: {
          type: String,
        },
      },
    ],
    totalSpentHour: {
      type: Number,
      default: 0,
    },
    totalRemainingHour: {
      type: Number,
      default: 0,
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

projectSchema.pre("save", function (next) {
  if (this.isNew) {
    this.totalDues = this.projectPrice;
    this.totalRemainingHour = this.totalHour;
  };

  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  };

  if (this.name) {
    this.name = capitalizeWords(this.name);
  };

  next();
});

export default mongoose.model("Project", projectSchema);
