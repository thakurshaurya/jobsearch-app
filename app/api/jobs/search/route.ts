import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const keywords = searchParams.get("query");

    if (!keywords) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const location = searchParams.get("location") ?? "";
    const jobType = searchParams.get("jobType") ?? "";
    const datePosted = searchParams.get("datePosted") ?? "any";
    const page = searchParams.get("page") ?? "1";

    const apiUrl = new URL(
      "https://linkedin-scraper-api6.p.rapidapi.com/linkedin/jobs"
    );
    apiUrl.searchParams.set("keywords", keywords);
    apiUrl.searchParams.set("page", page);
    apiUrl.searchParams.set("date_posted", datePosted);
    if (location) apiUrl.searchParams.set("location", location);
    if (jobType) apiUrl.searchParams.set("job_type", jobType);

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST!,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
