import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      default: () => `T-${Date.now()}`,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    ticketType: {
      type: String,
      enum: ["Bug", "Feature Request", "Improvement", "Task", "Support", "Incident"],
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    image: {
      type: String,
    },
    resolutionDetails: [
      {
        resolveBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
        },
        resolutionDescription: {
          type: String,
        },
        resolutionStatus: {
          type: String,
          enum: ["Open", "In Progress", "Resolved", "Closed"],
        },
        resolvedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

ticketSchema.index({ ticketId: 1, company: 1 }, { unique: true });

export default mongoose.model("Ticket", ticketSchema);