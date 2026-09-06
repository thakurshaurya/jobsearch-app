import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/dbconfig/dbconfig";
import { getCurrentUser } from "@/lib/auth";
import Resume from "@/models/resumeModel";
import JobTarget from "@/models/jobTargetModel";
import { matchJobs } from "@/lib/ai/groq";
import { JSearchJob, MatchedJob } from "@/types/jobs";

interface RawJSearchJob {
  job_id?: string;
  job_title?: string;
  employer_name?: string;
  employer_logo?: string | null;
  job_location?: string;
  job_city?: string;
  job_country?: string;
  job_posted_at?: string;
  job_posted_at_datetime_utc?: string;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary_currency?: string;
  job_apply_link?: string;
  job_google_link?: string;
  job_description?: string;
  job_employment_type?: string;
  job_is_remote?: boolean;
}

export function isWithinTwoWeeks(
  postedAt: unknown,
  datetimeUtc: unknown,
  maxDays: number = 15
): boolean {
  const now = Date.now();
  // Allow up to maxDays plus 12 hours buffer for timezone/execution margins
  const maxMs = (maxDays + 0.5) * 24 * 60 * 60 * 1000;

  // 1. Check ISO/datetimeUtc first
  if (datetimeUtc) {
    const d = new Date(datetimeUtc as any);
    if (!isNaN(d.getTime())) {
      const diff = now - d.getTime();
      return diff <= maxMs;
    }
  }

  // 2. Check numeric timestamp in postedAt
  if (typeof postedAt === "number") {
    const ms = postedAt > 1e11 ? postedAt : postedAt * 1000;
    return (now - ms) <= maxMs;
  }
  if (typeof postedAt === "string" && /^\d+$/.test(postedAt)) {
    const num = parseInt(postedAt, 10);
    const ms = num > 1e11 ? num : num * 1000;
    return (now - ms) <= maxMs;
  }

  // 3. Check ISO string format in postedAt
  if (
    typeof postedAt === "string" &&
    postedAt.includes("-") &&
    !isNaN(Date.parse(postedAt))
  ) {
    const ms = Date.parse(postedAt);
    return (now - ms) <= maxMs;
  }

  // 4. Check relative time text
  if (typeof postedAt === "string") {
    const lower = postedAt.toLowerCase().trim();

    if (lower.includes("month") || lower.includes("year")) {
      return false;
    }

    const weekMatch = lower.match(/(\d+)\s*week/);
    if (weekMatch) {
      const weeks = parseInt(weekMatch[1], 10);
      return weeks <= 2; // 1 week or 2 weeks max (<= 14 days)
    }

    const dayMatch = lower.match(/(\d+)\s*day/);
    if (dayMatch) {
      const days = parseInt(dayMatch[1], 10);
      return days <= maxDays;
    }

    if (
      lower.includes("hour") ||
      lower.includes("minute") ||
      lower.includes("second") ||
      lower.includes("today") ||
      lower.includes("yesterday") ||
      lower.includes("just now") ||
      lower.includes("recently")
    ) {
      return true;
    }
  }

  return true;
}

