import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("query")?.trim();
    const location = searchParams.get("location")?.trim() || "";
    const datePosted = searchParams.get("datePosted") || "";

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const searchQuery = location
      ? `${query} in ${location}`
      : query;

    const apiUrl = new URL(
      "https://api.openwebninja.com/jsearch/search-v2"
    );

    apiUrl.searchParams.set("query", searchQuery);

    if (datePosted && datePosted !== "any") {
      apiUrl.searchParams.set("date_posted", datePosted);
    }

    const countryParam = searchParams.get("countryCode") || searchParams.get("country") || "in";
    const countryMap: Record<string, string> = {
      "united states": "us",
      "canada": "ca",
      "united kingdom": "gb",
      "germany": "de",
      "india": "in",
      "australia": "au",
      "singapore": "sg",
      "united arab emirates": "ae",
      "france": "fr",
      "netherlands": "nl",
    };
    const resolvedCountry = countryMap[countryParam.toLowerCase()] || countryParam.toLowerCase();

    apiUrl.searchParams.set("country", resolvedCountry);
    apiUrl.searchParams.set("language", "en");

    const apiKey = process.env.JSEARCH_API_KEY;

    if (!apiKey) {
      console.error("JSEARCH_API_KEY is missing");

      return NextResponse.json(
        {
          error: "JSearch API key is not configured",
        },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
      cache: "no-store",
    });

    const data = await response.json();

    // Helpful while developing
    console.log("JSearch response:", data);

    if (!response.ok) {
      console.error("JSearch API error:", data);

      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error ||
            "Failed to fetch jobs from JSearch",
        },
        { status: response.status }
      );
    }

    /*
      JSearch can return jobs in different shapes.

      Shape 1:
      data: [ ...jobs ]

      Shape 2:
      data: {
        jobs: [ ...jobs ]
      }
    */

    let rawJobs: any[] = [];

    if (Array.isArray(data?.data)) {
      rawJobs = data.data;
    } else if (Array.isArray(data?.data?.jobs)) {
      rawJobs = data.data.jobs;
    }

    console.log("Number of jobs:", rawJobs.length);

    /*
      Convert JSearch jobs into our own format.
    */

    const jobs = rawJobs.map((job: any) => ({
      id: job.job_id,

      title: job.job_title,

      company: job.employer_name,

      companyLogo: job.employer_logo ?? null,

      location: job.job_location,

      postedDate:
        job.job_posted_at ?? null,

      salary:
        job.job_min_salary != null
          ? `${job.job_min_salary} - ${
              job.job_max_salary ?? ""
            } ${job.job_salary_currency ?? ""}`
          : null,

      applyUrl:
        job.job_apply_link ??
        job.job_google_link ??
        null,

      description:
        job.job_description ?? "",

      employmentType:
        job.job_employment_type ?? null,

      remote:
        job.job_is_remote ?? false,
    }));

    return NextResponse.json({
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    console.error("Job search error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while searching for jobs",
      },
      { status: 500 }
    );
  }
}