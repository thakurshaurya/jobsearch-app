"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpDown,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileSearch,
  Filter,
  LayoutGrid,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Table as TableIcon,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { getSkillIcon } from "@/lib/devicons";
import { CustomSelect } from "@/components/ui/custom-select";

export type JobApplicationItem = {
  _id: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  jobUrl?: string;
  description?: string;
  requiredSkills?: string[];
  matchingSkills?: string[];
  skillGap?: string[];
  resumeScore?: number;
  matchPercentage?: number;
  chanceOfSuccess?: "High" | "Medium" | "Low";
  status: "applied" | "interviewing" | "accepted" | "rejected";
  appliedAt: string;
};

type StatusType =
  | "applied"
  | "interviewing"
  | "accepted"
  | "rejected";

type ViewMode = "card" | "table";

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | StatusType
  >("all");

  const [sortBy, setSortBy] = useState<
    "recent" | "score_desc" | "score_asc" | "company"
  >("recent");

  const [viewMode, setViewMode] = useState<ViewMode>("card");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);


  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        cache: "no-store",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load applications");
        setApplications([]);
        return;
      }

      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load applications. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);



  const handleDeleteApplication = async (
    id: string,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();

    if (
      !confirm(
        "Are you sure you want to remove this job application?"
      )
    ) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/applications?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete application");
        return;
      }

      setApplications((prev) =>
        prev.filter((app) => app._id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete application");
    } finally {
      setDeletingId(null);
    }
  };



  const handleStatusChange = async (
    id: string,
    newStatus: StatusType
  ) => {
    setUpdatingId(id);

    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update status");
        return;
      }

      setApplications((prev) =>
        prev.map((app) =>
          app._id === id
            ? {
              ...app,
              status: newStatus,
            }
            : app
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };


  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "Recently";

    try {
      const date = new Date(dateString);
      const now = new Date();

      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHour / 24);

      if (diffSec < 60) return "Just now";

      if (diffMin < 60) {
        return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
      }

      if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
      }

      if (diffDays === 1) return "Yesterday";

      if (diffDays < 30) {
        return `${diffDays} days ago`;
      }

      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  const getScoreColorConfig = (score = 0) => {
    if (score >= 67) {
      return {
        text: "text-emerald-500 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        gradient: "from-emerald-500 to-teal-400",
        badgeBg:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        label: "High Match",
      };
    }

    if (score >= 34) {
      return {
        text: "text-amber-500 dark:text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        gradient: "from-amber-500 to-yellow-400",
        badgeBg:
          "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        label: "Medium Match",
      };
    }

    return {
      text: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      gradient: "from-rose-500 to-red-400",
      badgeBg:
        "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
      label: "Low Match",
    };
  };

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case "accepted":
        return {
          label: "Accepted",
          style:
            "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          dot: "bg-emerald-500",
        };

      case "interviewing":
        return {
          label: "Interviewing",
          style:
            "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
          dot: "bg-sky-500",
        };

      case "rejected":
        return {
          label: "Rejected",
          style:
            "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
          dot: "bg-rose-500",
        };

      default:
        return {
          label: "Applied",
          style:
            "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
          dot: "bg-slate-400",
        };
    }
  };



  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();

      result = result.filter(
        (app) =>
          app.jobTitle?.toLowerCase().includes(q) ||
          app.company?.toLowerCase().includes(q) ||
          app.location?.toLowerCase().includes(q) ||
          app.matchingSkills?.some((skill) =>
            skill.toLowerCase().includes(q)
          )
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (app) => app.status === statusFilter
      );
    }

    result.sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.appliedAt).getTime() -
          new Date(a.appliedAt).getTime()
        );
      }

      if (sortBy === "score_desc") {
        return (
          (b.resumeScore ?? b.matchPercentage ?? 0) -
          (a.resumeScore ?? a.matchPercentage ?? 0)
        );
      }

      if (sortBy === "score_asc") {
        return (
          (a.resumeScore ?? a.matchPercentage ?? 0) -
          (b.resumeScore ?? b.matchPercentage ?? 0)
        );
      }

      if (sortBy === "company") {
        return (a.company || "").localeCompare(
          b.company || ""
        );
      }

      return 0;
    });

    return result;
  }, [
    applications,
    searchQuery,
    statusFilter,
    sortBy,
  ]);



  const stats = useMemo(() => {
    const total = applications.length;

    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        highMatches: 0,
        interviewing: 0,
      };
    }

    const sumScore = applications.reduce(
      (acc, curr) =>
        acc + (curr.resumeScore ?? curr.matchPercentage ?? 0),
      0
    );

    const avgScore = Math.round(sumScore / total);

    const highMatches = applications.filter(
      (app) =>
        (app.resumeScore ??
          app.matchPercentage ??
          0) >= 67
    ).length;

    const interviewing = applications.filter(
      (app) => app.status === "interviewing"
    ).length;

    return {
      total,
      avgScore,
      highMatches,
      interviewing,
    };
  }, [applications]);


  const renderSkillPills = (
    skills: string[] | undefined,
    type: "matched" | "gap"
  ) => {
    if (!skills || skills.length === 0) {
      return (
        <span className="text-[11px] italic text-muted-foreground">
          {type === "matched"
            ? "None recorded"
            : "✓ No gap"}
        </span>
      );
    }

    const visibleSkills = skills.slice(0, 6);
    const remaining = skills.length - visibleSkills.length;

    return (
      <>
        {visibleSkills.map((skill) => {
          const IconComp = getSkillIcon(skill);

          return (
            <span
              key={`${type}-${skill}`}
              className={
                type === "matched"
                  ? "inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
                  : "inline-flex items-center gap-1 rounded-md border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-500 dark:text-rose-400"
              }
            >
              <IconComp className="h-3 w-3 shrink-0" />
              {skill}
            </span>
          );
        })}

        {remaining > 0 && (
          <span className="text-[11px] text-muted-foreground">
            +{remaining}
          </span>
        )}
      </>
    );
  };



  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 sm:px-6 md:px-8 lg:px-10">
      <div className="relative mx-auto max-w-7xl">



        <section className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Application Tracker</span>
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Your{" "}
                <span className="hero-gradient">
                  Job Applications
                </span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Track your application pipeline, review your
                resume match scores, and bridge skill gaps.
              </p>
            </div>

            <Link
              href="/resultedjobs"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
            >
              <Sparkles className="h-4 w-4" />
              Find More Jobs
            </Link>
          </div>

          {!loading && applications.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">

              <div className="min-w-[210px] flex-1 rounded-2xl border border-border/80 bg-card p-4 transition-colors duration-200 hover:border-sky-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Applied
                  </span>
                  <Briefcase className="h-4 w-4 text-sky-400" />
                </div>

                <p className="mt-2 text-2xl font-black text-foreground sm:text-3xl">
                  {stats.total}
                </p>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Active tracked jobs
                </p>
              </div>

              <div className="min-w-[210px] flex-1 rounded-2xl border border-border/80 bg-card p-4 transition-colors duration-200 hover:border-cyan-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Average Match
                  </span>
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                </div>

                <p className="mt-2 text-2xl font-black text-cyan-500 sm:text-3xl">
                  {stats.avgScore}%
                </p>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Overall resume fit
                </p>
              </div>

              <div className="min-w-[210px] flex-1 rounded-2xl border border-border/80 bg-card p-4 transition-colors duration-200 hover:border-emerald-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    High Matches
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>

                <p className="mt-2 text-2xl font-black text-emerald-500 sm:text-3xl">
                  {stats.highMatches}
                </p>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Score ≥ 67%
                </p>
              </div>

              <div className="min-w-[210px] flex-1 rounded-2xl border border-border/80 bg-card p-4 transition-colors duration-200 hover:border-indigo-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Interviewing
                  </span>
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>

                <p className="mt-2 text-2xl font-black text-indigo-400 sm:text-3xl">
                  {stats.interviewing}
                </p>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  In active interview stage
                </p>
              </div>
            </div>
          )}
        </section>


        {!loading && applications.length > 0 && (
          <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 md:flex-row md:items-center md:justify-between">

            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search by job title, company, skills..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors duration-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">

              <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-background p-1 text-xs">
                {(
                  [
                    "all",
                    "applied",
                    "interviewing",
                    "accepted",
                    "rejected",
                  ] as const
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setStatusFilter(status)
                    }
                    className={`whitespace-nowrap rounded-lg px-2.5 py-1 font-medium capitalize transition-colors duration-150 ${statusFilter === status
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <CustomSelect
                value={sortBy}
                onChange={(val) =>
                  setSortBy(
                    val as
                    | "recent"
                    | "score_desc"
                    | "score_asc"
                    | "company"
                  )
                }
                options={[
                  { value: "recent", label: "Most Recent" },
                  { value: "score_desc", label: "Highest Score" },
                  { value: "score_asc", label: "Lowest Score" },
                  { value: "company", label: "Company (A-Z)" }
                ]}
                placeholder="Sort by"
                className="w-40 text-xs font-medium"
                triggerClassName="flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3.5 text-xs font-medium text-foreground outline-none transition-colors duration-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                icon={<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />}
                hideChevron={true}
              />

              <div className="flex items-center rounded-xl border border-border bg-background p-1">

                <button
                  type="button"
                  onClick={() => setViewMode("card")}
                  className={`rounded-lg p-1.5 transition-colors duration-150 ${viewMode === "card"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                  title="Card View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`rounded-lg p-1.5 transition-colors duration-150 ${viewMode === "table"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                  title="Table View"
                >
                  <TableIcon className="h-4 w-4" />
                </button>

              </div>
            </div>
          </section>
        )}


        {error && (
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={fetchApplications}
              className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-300 transition-colors duration-150 hover:bg-red-500/30"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}


        {loading && (
          <div className="flex flex-wrap gap-6">

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full rounded-3xl border border-border/60 bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
                  <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
                </div>

                <div className="mt-4 h-6 w-3/4 animate-pulse rounded-lg bg-muted" />

                <div className="mt-2 h-4 w-1/2 animate-pulse rounded-lg bg-muted" />

                <div className="mt-6 flex flex-wrap gap-2">
                  <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
                  <div className="h-5 w-20 animate-pulse rounded-md bg-muted" />
                  <div className="h-5 w-14 animate-pulse rounded-md bg-muted" />
                </div>

                <div className="mt-6 h-2 w-full animate-pulse rounded-full bg-muted" />

                <div className="mt-6 h-9 w-full animate-pulse rounded-xl bg-muted" />
              </div>
            ))}

          </div>
        )}

        {!loading &&
          !error &&
          applications.length === 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
              }}
              className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
                <FileSearch className="h-10 w-10" />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-foreground">
                You haven&apos;t applied to any jobs yet
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Discover opportunities customized to your
                skills, calculate your resume match scores,
                and track applications here.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/resultedjobs"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
                >
                  <Sparkles className="h-4 w-4" />
                  Search Personalized Jobs
                </Link>

                <Link
                  href="/upload?reset=true"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-secondary"
                >
                  Update Resume / Bio
                </Link>
              </div>
            </motion.div>
          )}

        {!loading &&
          !error &&
          applications.length > 0 &&
          filteredApplications.length === 0 && (
            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-border bg-card/50 p-8 text-center">
              <Filter className="h-12 w-12 text-muted-foreground" />

              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No applications match your filter
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search terms or status
                filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-5 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-secondary/80"
              >
                Reset Filters
              </button>
            </div>
          )}


        {!loading &&
          !error &&
          filteredApplications.length > 0 &&
          viewMode === "card" && (
            <div className="flex flex-wrap gap-5">

              {filteredApplications.map((app) => {
                const score =
                  app.resumeScore ??
                  app.matchPercentage ??
                  0;

                const scoreConfig =
                  getScoreColorConfig(score);

                const statusConfig =
                  getStatusBadgeConfig(app.status);

                return (
                  <motion.article
                    key={app._id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    className="group flex w-full flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl lg:w-[calc(33.333%-16px)]"
                  >

                    <div>

                      <div className="flex items-center justify-between gap-2">

                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatRelativeTime(
                            app.appliedAt
                          )}
                        </span>

                          <CustomSelect
                            value={app.status}
                            disabled={updatingId === app._id}
                            onChange={(val) =>
                              handleStatusChange(
                                app._id,
                                val as StatusType
                              )
                            }
                            options={[
                              { value: "applied", label: "Applied" },
                              { value: "interviewing", label: "Interviewing" },
                              { value: "accepted", label: "Accepted" },
                              { value: "rejected", label: "Rejected" }
                            ]}
                            placeholder="Status"
                            className="w-32 text-xs font-semibold capitalize"
                            triggerClassName={`flex h-7 w-full items-center justify-between rounded-full border px-2.5 text-xs font-semibold capitalize outline-none transition-colors duration-150 cursor-pointer ${statusConfig.style}`}
                            optionsClassName="bg-popover text-foreground border-border"
                          />
                      </div>

                      <div className="mt-4">
                        <h2 className="text-xl font-bold tracking-tight text-foreground transition-colors duration-150 group-hover:text-sky-400">
                          {app.jobTitle ||
                            "Software Engineer"}
                        </h2>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">

                          <span className="flex items-center gap-1 font-medium text-foreground/90">
                            <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                            {app.company || "Company"}
                          </span>

                          {app.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {app.location}
                            </span>
                          )}

                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/50 p-3.5">

                        <div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-500">
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Matched Skills
                            </span>

                            <span>
                              {app.matchingSkills?.length ||
                                0}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {renderSkillPills(
                              app.matchingSkills,
                              "matched"
                            )}
                          </div>
                        </div>

                        <div className="border-t border-border/40 pt-3">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-rose-400">
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Missing Skills
                            </span>

                            <span>
                              {app.skillGap?.length || 0}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {renderSkillPills(
                              app.skillGap,
                              "gap"
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">
                            Resume Match
                          </span>

                          <span
                            className={`font-bold ${scoreConfig.text}`}
                          >
                            {score}% Match
                          </span>
                        </div>

                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${scoreConfig.gradient} transition-[width] duration-500 ease-out`}
                            style={{
                              width: `${Math.min(
                                Math.max(score, 0),
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between">

                          <span className="text-[11px] text-muted-foreground">
                            Chance of Interview:
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${scoreConfig.badgeBg}`}
                          >
                            <Sparkles className="h-3 w-3" />

                            {app.chanceOfSuccess ||
                              (score >= 70
                                ? "High"
                                : score >= 40
                                  ? "Medium"
                                  : "Low")}

                            {" "}Chance
                          </span>

                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-4">

                      {app.jobUrl ? (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2 text-xs font-semibold text-sky-400 transition-colors duration-150 hover:bg-sky-500/20"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Job
                        </a>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">
                          No direct link
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) =>
                          handleDeleteApplication(
                            app._id,
                            e
                          )
                        }
                        disabled={
                          deletingId === app._id
                        }
                        className="inline-flex items-center gap-1 rounded-xl p-2 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        title="Remove from tracking"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          Remove
                        </span>
                      </button>
                    </div>

                  </motion.article>
                );
              })}

            </div>
          )}


        {!loading &&
          !error &&
          filteredApplications.length > 0 &&
          viewMode === "table" && (
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">

              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="border-b border-border bg-secondary/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">
                        Job & Company
                      </th>

                      <th className="px-4 py-4">
                        Location
                      </th>

                      <th className="px-4 py-4">
                        Match Score
                      </th>

                      <th className="px-4 py-4">
                        Status
                      </th>

                      <th className="px-4 py-4">
                        Your Skills
                      </th>

                      <th className="px-4 py-4">
                        Skill Gap
                      </th>

                      <th className="px-4 py-4">
                        Applied
                      </th>

                      <th className="px-6 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border/60">

                    {filteredApplications.map((app) => {
                      const score =
                        app.resumeScore ??
                        app.matchPercentage ??
                        0;

                      const scoreConfig =
                        getScoreColorConfig(score);

                      const statusConfig =
                        getStatusBadgeConfig(app.status);

                      return (
                        <tr
                          key={app._id}
                          className="transition-colors duration-150 hover:bg-secondary/30"
                        >

                          <td className="px-6 py-4">
                            <div className="font-bold text-foreground">
                              {app.jobTitle ||
                                "Software Engineer"}
                            </div>

                            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3 text-cyan-400" />
                              {app.company || "Company"}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-xs text-muted-foreground">
                            {app.location ||
                              "Remote / Unspecified"}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">

                              <div
                                className={`w-12 text-xs font-bold ${scoreConfig.text}`}
                              >
                                {score}%
                              </div>

                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${scoreConfig.badgeBg}`}
                              >
                                {app.chanceOfSuccess ||
                                  (score >= 70
                                    ? "High"
                                    : score >= 40
                                      ? "Med"
                                      : "Low")}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <CustomSelect
                              value={app.status}
                              disabled={updatingId === app._id}
                              onChange={(val) =>
                                handleStatusChange(
                                  app._id,
                                  val as StatusType
                                )
                              }
                              options={[
                                { value: "applied", label: "Applied" },
                                { value: "interviewing", label: "Interviewing" },
                                { value: "accepted", label: "Accepted" },
                                { value: "rejected", label: "Rejected" }
                              ]}
                              placeholder="Status"
                              className="w-32 text-xs font-semibold capitalize"
                              triggerClassName={`flex h-7 w-full items-center justify-between rounded-full border px-2.5 text-xs font-semibold capitalize outline-none transition-colors duration-150 cursor-pointer ${statusConfig.style}`}
                              optionsClassName="bg-popover text-foreground border-border"
                            />
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex max-w-xs flex-wrap gap-1">
                              {app.matchingSkills &&
                                app.matchingSkills.length > 0 ? (
                                app.matchingSkills
                                  .slice(0, 3)
                                  .map((skill) => (
                                    <span
                                      key={skill}
                                      className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500"
                                    >
                                      {skill}
                                    </span>
                                  ))
                              ) : (
                                <span className="text-[11px] text-muted-foreground">
                                  -
                                </span>
                              )}

                              {app.matchingSkills &&
                                app.matchingSkills.length >
                                3 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    +
                                    {app.matchingSkills.length -
                                      3}
                                  </span>
                                )}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex max-w-xs flex-wrap gap-1">
                              {app.skillGap &&
                                app.skillGap.length > 0 ? (
                                app.skillGap
                                  .slice(0, 3)
                                  .map((skill) => (
                                    <span
                                      key={skill}
                                      className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-500"
                                    >
                                      {skill}
                                    </span>
                                  ))
                              ) : (
                                <span className="text-[10px] text-emerald-500">
                                  Perfect Match
                                </span>
                              )}

                              {app.skillGap &&
                                app.skillGap.length >
                                3 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    +
                                    {app.skillGap.length -
                                      3}
                                  </span>
                                )}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-xs text-muted-foreground">
                            {formatRelativeTime(
                              app.appliedAt
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">

                              {app.jobUrl && (
                                <a
                                  href={app.jobUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg p-2 text-sky-400 transition-colors duration-150 hover:bg-sky-500/10"
                                  title="Open Job Link"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={(e) =>
                                  handleDeleteApplication(
                                    app._id,
                                    e
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  app._id
                                }
                                className="rounded-lg p-2 text-muted-foreground transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                title="Delete Application"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>
                </table>

              </div>
            </div>
          )}

      </div>
    </main>
  );
}