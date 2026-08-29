import { GoogleGenAI } from "@google/genai";
import { ResumeAnalysis } from "@/types/resume";
import { JSearchJob } from "@/types/jobs";

const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}


export async function analyzeResume(
  resumeText: string,
  aboutSelf: string = ""
): Promise<ResumeAnalysis> {
  const ai = getAiClient();

  const prompt = `
You are an expert technical recruiter and resume analyzer.
Analyze the following resume text and optional candidate description to extract a highly accurate structured profile.

Guidelines:
1. Extract candidate name, approximate years of professional experience, seniority level (e.g. Entry Level, Mid Level, Senior, Lead, Executive), and educational qualifications.
2. Identify a clean list of technical and professional skills mentioned in the resume. Normalize them (e.g., "React.js" -> "React", "Nodejs" -> "Node.js"). Do not list soft skills unless highly relevant to their core technical role.
3. Identify the likely target job roles/titles the candidate is qualified for based on their skills and experience (e.g., "Frontend Developer", "Full Stack Engineer").
4. Identify preferred locations (e.g., countries, cities, or "Remote") if specified or inferred.
5. Generate 3 to 5 high-quality, targeted job search queries to be used with a job search API.
   - Do NOT search for every skill individually (e.g. do not generate "HTML", "CSS", "Git").
   - Generate combined, industry-standard queries reflecting their seniority and core stack (e.g., "Junior React Developer", "Frontend Developer React Next.js", "Full Stack Engineer Node.js").
6. CRITICAL: Do NOT hallucinate any skills, experience years, degrees, or companies. If something cannot be determined, return null or empty arrays. Distinguish between actual professional experience/skills vs. things they only mentioned incidentally (e.g., "interested in learning Rust" should not classify Rust as a professional skill).

Resume Text:
"""
${resumeText}
"""

About Self description (additional details provided by user):
"""
${aboutSelf}
"""
`;

  const schema = {
    type: "object",
    properties: {
      candidate: {
        type: "object",
        properties: {
          name: { type: "string", nullable: true },
          experienceYears: { type: "integer", nullable: true },
          seniority: { type: "string", description: "Seniority level, e.g., Entry Level, Mid Level, Senior, Lead" },
          education: {
            type: "array",
            items: { type: "string" },
            description: "List of degrees, certifications, or educational achievements"
          }
        },
        required: ["name", "experienceYears", "seniority", "education"]
      },
      skills: {
        type: "array",
        items: { type: "string" },
        description: "Core technical/professional skills found in the resume"
      },
      roles: {
        type: "array",
        items: { type: "string" },
        description: "Target job roles or titles matching their profile"
      },
      locations: {
        type: "array",
        items: { type: "string" },
        description: "Preferred locations or 'Remote' if specified"
      },
      searchQueries: {
        type: "array",
        items: { type: "string" },
        description: "3 to 5 targeted search query strings for JSearch"
      }
    },
    required: ["candidate", "skills", "roles", "locations", "searchQueries"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.1,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response received from Gemini resume analysis");
  }

  return JSON.parse(text) as ResumeAnalysis;
}


export async function matchJobs(
  candidateProfile: {
    skills: string[];
    roles: string[];
    experienceYears?: number | null;
    seniority?: string | null;
    education?: string[];
  },
  jobs: JSearchJob[]
): Promise<{ jobId: string; matchScore: number; matchingSkills: string[]; missingSkills: string[]; reason: string }[]> {
  const ai = getAiClient();

  if (jobs.length === 0) {
    return [];
  }

  const formattedJobs = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description ? job.description.slice(0, 1500) : "",
  }));

  const prompt = `
You are an expert career advisor and job matching AI.
Compare the following candidate profile against the list of jobs and rank them based on how well they match.

Candidate Profile:
- Skills: ${JSON.stringify(candidateProfile.skills)}
- Recommended Roles: ${JSON.stringify(candidateProfile.roles)}
- Experience Years: ${candidateProfile.experienceYears ?? "Not specified"}
- Seniority: ${candidateProfile.seniority ?? "Not specified"}
- Education: ${JSON.stringify(candidateProfile.education ?? [])}

Jobs to match:
${JSON.stringify(formattedJobs, null, 2)}

Instructions:
1. For each job, calculate a matchScore between 0 and 100 based on skill compatibility, role alignment, and seniority.
2. Identify which of the candidate's skills are matching the job description/requirements.
3. Identify which skills required by the job description are missing from the candidate's profile.
4. Write a concise, 1-2 sentence explanation of the ranking reason. Do NOT invent information. Use only details provided in the job description and candidate profile.
`;

  const schema = {
    type: "object",
    properties: {
      rankings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            jobId: { type: "string" },
            matchScore: { type: "integer", description: "Match score between 0 and 100" },
            matchingSkills: { type: "array", items: { type: "string" } },
            missingSkills: { type: "array", items: { type: "string" } },
            reason: { type: "string", description: "Short explanation for the match" }
          },
          required: ["jobId", "matchScore", "matchingSkills", "missingSkills", "reason"]
        }
      }
    },
    required: ["rankings"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.2,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response received from Gemini job matching");
  }

  const result = JSON.parse(text);
  return result.rankings || [];
}
