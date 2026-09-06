"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import Resume from "@/models/resumeModel";
import JobTarget from "@/models/jobTargetModel";
import JobApplication from "@/models/jobApplicationModel";
import { getCurrentUser } from "@/lib/auth";
import bcryptjs from "bcryptjs";
import { SignJWT } from "jose";
import crypto from "crypto";
import { sendMail } from "@/helpers/mailer";

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
  education?: string,
  resumeText?: string,
  roles?: string[],
  seniority?: string,
  locations?: string[],
  searchQueries?: string[]
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return { error: "Not authenticated" };
    }

    const hasResumeUrl = Boolean(resumeUrl && resumeUrl.trim());
    const hasAboutSelf = Boolean(aboutSelf && aboutSelf.trim());

    if (!hasResumeUrl && !hasAboutSelf) {
      return { error: "Either resumeUrl or aboutSelf must be provided" };
    }

    const computedSourceType: "resume" | "about_self" | "both" =
      hasResumeUrl && hasAboutSelf
        ? "both"
        : hasResumeUrl
        ? "resume"
        : "about_self";

    const finalSourceType = sourceType || computedSourceType;

    let resumeDoc = await Resume.findOne({ userId: currentUser.userId });

    if (resumeDoc) {
      if (resumeUrl !== undefined) resumeDoc.resumeUrl = resumeUrl;
      if (aboutSelf !== undefined) resumeDoc.aboutSelf = aboutSelf;
      if (parsedSkills !== undefined) {
        resumeDoc.parsedSkills = parsedSkills;
      }
      if (experience !== undefined) resumeDoc.experience = experience;
      if (education !== undefined) resumeDoc.education = education;
      if (resumeText !== undefined) resumeDoc.resumeText = resumeText;
      if (roles !== undefined) resumeDoc.roles = roles;
      if (seniority !== undefined) resumeDoc.seniority = seniority;
      if (locations !== undefined) resumeDoc.locations = locations;
      if (searchQueries !== undefined) resumeDoc.searchQueries = searchQueries;
      resumeDoc.sourceType = finalSourceType;
      resumeDoc.lastUpdated = new Date();
    } else {
      resumeDoc = new Resume({
        userId: currentUser.userId,
        resumeUrl: resumeUrl || null,
        aboutSelf: aboutSelf || undefined,
        parsedSkills: parsedSkills || [],
        experience: experience || undefined,
        education: education || undefined,
        resumeText: resumeText || null,
        roles: roles || [],
        seniority: seniority || null,
        locations: locations || [],
        searchQueries: searchQueries || [],
        sourceType: finalSourceType,
        lastUpdated: new Date(),
      });
    }

    const savedResume = await resumeDoc.save();

    revalidatePath("/profile");

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
  targetSalaryMax?: number,
  targetCountry?: string
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return { error: "Not authenticated" };
    }

    if (!targetRole || !targetRole.trim()) {
      return { error: "targetRole is required" };
    }

    if (!targetCountry || !targetCountry.trim()) {
      return { error: "targetCountry is required" };
    }

    let targetDoc = await JobTarget.findOne({ userId: currentUser.userId });

    if (targetDoc) {
      targetDoc.targetRole = targetRole.trim();
      if (targetSkills !== undefined) targetDoc.targetSkills = targetSkills;
      if (targetSalaryMin !== undefined)
        targetDoc.targetSalaryMin = targetSalaryMin;
      if (targetSalaryMax !== undefined)
        targetDoc.targetSalaryMax = targetSalaryMax;
      if (targetCountry !== undefined)
        targetDoc.targetCountry = targetCountry.trim();
    } else {
      targetDoc = new JobTarget({
        userId: currentUser.userId,
        targetRole: targetRole.trim(),
        targetSkills: targetSkills || [],
        targetSalaryMin,
        targetSalaryMax,
        targetCountry: targetCountry.trim(),
      });
    }

    const savedTarget = await targetDoc.save();

    revalidatePath("/profile");

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

export async function getUserApplications() {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return { authenticated: false, applications: [] };
    }

    const applications = await JobApplication.find({
      userId: currentUser.userId,
    })
      .sort({ appliedAt: -1 })
      .lean();

    return {
      authenticated: true,
      applications: applications.map((app) => ({
        ...app,
        _id: app._id.toString(),
        userId: app.userId.toString(),
        appliedAt: app.appliedAt ? new Date(app.appliedAt).toISOString() : new Date().toISOString(),
      })),
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { authenticated: false, error: err.message || "Failed to fetch applications", applications: [] };
  }
}

export async function deleteJobApplication(id: string) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return { error: "Not authenticated" };
    }

    await JobApplication.findOneAndDelete({
      _id: id,
      userId: currentUser.userId,
    });

    revalidatePath("/applications");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || "Failed to delete application" };
  }
}

export async function updateApplicationStatus(
  id: string,
  status: "applied" | "interviewing" | "accepted" | "rejected"
) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return { error: "Not authenticated" };
    }

    await JobApplication.findOneAndUpdate(
      { _id: id, userId: currentUser.userId },
      { $set: { status } }
    );

    revalidatePath("/applications");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || "Failed to update application status" };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    await connectDB();

    if (!email || !email.trim()) {
      return { error: "Please enter your email address" };
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return {
        success: true,
        message: "If an account exists with that email, a password reset link has been sent.",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.forgotPasswordToken = resetToken;
    user.forgotPasswordTokenExpiry = resetTokenExpiry;
    await user.save();

    await sendMail({
      email: cleanEmail,
      emailType: "RESET",
      userId: user._id,
      token: resetToken,
    });

    return {
      success: true,
      message: "A password reset link has been sent to your email address.",
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || "Failed to send reset link. Please try again." };
  }
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  try {
    await connectDB();

    if (!token || !token.trim()) {
      return { error: "Invalid or missing reset token." };
    }

    if (!newPassword || newPassword.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    const user = await User.findOne({
      forgotPasswordToken: token,
      forgotPasswordTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return { error: "This password reset link is invalid or has expired. Please request a new one." };
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    user.password = hashedPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save();

    return {
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { error: err.message || "Failed to reset password. Please try again." };
  }
}
