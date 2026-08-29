import Groq from "groq-sdk";
import { ResumeAnalysis } from "@/types/resume";
import { JSearchJob } from "@/types/jobs";

const apiKey = process.env.GROQ_API_KEY;

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not defined");
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export async function analyzeResume(
  resumeText: string,
  aboutSelf: string = ""
): Promise<ResumeAnalysis> {
  const groq = getGroqClient();

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

You MUST return the response strictly in JSON format matching the schema below:
{
  "candidate": {
    "name": "string or null",
    "experienceYears": integer or null,
    "seniority": "Entry Level" | "Mid Level" | "Senior" | "Lead" | "Executive",
    "education": ["string"]
  },
  "skills": ["string"],
  "roles": ["string"],
  "locations": ["string"],
  "searchQueries": ["string"]
}
`;

  // Using openai/gpt-oss-120b as specified, fallback to llama-3.3-70b-versatile if desired
  const modelName = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  try {
    const response = await groq.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that responds strictly in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("Empty response received from Groq resume analysis");
    }

    const parsed = JSON.parse(text);
    
    // Ensure structure is correct
    return {
      candidate: {
        name: parsed?.candidate?.name ?? null,
        experienceYears: parsed?.candidate?.experienceYears ?? null,
        seniority: parsed?.candidate?.seniority ?? "Entry Level",
        education: Array.isArray(parsed?.candidate?.education) ? parsed.candidate.education : [],
      },
      skills: Array.isArray(parsed?.skills) ? parsed.skills : [],
      roles: Array.isArray(parsed?.roles) ? parsed.roles : [],
      locations: Array.isArray(parsed?.locations) ? parsed.locations : [],
      searchQueries: Array.isArray(parsed?.searchQueries) ? parsed.searchQueries : [],
    };
  } catch (error: unknown) {
    console.error("Groq resume analysis failed:", error);
    throw error;
  }
}

// Map skill aliases to normalized names for comparison
const SKILL_ALIASES: Record<string, string> = {
  "reactjs": "react",
  "react.js": "react",
  "nodejs": "node.js",
  "node": "node.js",
  "js": "javascript",
  "ts": "typescript",
  "nextjs": "next.js",
  "vuejs": "vue.js",
  "vue.js": "vue",
  "tailwindcss": "tailwind",
  "postgres": "postgresql",
  "golang": "go",
};

const COMMON_TECH_SKILLS = [
  "react", "node.js", "javascript", "typescript", "next.js", "vue", "angular",
  "python", "java", "c++", "c#", "rust", "go", "ruby", "php", "swift", "kotlin",
  "aws", "azure", "gcp", "docker", "kubernetes", "mongodb", "postgresql", "mysql",
  "redis", "graphql", "html", "css", "tailwind", "git", "ci/cd", "devops", "jest"
];

function normalizeSkill(skill: string): string {
  const lower = skill.trim().toLowerCase();
  return SKILL_ALIASES[lower] || lower;
}

// Deterministic matching logic in TypeScript (no additional API calls)
export function matchJobs(
  candidateProfile: {
    skills: string[];
    roles: string[];
    experienceYears?: number | null;
    seniority?: string | null;
    education?: string[];
  },
  jobs: JSearchJob[]
): { jobId: string; matchScore: number; matchingSkills: string[]; missingSkills: string[]; reason: string }[] {
  if (jobs.length === 0) {
    return [];
  }

  const candidateSkillsNormalized = new Set(candidateProfile.skills.map(normalizeSkill));
  const candidateRolesNormalized = candidateProfile.roles.map(r => r.toLowerCase().trim());
  const candidateSeniority = (candidateProfile.seniority || "entry level").toLowerCase();

  return jobs.map((job) => {
    const jobTitleLower = job.title.toLowerCase();
    const jobDescLower = (job.description || "").toLowerCase();

    let score = 0;
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    // 1. Role/Title Match (Max 30 points)
    let roleMatched = false;
    for (const role of candidateRolesNormalized) {
      if (jobTitleLower.includes(role)) {
        score += 30;
        roleMatched = true;
        break;
      }
    }
    if (!roleMatched) {
      // Partial role word match
      const words = jobTitleLower.split(/\s+/);
      const matchingWords = words.filter(word => 
        candidateRolesNormalized.some(role => role.includes(word) && word.length > 3)
      );
      if (matchingWords.length > 0) {
        score += 15;
      }
    }

    // 2. Skills Match (Max 40 points)
    // First: Identify matching skills from candidate profile
    for (const skill of candidateProfile.skills) {
      const normalized = normalizeSkill(skill);
      // Escape special characters in skill name for regex word boundary
      const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(jobDescLower) || jobTitleLower.includes(normalized)) {
        matchingSkills.push(skill);
      }
    }

    // Second: Find skills required by the job that candidate is missing
    for (const skill of COMMON_TECH_SKILLS) {
      const normalized = normalizeSkill(skill);
      const isCandidateSkill = candidateSkillsNormalized.has(normalized);
      const regex = new RegExp(`\\b${skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      
      if (regex.test(jobDescLower) || jobTitleLower.includes(normalized)) {
        if (!isCandidateSkill) {
          missingSkills.push(skill);
        }
      }
    }

    // Calculate skill match score contribution
    const totalSkillsInJob = matchingSkills.length + missingSkills.length;
    if (totalSkillsInJob > 0) {
      score += Math.round((matchingSkills.length / totalSkillsInJob) * 40);
    } else {
      score += 30; // base points if job lists no detectable tech skills
    }

    // 3. Seniority/Experience Match (Max 15 points)
    const jobMentionsSenior = jobTitleLower.includes("senior") || jobTitleLower.includes("sr") || jobTitleLower.includes("lead") || jobTitleLower.includes("principal");
    const jobMentionsJunior = jobTitleLower.includes("junior") || jobTitleLower.includes("jr") || jobTitleLower.includes("entry") || jobTitleLower.includes("intern");

    if (candidateSeniority.includes("senior") || candidateSeniority.includes("lead") || candidateSeniority.includes("executive")) {
      if (jobMentionsSenior) {
        score += 15;
      } else if (!jobMentionsJunior) {
        score += 10;
      } else {
        score += 3; // mismatch: senior candidate for junior job
      }
    } else if (candidateSeniority.includes("entry") || candidateSeniority.includes("junior")) {
      if (jobMentionsJunior) {
        score += 15;
      } else if (!jobMentionsSenior) {
        score += 10;
      } else {
        score += 3; // mismatch: junior candidate for senior job
      }
    } else {
      // Mid level candidate
      if (!jobMentionsSenior && !jobMentionsJunior) {
        score += 15;
      } else {
        score += 8;
      }
    }

    // 4. Remote Match (Max 15 points)
    const jobIsRemote = job.remote === true || jobTitleLower.includes("remote") || jobDescLower.includes("work from home");
    if (jobIsRemote) {
      score += 15;
    } else {
      score += 5; // Onsite/hybrid matches basic
    }

    // Clamp score between 0 and 100
    const finalScore = Math.min(100, Math.max(0, score));

    // Construct a reasoning string
    let reason = "";
    if (finalScore >= 80) {
      reason = `Excellent match! Strong alignment on target roles (${candidateProfile.roles.slice(0,2).join(", ")}) and matched key skills: ${matchingSkills.slice(0, 3).join(", ")}.`;
    } else if (finalScore >= 60) {
      reason = `Good match. Aligns with some key skills like ${matchingSkills.slice(0, 2).join(", ") || "none"}, but requires other skills or different seniority.`;
    } else {
      reason = `Low match. Limited overlap with candidate's target roles and key technical skills.`;
    }

    return {
      jobId: job.id,
      matchScore: finalScore,
      matchingSkills,
      missingSkills,
      reason,
    };
  });
}
