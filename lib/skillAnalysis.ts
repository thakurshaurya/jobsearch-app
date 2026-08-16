
export const COMMON_TECH_SKILLS: string[] = [
  "React",
  "Node.js",
  "MongoDB",
  "TypeScript",
  "JavaScript",
  "Python",
  "AWS",
  "Docker",
  "Kubernetes",
  "Vue.js",
  "Angular",
  "Express",
  "Django",
  "PostgreSQL",
  "MySQL",
  "Git",
  "REST APIs",
  "GraphQL",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Next.js",
  "Redux",
  "Java",
  "C++",
  "C#",
  ".NET",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Flutter",
  "React Native",
  "Redis",
  "Kafka",
  "CI/CD",
  "GCP",
  "Azure",
];

/**
 * Extracts job required skills from job description text using keyword matching
 * against a list of common tech skills.
 *
 * @param jobDescription - Raw text of the job description
 * @returns Array of found skills in lowercase
 */
export function parseJobSkills(jobDescription: string): string[] {
  if (!jobDescription || typeof jobDescription !== "string") {
    return [];
  }

  const foundSkills: Set<string> = new Set();

  for (const skill of COMMON_TECH_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefix = /^\w/.test(skill) ? "\\b" : "";
    const suffix = /\w$/.test(skill) ? "\\b" : "";
    const regex = new RegExp(`${prefix}${escaped}${suffix}`, "i");

    if (regex.test(jobDescription)) {
      foundSkills.add(skill.toLowerCase());
    }
  }

  return Array.from(foundSkills);
}

/**
 * Compares user's parsed skills against job's required skills and returns
 * skills that the job requires but the user does not possess.
 *
 * @param userSkills - Array of skills the user possesses
 * @param requiredJobSkills - Array of skills required by the job
 * @returns Array of missing skills in lowercase
 */
export function calculateSkillGap(
  userSkills: string[],
  requiredJobSkills: string[]
): string[] {
  if (!requiredJobSkills || !Array.isArray(requiredJobSkills)) {
    return [];
  }

  const userSkillSet = new Set(
    (userSkills || [])
      .filter((s) => typeof s === "string" && s.trim().length > 0)
      .map((s) => s.toLowerCase().trim())
  );

  const missingSkills: Set<string> = new Set();

  for (const skill of requiredJobSkills) {
    if (typeof skill === "string" && skill.trim().length > 0) {
      const normalizedSkill = skill.toLowerCase().trim();
      if (!userSkillSet.has(normalizedSkill)) {
        missingSkills.add(normalizedSkill);
      }
    }
  }

  return Array.from(missingSkills);
}

/**
 * Calculates a match score (0-100) based on the percentage of required job skills
 * matched by the user's skills.
 *
 * @param userSkills - Array of skills the user possesses
 * @param requiredJobSkills - Array of skills required by the job
 * @returns Integer score between 0 and 100
 */
export function calculateResumeScore(
  userSkills: string[],
  requiredJobSkills: string[]
): number {
  if (!requiredJobSkills || !Array.isArray(requiredJobSkills)) {
    return 0;
  }

  const normalizedRequiredSkills = Array.from(
    new Set(
      requiredJobSkills
        .filter((s) => typeof s === "string" && s.trim().length > 0)
        .map((s) => s.toLowerCase().trim())
    )
  );

  if (normalizedRequiredSkills.length === 0) {
    return 0;
  }

  const userSkillSet = new Set(
    (userSkills || [])
      .filter((s) => typeof s === "string" && s.trim().length > 0)
      .map((s) => s.toLowerCase().trim())
  );

  let matchingSkillsCount = 0;
  for (const skill of normalizedRequiredSkills) {
    if (userSkillSet.has(skill)) {
      matchingSkillsCount++;
    }
  }

  const score = Math.round(
    (matchingSkillsCount / normalizedRequiredSkills.length) * 100
  );

  return Math.min(100, Math.max(0, score));
}
