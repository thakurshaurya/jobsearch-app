import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Please provide a userId"],
      unique: true,
      index: true,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    parsedSkills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
    },
    education: {
      type: String,
    },
    aboutSelf: {
      type: String,
    },
    sourceType: {
      type: String,
      enum: {
        values: ["resume", "about_self", "both"],
        message: "{VALUE} is not a valid sourceType",
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.pre("validate", function () {
  const hasResumeUrl = Boolean(this.resumeUrl && this.resumeUrl.trim());
  const hasAboutSelf = Boolean(this.aboutSelf && this.aboutSelf.trim());

  if (!hasResumeUrl && !hasAboutSelf) {
    this.invalidate(
      "resumeUrl",
      "Either resumeUrl or aboutSelf must be provided."
    );
    this.invalidate(
      "aboutSelf",
      "Either resumeUrl or aboutSelf must be provided."
    );
  }
});

if (mongoose.models && mongoose.models.resumes) {
  delete mongoose.models.resumes;
}

const Resume = mongoose.model("resumes", resumeSchema);

export default Resume;