function formatPostedDate(postedAt: unknown, datetimeUtc: unknown): string {
  if (typeof datetimeUtc === "string" || typeof datetimeUtc === "number" || datetimeUtc instanceof Date) {
    const d = new Date(datetimeUtc);
    if (!isNaN(d.getTime())) {
      const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays <= 14) return `${Math.floor(diffDays / 7)}w ago`;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    }
  }

  if (!postedAt) return "Recently";

  if (
    typeof postedAt === "string" &&
    (postedAt.includes("ago") ||
      postedAt.includes("day") ||
      postedAt.includes("week") ||
      postedAt.includes("month"))
  ) {
    return postedAt;
  }

  try {
    let date: Date;
    if (typeof postedAt === "number") {
      date = new Date(postedAt * 1000);
    } else if (typeof postedAt === "string" && /^\d+$/.test(postedAt)) {
      date = new Date(parseInt(postedAt) * 1000);
    } else if (typeof postedAt === "string" || postedAt instanceof Date) {
      date = new Date(postedAt);
    } else {
      return "Recently";
    }

    if (isNaN(date.getTime())) {
      return "Recently";
    }

    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays <= 14) return `${Math.floor(diffDays / 7)}w ago`;

    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "Recently";
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resume = await Resume.findOne({ userId: currentUser.userId });
    const jobTarget = await JobTarget.findOne({ userId: currentUser.userId });

    if (!resume) {
      return NextResponse.json(
        { error: "Please upload your resume to get personalized recommendations" },
        { status: 400 }
      );
    }


    const { searchParams } = new URL(request.url);
    const countryParam = searchParams.get("country")?.trim() || jobTarget?.targetCountry?.trim() || "India";

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
    const resolvedCountry = countryMap[countryParam.toLowerCase()] || countryParam.toLowerCase() || "in";


    let baseQueries: string[] = resume.searchQueries || [];
    if (baseQueries.length === 0) {
      let fallbackQuery = jobTarget?.targetRole || resume.roles?.[0] || "Software Engineer";
      if (jobTarget?.targetSkills && jobTarget.targetSkills.length > 0) {
        fallbackQuery += ` ${jobTarget.targetSkills.slice(0, 2).join(" ")}`;
      }
      baseQueries = [fallbackQuery];
    }


    const preferredLocations = resume.locations || [];
    let queriesToRun: string[] = [];

    if (preferredLocations.length > 0) {
      const primaryRole = jobTarget?.targetRole || baseQueries[0] || "Software Engineer";
      const getCleanLocation = (loc: string) => loc.split(",")[0].trim();
      const primaryLoc = getCleanLocation(preferredLocations[0]);


      queriesToRun.push(`${primaryRole} ${primaryLoc}`);

      if (baseQueries[1]) {
        queriesToRun.push(`${baseQueries[1]} ${primaryLoc}`);
      } else if (preferredLocations[1]) {
        queriesToRun.push(`${primaryRole} ${getCleanLocation(preferredLocations[1])}`);
      } else {
        queriesToRun.push(`${primaryRole} Remote`);
      }


      if (queriesToRun.length < 3) {
        if (preferredLocations[1]) {
          queriesToRun.push(`${primaryRole} ${getCleanLocation(preferredLocations[1])}`);
        } else if (baseQueries[2]) {
          queriesToRun.push(`${baseQueries[2]} ${primaryLoc}`);
        } else {
          queriesToRun.push(primaryRole);
        }
      }
    } else {
      queriesToRun = baseQueries.slice(0, 3);
    }
    const apiKey = process.env.JSEARCH_API_KEY;

    if (!apiKey) {
      console.error("JSEARCH_API_KEY is missing");
      return NextResponse.json(
        { error: "JSearch API key is not configured" },
        { status: 500 }
      );
    }

    console.log(`Running JSearch queries: ${JSON.stringify(queriesToRun)} for country: ${resolvedCountry}`);


    const searchPromises = queriesToRun.map(async (queryStr) => {
      try {
        const apiUrl = new URL("https://api.openwebninja.com/jsearch/search-v2");
        apiUrl.searchParams.set("query", queryStr);
        apiUrl.searchParams.set("country", resolvedCountry);
        apiUrl.searchParams.set("language", "en");
        apiUrl.searchParams.set("date_posted", "month");

        const res = await fetch(apiUrl.toString(), {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          console.error(`JSearch fetch failed for query "${queryStr}":`, res.statusText);
          return [];
        }

        const data = await res.json();
        let rawJobs: RawJSearchJob[] = [];

        if (Array.isArray(data?.data)) {
          rawJobs = data.data;
        } else if (Array.isArray(data?.data?.jobs)) {
          rawJobs = data.data.jobs;
        }

        return rawJobs;
      } catch (err) {
        console.error(`Error fetching query "${queryStr}":`, err);
        return [];
      }
    });

    const results = await Promise.all(searchPromises);
    const combinedRawJobs = results.flat();


    const seenJobIds = new Set<string>();
    const seenCompositeKeys = new Set<string>();
    const normalizedJobs: JSearchJob[] = [];

    for (const job of combinedRawJobs) {
      if (!job) continue;

      const jobId = job.job_id;
      const title = job.job_title;
      const company = job.employer_name;
      const location = job.job_location || "";
      const applyUrl = job.job_apply_link || job.job_google_link || "";


      if (jobId && seenJobIds.has(jobId)) {
        continue;
      }


      const compositeKey = `${company || ""}-${title || ""}-${location}-${applyUrl}`.toLowerCase().replace(/\s+/g, "");
      if (seenCompositeKeys.has(compositeKey)) {
        continue;
      }

      if (jobId) seenJobIds.add(jobId);
      seenCompositeKeys.add(compositeKey);


      if (!title || !applyUrl) {
        continue;
      }

      // Force job listings to only those uploaded within 2 weeks (14-15 days max)
      if (!isWithinTwoWeeks(job.job_posted_at, job.job_posted_at_datetime_utc, 15)) {
        continue;
      }


      normalizedJobs.push({
        id: jobId || compositeKey,
        title,
        company: company || "Unknown Company",
        companyLogo: job.employer_logo ?? null,
        location: job.job_city && job.job_country ? `${job.job_city}, ${job.job_country}` : (job.job_location || "Remote"),
        postedDate: formatPostedDate(job.job_posted_at, job.job_posted_at_datetime_utc),
        salary: job.job_min_salary != null
          ? `${job.job_min_salary.toLocaleString("en-IN")} - ${job.job_max_salary ? job.job_max_salary.toLocaleString("en-IN") : ""} ${job.job_salary_currency ?? ""}`
          : null,
        applyUrl,
        description: job.job_description ?? "",
        employmentType: job.job_employment_type ?? null,
        remote: job.job_is_remote ?? false,
      });
    }

    console.log(`Deduplicated and filtered down to ${normalizedJobs.length} jobs.`);


    const jobsToRank = normalizedJobs.slice(0, 20);

    const candidateProfile = {
      skills: resume.parsedSkills || [],
      roles: resume.roles || [],
      experienceYears: resume.experience ? parseInt(resume.experience) || 0 : 0,
      seniority: resume.seniority || "Entry Level",
      education: resume.education ? [resume.education] : [],
    };

    let matchedJobs: MatchedJob[] = [];
    let aiMatched = false;

    try {
      if (jobsToRank.length > 0) {
        console.log("Ranking top", jobsToRank.length, "jobs deterministically using candidate profile...");
        const rankings = matchJobs(candidateProfile, jobsToRank);

        const rankingsMap = new Map(rankings.map((r) => [r.jobId, r]));

        matchedJobs = jobsToRank.map((job) => {
          const rank = rankingsMap.get(job.id);
          return {
            ...job,
            matchScore: rank ? rank.matchScore : 50,
            matchingSkills: rank ? rank.matchingSkills : [],
            missingSkills: rank ? rank.missingSkills : [],
            matchReason: rank ? rank.reason : "Ranked using default parameters.",
          };
        });

        matchedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        aiMatched = true;
      } else {
        matchedJobs = jobsToRank.map((job) => ({
          ...job,
          matchScore: null,
          matchingSkills: [],
          missingSkills: [],
          matchReason: null,
        }));
      }
    } catch (matchingError) {
      console.error("Job matching failed. Falling back to unranked JSearch jobs:", matchingError);
      matchedJobs = jobsToRank.map((job) => ({
        ...job,
        matchScore: null,
        matchingSkills: [],
        missingSkills: [],
        matchReason: "Matching calculation failed.",
      }));
    }


    return NextResponse.json({
      profile: {
        skills: resume.parsedSkills || [],
        roles: resume.roles || [],
        experienceYears: candidateProfile.experienceYears,
        seniority: candidateProfile.seniority,
        locations: resume.locations || [],
      },
      jobs: matchedJobs.slice(0, 15),
      aiMatched,
    });
  } catch (error: unknown) {
    console.error("Error in personalized jobs API route:", error);
    return NextResponse.json(
      { error: "Something went wrong while compiling personalized jobs" },
      { status: 500 }
    );
  }
}
