import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Please provide a userId"],
      index: true,
    },
    jobId: {
      type: String,
      required: [true, "Please provide a jobId"],
    },
    jobTitle: {
      type: String,
    },
    company: {
      type: String,
    },
    location: {
      type: String,
    },
    jobUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    resumeScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    matchingSkills: {
      type: [String],
      default: [],
    },
    skillGap: {
      type: [String],
      default: [],
    },
    matchPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    chanceOfSuccess: {
      type: String,
      enum: {
        values: ["High", "Medium", "Low"],
        message: "{VALUE} is not a valid chanceOfSuccess value",
      },
    },
    estimatedSalary: {
      type: Number,
    },
    status: {
      type: String,
      enum: {
        values: ["applied", "rejected", "accepted", "interviewing"],
        message: "{VALUE} is not a valid status",
      },
      default: "applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one user cannot apply to the same job twice
jobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const JobApplication =
  mongoose.models.jobapplications ||
  mongoose.model("jobapplications", jobApplicationSchema);

export default JobApplication;
