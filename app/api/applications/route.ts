import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/dbconfig/dbconfig";
import { getCurrentUser } from "@/lib/auth";
import JobApplication from "@/models/jobApplicationModel";

export async function GET() {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await JobApplication.find({
      userId: currentUser.userId,
    })
      .sort({ appliedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      applications: applications.map((app) => ({
        ...app,
        _id: app._id.toString(),
        userId: app.userId.toString(),
      })),
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // body not present
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Application id is required" },
        { status: 400 }
      );
    }

    const deleted = await JobApplication.findOneAndDelete({
      _id: id,
      userId: currentUser.userId,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Application not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application removed successfully",
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to delete application" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Application id and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["applied", "interviewing", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const updated = await JobApplication.findOneAndUpdate(
      { _id: id, userId: currentUser.userId },
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: updated,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to update status" },
      { status: 500 }
    );
  }
}
