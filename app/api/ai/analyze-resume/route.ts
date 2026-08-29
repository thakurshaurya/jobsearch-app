import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { analyzeResume } from "@/lib/ai/groq";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { resumeText, aboutSelf } = body;

    if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
      return NextResponse.json(
        { error: "resumeText is required" },
        { status: 400 }
      );
    }

    console.log("Calling Groq to analyze resume for user:", user.userId);
    const analysis = await analyzeResume(resumeText, aboutSelf || "");


    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: unknown) {
    console.error("Error in analyze-resume route:", error);


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during resume analysis. Please try again.",
      },
      { status: 500 }
    );
  }
}
