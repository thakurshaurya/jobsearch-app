"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe2,
  MapPin,
  Search,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Pencil,
} from "lucide-react";
import { countryOptions } from "@/lib/locations";
import { getUserProfileStatus } from "@/app/action";

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
};

type JobTargetData = {
  targetRole: string;
  targetSkills?: string[];
  targetSalaryMin?: number;
  targetSalaryMax?: number;
};

export default function ResultedJobsPage() {
  const [country, setCountry] = useState<string>("");
  const [jobTarget, setJobTarget] = useState<JobTargetData | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState<boolean>(true);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const res = await getUserProfileStatus();
        if (res.authenticated && res.jobTarget) {
          setJobTarget({
            targetRole: res.jobTarget.targetRole || "",
            targetSkills: res.jobTarget.targetSkills || [],
            targetSalaryMin: res.jobTarget.targetSalaryMin,
            targetSalaryMax: res.jobTarget.targetSalaryMax,
          });
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setFetchingProfile(false);
      }
    }
    loadUserProfile();
  }, []);

  async function executeSearch(selectedCountry: string) {
    if (!selectedCountry) {
      setError("Please select a country to search for jobs.");
      return;
    }

    if (!jobTarget || !jobTarget.targetRole) {
      setError("No saved job preferences found. Please set up your profile first.");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      let searchTerms = jobTarget.targetRole;
      if (jobTarget.targetSkills && jobTarget.targetSkills.length > 0) {
        searchTerms += ` ${jobTarget.targetSkills.slice(0, 3).join(" ")}`;
      }

      const params = new URLSearchParams({
        query: searchTerms,
        location: selectedCountry,
        country: selectedCountry,
        datePosted: "month",
      });

      const response = await fetch(`/api/jobs/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Failed to fetch jobs for the selected country.");
        setJobs([]);
        return;
      }

      setJobs(data?.jobs ?? []);
    } catch (err: any) {
      console.error("Job search error:", err);
      setError("Something went wrong while fetching jobs. Please try again.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newCountry = e.target.value;
    setCountry(newCountry);
    if (newCountry) {
      executeSearch(newCountry);
    } else {
      setJobs([]);
      setHasSearched(false);
      setError("");
    }
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!country) {
      setError("Please select a country before searching for jobs.");
      return;
    }
    executeSearch(country);
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
    } catch (err: any) {
      setError(err.message || "Something went wrong while applying");
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
        <form
          onSubmit={handleSearchSubmit}
          autoComplete="off"
          className="flex flex-col gap-8 rounded-[2rem] border border-white/10 bg-white/80 p-8 shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/75 sm:p-12"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm dark:bg-slate-900/80 dark:text-slate-100">
              <Globe2 className="h-4 w-4 text-cyan-400" />
              Tailored Job Recommendations
            </p>
            <h1 className="hero-gradient text-3xl font-extrabold sm:text-4xl">
              Jobs Matching Your Preferences
            </h1>

            {jobTarget && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-2.5 text-xs font-medium text-cyan-300">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
                  Target Role:
                </span>
                <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-cyan-300 font-bold">
                  {jobTarget.targetRole}
                </span>

                {jobTarget.targetSkills && jobTarget.targetSkills.length > 0 && (
                  <>
                    <span className="mx-1 text-slate-500">•</span>
                    <span className="font-semibold text-foreground">Skills:</span>
                    <span className="text-slate-300">
                      {jobTarget.targetSkills.join(", ")}
                    </span>
                  </>
                )}

                <Link
                  href="/upload?reset=true"
                  className="ml-2 inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-200 hover:bg-sky-500/30 transition-colors shadow-sm"
                  title="Edit application profile & target preferences"
                >
                  <Pencil className="h-3 w-3" />
                  Edit Preferences
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 rounded-[1.8rem] border border-slate-200/80 bg-slate-950/5 p-6 shadow-inner dark:border-slate-800/70 dark:bg-slate-950/40">
            <div className="relative overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg dark:bg-slate-950/80">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
                <label className="flex w-full flex-col gap-2 flex-1">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    Select Target Country <span className="text-red-400">*</span>
                  </span>

                  <div className="relative">
                    <select
                      value={country}
                      onChange={handleCountryChange}
                      required
                      className="h-14 w-full rounded-3xl border border-slate-300/80 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-slate-800 cursor-pointer"
                    >
                      <option value="">Choose a country to see recent jobs</option>
                      {countryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <MapPin className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading || !country}
                  className="h-14 inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 px-8 text-sm font-semibold text-slate-900 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-sky-500/20"
                >
                  <Search className="h-4 w-4" />
                  {loading ? "Searching..." : "Search Jobs"}
                </button>
              </div>

              {!country && (
                <p className="mt-3 text-xs font-medium text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Please select a country to fetch recent job listings for your target role.
                </p>
              )}
            </div>
          </div>
        </form>
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
                  Jobs Listed in the Last Month
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
                  Jobs in {country}
                </h2>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                {loading
                  ? "Searching recent openings..."
                  : `Showing ${jobs.length} recent result${
                      jobs.length === 1 ? "" : "s"
                    } matching "${jobTarget?.targetRole}".`}
              </p>
            </div>

            {!loading && jobs.length === 0 && (
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-950/80 dark:text-slate-300">
                No recent jobs found in {country} for "{jobTarget?.targetRole}". Try selecting a different country.
              </div>
            )}

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
                        <div className="shrink-0 rounded-3xl bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
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
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Matched to your target profile
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApplyJob(job)}
                        disabled={
                          applyingJobId === job.id || appliedJobs.has(job.id)
                        }
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          appliedJobs.has(job.id)
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-900 shadow-lg shadow-sky-500/30 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
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
          </>
        )}
      </section>
    </main>
  );
}
