import mongoose from "mongoose";

const jobTargetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Please provide a userId"],
      unique: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: [true, "Please provide a target role"],
      trim: true,
    },
    targetSkills: {
      type: [String],
      default: [],
    },
    targetSalaryMin: {
      type: Number,
    },
    targetSalaryMax: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const JobTarget =
  mongoose.models.jobtargets || mongoose.model("jobtargets", jobTargetSchema);

export default JobTarget;
