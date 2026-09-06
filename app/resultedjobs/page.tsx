"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe2,
  MapPin,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Pencil,
  Clock3,
  X,
  Plus,
  IndianRupee,
} from "lucide-react";
import { getUserProfileStatus, saveJobTarget } from "@/app/action";
import { countryOptions } from "@/lib/locations";
import { CustomSelect } from "@/components/ui/custom-select";

type Job = {
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
  matchScore?: number | null;
  matchingSkills?: string[];
  missingSkills?: string[];
  matchReason?: string | null;
};

type JobTargetData = {
  targetRole: string;
  targetSkills: string[];
  targetSalaryMin?: number;
  targetSalaryMax?: number;
  targetCountry: string;
};

export default function ResultedJobsPage() {
  const router = useRouter();
  const [country, setCountry] = useState<string>("");
  const [jobTarget, setJobTarget] = useState<JobTargetData | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState<boolean>(true);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  const [loadingMessage, setLoadingMessage] = useState<string>("Searching for jobs...");

  useEffect(() => {
    if (!loading) return;

    const messages = [
      "Searching for jobs...",
      "AI is finding the best suited jobs for you...",
      "AI is creating the list...",
      "Filtering and ranking job opportunities...",
      "Comparing job requirements against your skills...",
      "Almost done, compiling final list..."
    ];

    let index = 0;
    setLoadingMessage(messages[0]);

    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 4500);

    return () => clearInterval(interval);
  }, [loading]);

  // Preferences edit state
  const [isEditingPreferences, setIsEditingPreferences] = useState<boolean>(false);
  const [prefRole, setPrefRole] = useState<string>("");
  const [prefCountry, setPrefCountry] = useState<string>("India");
  const [prefSkills, setPrefSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>("");
  const [prefSalaryMin, setPrefSalaryMin] = useState<string>("");
  const [prefSalaryMax, setPrefSalaryMax] = useState<string>("");
  const [savingPreferences, setSavingPreferences] = useState<boolean>(false);
  const [prefError, setPrefError] = useState<string>("");

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const res = await getUserProfileStatus();
        if (res.authenticated && res.jobTarget) {
          const targetCountry = res.jobTarget.targetCountry || "India";
          const targetRole = res.jobTarget.targetRole || "";
          const targetSkills = res.jobTarget.targetSkills || [];
          setJobTarget({
            targetRole,
            targetSkills,
            targetSalaryMin: res.jobTarget.targetSalaryMin,
            targetSalaryMax: res.jobTarget.targetSalaryMax,
            targetCountry,
          });
          setCountry(targetCountry);
          setPrefRole(targetRole);
          setPrefCountry(targetCountry);
          setPrefSkills(targetSkills);
          setPrefSalaryMin(res.jobTarget.targetSalaryMin ? String(res.jobTarget.targetSalaryMin) : "");
          setPrefSalaryMax(res.jobTarget.targetSalaryMax ? String(res.jobTarget.targetSalaryMax) : "");
          executeSearch(targetCountry);
        } else if (res.authenticated) {
          router.push("/upload");
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setFetchingProfile(false);
      }
    }
    loadUserProfile();
  }, [router]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !prefSkills.includes(trimmed)) {
      setPrefSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setPrefSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  async function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    if (!prefRole.trim()) {
      setPrefError("Target role is required");
      return;
    }
    if (!prefCountry.trim()) {
      setPrefError("Target country is required");
      return;
    }

    setSavingPreferences(true);
    setPrefError("");

    try {
      const minSal = prefSalaryMin ? parseInt(prefSalaryMin, 10) : undefined;
      const maxSal = prefSalaryMax ? parseInt(prefSalaryMax, 10) : undefined;

      const res = await saveJobTarget(
        prefRole.trim(),
        prefSkills,
        minSal,
        maxSal,
        prefCountry.trim()
      );

      if (res.error) {
        setPrefError(res.error);
        return;
      }

      setJobTarget({
        targetRole: prefRole.trim(),
        targetSkills: prefSkills,
        targetSalaryMin: minSal,
        targetSalaryMax: maxSal,
        targetCountry: prefCountry.trim(),
      });
      setCountry(prefCountry.trim());
      setIsEditingPreferences(false);
      executeSearch(prefCountry.trim());
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update preferences";
      setPrefError(errorMsg);
    } finally {
      setSavingPreferences(false);
    }
  }

  async function executeSearch(selectedCountry: string) {
    if (!selectedCountry) {
      setError("Please select a country to search for jobs.");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        country: selectedCountry,
      });

      const response = await fetch(`/api/jobs/personalized?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Failed to fetch jobs for the selected country.");
        setJobs([]);
        return;
      }

      setJobs(data?.jobs ?? []);
    } catch (err: unknown) {
      console.error("Job search error:", err);
      setError("Something went wrong while fetching jobs. Please try again.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyJob(job: Job) {
    setApplyingJobId(job.id);

    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          jobUrl: job.applyUrl,
          description: job.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to apply to job");
        return;
      }

      setAppliedJobs((prev) => new Set([...prev, job.id]));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong while applying";
      setError(errorMsg);
    } finally {
      setApplyingJobId(null);
    }
  }

  if (fetchingProfile) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading your job preferences...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(15,23,42,0.12),transparent_60%)]" />

      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 rounded-[2rem] border border-white/10 bg-white/80 p-8 shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/75 sm:p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="hero-gradient py-1 text-3xl font-extrabold sm:text-4xl">
              Jobs Matching Your Preferences
            </h1>

            {jobTarget && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-2.5 text-xs font-medium text-cyan-300">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Briefcase className="h-3.5 w-3.5 text-cyan-500" />
                  Target Role:
                </span>
                <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-cyan-500 font-bold">
                  {jobTarget.targetRole}
                </span>

                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  Country:
                </span>
                <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-rose-400 font-bold">
                  {jobTarget.targetCountry}
                </span>

                {jobTarget.targetSkills && jobTarget.targetSkills.length > 0 && (
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-foreground">Skills:</span>
                    <span className="text-slate-500">
                      {jobTarget.targetSkills.join(", ")}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (jobTarget) {
                      setPrefRole(jobTarget.targetRole || "");
                      setPrefCountry(jobTarget.targetCountry || country || "India");
                      setPrefSkills(jobTarget.targetSkills || []);
                      setPrefSalaryMin(jobTarget.targetSalaryMin ? String(jobTarget.targetSalaryMin) : "");
                      setPrefSalaryMax(jobTarget.targetSalaryMax ? String(jobTarget.targetSalaryMax) : "");
                    }
                    setPrefError("");
                    setIsEditingPreferences(true);
                  }}
                  className="ml-2 inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-400 hover:bg-sky-500/30 transition-colors shadow-sm cursor-pointer"
                  title="Change your target role, country, and skills"
                >
                  <Pencil className="h-3 w-3" />
                  Change Preferences
                </button>
              </div>
            )}

            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Clock3 className="h-3.5 w-3.5" />
                Filtered: Uploaded within Last 14 Days (2 Weeks Max)
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {!hasSearched && !country && (
          <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-10 text-center shadow-lg backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/80">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              <Globe2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">
              Select a Country to Begin
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Please choose a country from the dropdown above to fetch the most recent job opportunities matching your specified target role (
              <strong className="text-cyan-400">{jobTarget?.targetRole || "Developer"}</strong>
              ).
            </p>
          </div>
        )}

        {hasSearched && !error && (
          <>
            <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/80 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Jobs Listed in the Last 2 Weeks (14 Days Max)
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                  Jobs in {country}
                </h2>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                {loading
                  ? "Searching recent openings..."
                  : `Showing ${jobs.length} recent result${jobs.length === 1 ? "" : "s"
                  } matching "${jobTarget?.targetRole}".`}
              </p>
            </div>

            {!loading && jobs.length === 0 && (
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-950/80 dark:text-slate-300">
                No recent jobs found in {country} for &quot;{jobTarget?.targetRole}&quot;. Try selecting a different country.
              </div>
            )}

            {loading ? (
              <div className="w-full rounded-[2rem] border border-cyan-500/20 bg-cyan-500/5 p-12 text-center shadow-lg backdrop-blur-xl flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
                <h3 className="text-lg font-bold text-slate-950 dark:text-white tracking-wide">
                  Compiling Personalized Recommendations
                </h3>
                <p className="text-sm text-cyan-400 font-semibold animate-pulse">
                  {loadingMessage}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {jobs.map((job) => (
                  <article
                    key={job.id}
                    className="group w-full overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700/70 dark:bg-slate-950/80 lg:w-[calc(50%-10px)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <h3 className="text-xl font-semibold text-slate-950 transition-colors group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                            {job.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {job.company}
                          </p>
                        </div>

                        {job.postedDate && (
                          <div className="shrink-0 rounded-3xl bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-200 flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5 text-cyan-500" />
                            {job.postedDate}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
                        <p className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-cyan-400" />
                          {job.location}
                        </p>

                        {job.remote && (
                          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                            Remote
                          </span>
                        )}
                      </div>

                      {job.employmentType && (
                        <div className="mt-3">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            {job.employmentType}
                          </span>
                        </div>
                      )}

                      {job.salary && (
                        <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {job.salary}
                        </p>
                      )}

                      {/* AI Match Section */}
                      {job.matchScore !== undefined && job.matchScore !== null && (
                        <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-300 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5" />
                              AI Match Analysis
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold border ${job.matchScore >= 75
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                              : job.matchScore >= 50
                                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                                : "bg-red-500/15 border-red-500/30 text-red-400"
                              }`}>
                              {job.matchScore}% Match
                            </span>
                          </div>

                          {job.matchReason && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {job.matchReason}
                            </p>
                          )}

                          {/* Matching / Missing Skills */}
                          <div className="flex flex-col gap-2 pt-1 border-t border-cyan-500/10">
                            {job.matchingSkills && job.matchingSkills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider shrink-0 mr-1">
                                  Matching:
                                </span>
                                {job.matchingSkills.slice(0, 5).map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}

                            {job.missingSkills && job.missingSkills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider shrink-0 mr-1">
                                  Missing:
                                </span>
                                {job.missingSkills.slice(0, 5).map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/20"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {job.matchScore !== undefined && job.matchScore !== null ? `AI-matched and ranked (${job.matchScore}%)` : "Matched to your target profile"}
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleApplyJob(job)}
                          disabled={
                            applyingJobId === job.id || appliedJobs.has(job.id)
                          }
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${appliedJobs.has(job.id)
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-blue-500 text-white hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                            }`}
                        >
                          {applyingJobId === job.id ? (
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Applying...
                            </span>
                          ) : appliedJobs.has(job.id) ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              Interested
                            </span>
                          ) : (
                            "Interested"
                          )}
                        </button>

                        {job.applyUrl && (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-100 hover:text-cyan-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-300"
                          >
                            View & Apply ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Edit Job Preferences Modal */}
      <AnimatePresence>
        {isEditingPreferences && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/95 sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <h2 className="hero-gradient text-xl font-bold">
                    Edit Job Preferences
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Update your target role, country, and skills to refresh your personalized recommendations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPreferences(false)}
                  className="rounded-full p-1.5 text-muted-foreground transition hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSavePreferences} className="mt-6 space-y-5">
                {/* Target Role */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Target Role / Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-border bg-background px-4 transition-all focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={prefRole}
                      onChange={(e) => setPrefRole(e.target.value)}
                      placeholder="e.g. Frontend Engineer, Full Stack Developer"
                      className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                {/* Target Country */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Target Country <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    options={countryOptions}
                    value={prefCountry}
                    onChange={(val) => setPrefCountry(val)}
                    placeholder="Select Country"
                    icon={<Globe2 className="h-4 w-4 text-cyan-400" />}
                  />
                </div>

                {/* Target Skills */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Target Skills
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Add a skill (e.g. React, TypeScript, Node.js)"
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-600 hover:bg-cyan-500/20 dark:text-cyan-300 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  {prefSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {prefSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Salary Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">
                      Min Salary (Annual)
                    </label>
                    <div className="flex items-center rounded-xl border border-border bg-background px-3 transition-all focus-within:border-cyan-500">
                      <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="number"
                        value={prefSalaryMin}
                        onChange={(e) => setPrefSalaryMin(e.target.value)}
                        placeholder="e.g. 500000"
                        className="w-full bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">
                      Max Salary (Annual)
                    </label>
                    <div className="flex items-center rounded-xl border border-border bg-background px-3 transition-all focus-within:border-cyan-500">
                      <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="number"
                        value={prefSalaryMax}
                        onChange={(e) => setPrefSalaryMax(e.target.value)}
                        placeholder="e.g. 1500000"
                        className="w-full bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 shrink-0" />
                  <span>Job search results strictly enforce listings uploaded within the last 14 days (2 weeks max).</span>
                </div>

                {prefError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                    {prefError}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingPreferences(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPreferences}
                    className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {savingPreferences ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving & Searching...
                      </>
                    ) : (
                      "Save & Refresh Jobs"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
