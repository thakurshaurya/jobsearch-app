export interface CandidateInfo {
  name: string | null;
  experienceYears: number | null;
  seniority: string | null;
  education: string[];
}

export interface ResumeAnalysis {
  candidate: CandidateInfo;
  skills: string[];
  roles: string[];
  locations: string[];
  searchQueries: string[];
}
