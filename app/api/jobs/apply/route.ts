import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/dbconfig/dbconfig";
import { getCurrentUser } from "@/lib/auth";
import Resume from "@/models/resumeModel";
import JobApplication from "@/models/jobApplicationModel";
import {
  parseJobSkills,
  calculateSkillGap,
  calculateResumeScore,
} from "@/lib/skillAnalysis";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // 1. Authenticate user using getCurrentUser()
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reqBody = await request.json();
    const { jobId, jobTitle, company, location, jobUrl, description } = reqBody;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    // 2. Check if jobId already exists in user's applications (duplicate check)
    const existingApplication = await JobApplication.findOne({
      userId: currentUser.userId,
      jobId,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    // 3. Check if user has a Resume profile
    const resume = await Resume.findOne({ userId: currentUser.userId });
    if (!resume) {
      return NextResponse.json(
        { error: "Complete your profile first" },
        { status: 400 }
      );
    }

    // 4. Parse user's skills from resume.parsedSkills
    const userSkills: string[] = resume.parsedSkills || [];

    // 5. Extract required skills from job description
    const requiredSkills = parseJobSkills(description || "");

    // 6. Calculate missing skills (skill gap)
    const skillGap = calculateSkillGap(userSkills, requiredSkills);

    // 7. Calculate matching skills
    const userSkillSet = new Set(
      userSkills.map((skill: string) => skill.toLowerCase().trim())
    );
    const matchingSkills = requiredSkills.filter((skill: string) =>
      userSkillSet.has(skill.toLowerCase().trim())
    );

    // 8. Calculate resume score / match percentage
    const resumeScore = calculateResumeScore(userSkills, requiredSkills);
    const matchPercentage = resumeScore;

    // 9. Determine chanceOfSuccess: >=70 High, >=40 Medium, <40 Low
    let chanceOfSuccess: "High" | "Medium" | "Low" = "Low";
    if (resumeScore >= 70) {
      chanceOfSuccess = "High";
    } else if (resumeScore >= 40) {
      chanceOfSuccess = "Medium";
    }

    // 10. Create and save JobApplication document
    const newApplication = new JobApplication({
      userId: currentUser.userId,
      jobId,
      jobTitle,
      company,
      location,
      jobUrl,
      description,
      requiredSkills,
      matchingSkills,
      skillGap,
      resumeScore,
      matchPercentage,
      chanceOfSuccess,
      status: "applied",
      appliedAt: new Date(),
    });

    const savedApplication = await newApplication.save();

    // 11. Return 201 with the created application document
    return NextResponse.json(
      {
        message: "Application submitted successfully",
        success: true,
        application: savedApplication,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
