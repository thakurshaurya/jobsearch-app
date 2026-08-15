"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import Resume from "@/models/resumeModel";
import JobTarget from "@/models/jobTargetModel";
import { getCurrentUser } from "@/lib/auth";
import bcryptjs from "bcryptjs";
import { SignJWT } from "jose";

const MAX_AGE = 7 * 24 * 60 * 60;

export async function loginUser(email: string, password: string) {
  try {
    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return { error: "Invalid credentials" };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    const token = await new SignJWT({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: MAX_AGE,
      path: "/",
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || "An error occurred" };
  }

  revalidatePath("/", "layout");

  redirect("/dashboard");
}

export async function logoutUser() {
  (await cookies()).delete("token");
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function saveUserResume(
  sourceType: "resume" | "about_self" | "both",
  resumeUrl?: string,
  aboutSelf?: string,
  parsedSkills?: string[],
  experience?: string,
  education?: string
) {
  try {
    await connectDB();

    // 1. Authenticate using getCurrentUser()
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return { error: "Not authenticated" };
    }

    // 2. Validate: either resumeUrl OR aboutSelf must be provided
    const hasResumeUrl = Boolean(resumeUrl && resumeUrl.trim());
    const hasAboutSelf = Boolean(aboutSelf && aboutSelf.trim());

    if (!hasResumeUrl && !hasAboutSelf) {
      return { error: "Either resumeUrl or aboutSelf must be provided" };
    }

    // 3. Determine sourceType based on provided fields
    const computedSourceType: "resume" | "about_self" | "both" =
      hasResumeUrl && hasAboutSelf
        ? "both"
        : hasResumeUrl
        ? "resume"
        : "about_self";

    const finalSourceType = sourceType || computedSourceType;

    // 4. Check if Resume profile already exists for this user
    let resumeDoc = await Resume.findOne({ userId: currentUser.userId });

    if (resumeDoc) {
      // 5. Update existing document
      if (resumeUrl !== undefined) resumeDoc.resumeUrl = resumeUrl;
      if (aboutSelf !== undefined) resumeDoc.aboutSelf = aboutSelf;
      if (parsedSkills !== undefined) {
        resumeDoc.parsedSkills = parsedSkills;
      }
      if (experience !== undefined) resumeDoc.experience = experience;
      if (education !== undefined) resumeDoc.education = education;
      resumeDoc.sourceType = finalSourceType;
      resumeDoc.lastUpdated = new Date();
    } else {
      // 6. Create new Resume document
      resumeDoc = new Resume({
        userId: currentUser.userId,
        resumeUrl: resumeUrl || null,
        aboutSelf: aboutSelf || undefined,
        parsedSkills: parsedSkills || [],
        experience: experience || undefined,
        education: education || undefined,
        sourceType: finalSourceType,
        lastUpdated: new Date(),
      });
    }

    // 7. Save to database
    const savedResume = await resumeDoc.save();

    revalidatePath("/profile");

    // 8. Return serializable object
    return {
      success: true,
      resume: JSON.parse(JSON.stringify(savedResume)),
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function saveJobTarget(
  targetRole: string,
  targetSkills?: string[],
  targetSalaryMin?: number,
  targetSalaryMax?: number
) {
  try {
    await connectDB();

    // 1. Authenticate using getCurrentUser()
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return { error: "Not authenticated" };
    }

    // 2. Validate: targetRole is required and not empty
    if (!targetRole || !targetRole.trim()) {
      return { error: "targetRole is required" };
    }

    // 3. Check if JobTarget profile already exists for this user
    let targetDoc = await JobTarget.findOne({ userId: currentUser.userId });

    if (targetDoc) {
      // 4. Update existing document
      targetDoc.targetRole = targetRole.trim();
      if (targetSkills !== undefined) targetDoc.targetSkills = targetSkills;
      if (targetSalaryMin !== undefined)
        targetDoc.targetSalaryMin = targetSalaryMin;
      if (targetSalaryMax !== undefined)
        targetDoc.targetSalaryMax = targetSalaryMax;
    } else {
      // 5. Create new JobTarget document
      targetDoc = new JobTarget({
        userId: currentUser.userId,
        targetRole: targetRole.trim(),
        targetSkills: targetSkills || [],
        targetSalaryMin,
        targetSalaryMax,
      });
    }

    // 6. Save to database
    const savedTarget = await targetDoc.save();

    revalidatePath("/profile");

    // 7. Return serializable object
    return {
      success: true,
      target: JSON.parse(JSON.stringify(savedTarget)),
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function getUserProfileStatus() {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return { authenticated: false };
    }

    const resumeDoc = await Resume.findOne({ userId: currentUser.userId });
    const targetDoc = await JobTarget.findOne({ userId: currentUser.userId });

    return {
      authenticated: true,
      hasResume: Boolean(resumeDoc),
      hasJobTarget: Boolean(targetDoc),
      resume: resumeDoc ? JSON.parse(JSON.stringify(resumeDoc)) : null,
      jobTarget: targetDoc ? JSON.parse(JSON.stringify(targetDoc)) : null,
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { authenticated: false, error: err.message || "Failed to fetch profile status" };
  }
}

export async function resetUserProfile() {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return { error: "Not authenticated" };
    }

    await Resume.deleteOne({ userId: currentUser.userId });
    await JobTarget.deleteOne({ userId: currentUser.userId });

    revalidatePath("/profile");
    revalidatePath("/upload");
    revalidatePath("/resultedjobs");

    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || "Failed to reset profile" };
  }
}



