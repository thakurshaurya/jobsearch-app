export interface JSearchJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  location: string;
  postedDate?: string | null;
  salary?: string | null;
  applyUrl?: string | null;
  description?: string;
  employmentType?: string | null;
  remote?: boolean;
}

export interface MatchedJob extends JSearchJob {
  matchScore: number | null;
  matchingSkills: string[];
  missingSkills: string[];
  matchReason: string | null;
}
