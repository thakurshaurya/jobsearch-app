"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  MapPin,
  ExternalLink,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Check,
  ChevronDown,
  Building2,
  FileSearch,
} from "lucide-react";
import { getSkillIcon } from "@/lib/devicons";

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

export default function ApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/applications");
      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load applications");
        setApplications([]);
      } else {
        setApplications(data.applications || []);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load applications. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDeleteApplication = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to remove this job application?")) {
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
      } else {
        setApplications((prev) => prev.filter((app) => app._id !== id));
      }
    } catch (err: any) {
      alert(err?.message || "Failed to delete application");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "applied" | "interviewing" | "accepted" | "rejected"
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update status");
      } else {
        setApplications((prev) =>
          prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update status");
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
      if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
      if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 30) return `${diffDays} days ago`;
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  const getScoreColorConfig = (score: number = 0) => {
    if (score >= 67) {
      return {
        text: "text-emerald-500 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        gradient: "from-emerald-500 to-teal-400",
        badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        label: "High Match",
      };
    }
    if (score >= 34) {
      return {
        text: "text-amber-500 dark:text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        gradient: "from-amber-500 to-yellow-400",
        badgeBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        label: "Medium Match",
      };
    }
    return {
      text: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      gradient: "from-rose-500 to-red-400",
      badgeBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
      label: "Low Match",
    };
  };

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case "accepted":
        return {
          label: "Accepted",
          style: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          dot: "bg-emerald-500",
        };
      case "interviewing":
        return {
          label: "Interviewing",
          style: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
          dot: "bg-sky-500 animate-pulse",
        };
      case "rejected":
        return {
          label: "Rejected",
          style: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
          dot: "bg-rose-500",
        };
      case "applied":
      default:
        return {
          label: "Applied",
          style: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
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
          app.matchingSkills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((app) => app.status === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      }
      if (sortBy === "score_desc") {
        return (b.resumeScore ?? 0) - (a.resumeScore ?? 0);
      }
      if (sortBy === "score_asc") {
        return (a.resumeScore ?? 0) - (b.resumeScore ?? 0);
      }
      if (sortBy === "company") {
        return (a.company || "").localeCompare(b.company || "");
      }
      return 0;
    });

    return result;
  }, [applications, searchQuery, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const total = applications.length;
    if (total === 0) {
      return { total: 0, avgScore: 0, highMatches: 0, interviewing: 0 };
    }
    const sumScore = applications.reduce((acc, curr) => acc + (curr.resumeScore || 0), 0);
    const avgScore = Math.round(sumScore / total);
    const highMatches = applications.filter((a) => (a.resumeScore || 0) >= 67).length;
    const interviewing = applications.filter((a) => a.status === "interviewing").length;

    return { total, avgScore, highMatches, interviewing };
  }, [applications]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <section className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Application Tracker</span>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Your <span className="hero-gradient">Job Applications</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Track your application pipeline, review your resume match scores, and bridge skill gaps.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/resultedjobs"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                Find More Jobs
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          {!loading && applications.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xl transition-all hover:border-sky-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Total Applied</span>
                  <Briefcase className="h-4 w-4 text-sky-400" />
                </div>
                <p className="mt-2 text-2xl font-black text-foreground sm:text-3xl">
                  {stats.total}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Active tracked jobs</p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xl transition-all hover:border-cyan-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Average Match</span>
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                </div>
                <p className="mt-2 text-2xl font-black text-cyan-500 sm:text-3xl">
                  {stats.avgScore}%
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Overall resume fit</p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xl transition-all hover:border-emerald-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">High Matches</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="mt-2 text-2xl font-black text-emerald-500 sm:text-3xl">
                  {stats.highMatches}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Score &ge; 67%</p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xl transition-all hover:border-indigo-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Interviewing</span>
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
                <p className="mt-2 text-2xl font-black text-indigo-400 sm:text-3xl">
                  {stats.interviewing}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">In active interview stage</p>
              </div>
            </div>
          )}
        </section>

        {/* ================= CONTROLS SECTION (Search, Filter, Sort, View Switch) ================= */}
        {!loading && applications.length > 0 && (
          <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm backdrop-blur-xl sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, company, skills..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder:text-muted-foreground"
              />
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1 text-xs">
                {(["all", "applied", "interviewing", "accepted", "rejected"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-lg px-2.5 py-1 font-medium capitalize transition-all ${statusFilter === status
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>

              {/* Sort Selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 appearance-none rounded-xl border border-border bg-background px-3.5 pr-8 text-xs font-medium text-foreground outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="recent">Most Recent</option>
                  <option value="score_desc">Highest Score</option>
                  <option value="score_asc">Lowest Score</option>
                  <option value="company">Company (A-Z)</option>
                </select>
                <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center rounded-xl border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("card")}
                  className={`rounded-lg p-1.5 transition-colors ${viewMode === "card"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                  title="Grid Card View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`rounded-lg p-1.5 transition-colors ${viewMode === "table"
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

        {/* ================= ERROR STATE ================= */}
        {error && (
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchApplications}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/30"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* ================= LOADING STATE ================= */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 rounded-full bg-muted" />
                  <div className="h-4 w-16 rounded-full bg-muted" />
                </div>
                <div className="mt-4 h-6 w-3/4 rounded-lg bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded-lg bg-muted" />
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-xl bg-muted/60" />
                  <div className="h-20 rounded-xl bg-muted/60" />
                </div>
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/40">
                  <div className="h-8 w-24 rounded-lg bg-muted" />
                  <div className="h-8 w-20 rounded-lg bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= EMPTY STATE (NO APPLICATIONS OVERALL) ================= */}
        {!loading && !error && applications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center backdrop-blur-xl"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-sky-500/30 bg-sky-500/10 text-sky-400 shadow-inner shadow-sky-500/20">
              <FileSearch className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-foreground">
              You haven&apos;t applied to any jobs yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Discover opportunities customized to your skills, calculate your resume match scores, and track applications here.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link
                href="/resultedjobs"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                Search Personalized Jobs
              </Link>
              <Link
                href="/upload?reset=true"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
              >
                Update Resume / Bio
              </Link>
            </div>
          </motion.div>
        )}

        {/* ================= EMPTY FILTER STATE ================= */}
        {!loading && !error && applications.length > 0 && filteredApplications.length === 0 && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-border bg-card/40 p-8 text-center backdrop-blur-xl">
            <Filter className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No applications match your filter</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search terms or status filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-5 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary/80"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ================= MAIN CONTENT - CARD VIEW ================= */}
        {!loading && !error && filteredApplications.length > 0 && viewMode === "card" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredApplications.map((app) => {
                const score = app.resumeScore ?? app.matchPercentage ?? 0;
                const scoreConfig = getScoreColorConfig(score);
                const statusConfig = getStatusBadgeConfig(app.status);

                return (
                  <motion.article
                    key={app._id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-500/40 "
                  >
                    {/* Top Glow Accent */}
                    {/* <div
                      className={`pointer-events-none absolute -top-24 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full bg-gradient-to-r ${scoreConfig.gradient} opacity-10 blur-2xl transition-opacity group-hover:opacity-25`}
                    /> */}

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatRelativeTime(app.appliedAt)}
                        </span>

                        <div className="relative">
                          <select
                            value={app.status}
                            disabled={updatingId === app._id}
                            onChange={(e) =>
                              handleStatusChange(
                                app._id,
                                e.target.value as "applied" | "interviewing" | "accepted" | "rejected"
                              )
                            }
                            className={`cursor-pointer appearance-none rounded-full border px-3 py-1 pr-6 text-xs font-semibold capitalize outline-none transition-all ${statusConfig.style}`}
                          >
                            <option value="applied" className="bg-popover text-foreground">
                              Applied
                            </option>
                            <option value="interviewing" className="bg-popover text-foreground">
                              Interviewing
                            </option>
                            <option value="accepted" className="bg-popover text-foreground">
                              Accepted
                            </option>
                            <option value="rejected" className="bg-popover text-foreground">
                              Rejected
                            </option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-70" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <h2 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-sky-400">
                          {app.jobTitle || "Software Engineer"}
                        </h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium text-foreground/90">
                            <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                            {app.company || "Company"}
                          </span>
                          {app.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              {app.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-border/60 bg-background/50 p-3.5 text-xs sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-500">
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Your Skills
                            </span>
                            <span>{app.matchingSkills?.length || 0}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {app.matchingSkills && app.matchingSkills.length > 0 ? (
                              app.matchingSkills.map((skill) => {
                                const IconComp = getSkillIcon(skill);
                                return (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
                                  >
                                    <IconComp className="h-3 w-3 shrink-0" />
                                    {skill}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-[11px] italic text-muted-foreground">
                                None recorded
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2 sm:border-t-0 sm:border-l sm:pl-3 sm:pt-0">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-rose-400">
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Skills Needed
                            </span>
                            <span>{app.skillGap?.length || 0}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {app.skillGap && app.skillGap.length > 0 ? (
                              app.skillGap.map((skill) => {
                                const IconComp = getSkillIcon(skill);
                                return (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 rounded-md border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-500 dark:text-rose-400"
                                  >
                                    <IconComp className="h-3 w-3 shrink-0" />
                                    {skill}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-[11px] font-medium text-emerald-500">
                                ✓ No gap! Perfect fit
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">Resume Match</span>
                          <span className={`font-bold ${scoreConfig.text}`}>{score}% Match</span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${scoreConfig.gradient} rounded-full`}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-muted-foreground">
                            Chance of Interview:
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${scoreConfig.badgeBg}`}
                          >
                            <Sparkles className="h-3 w-3" />
                            {app.chanceOfSuccess || (score >= 70 ? "High" : score >= 40 ? "Medium" : "Low")} Chance
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
                          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2 text-xs font-semibold text-sky-400 transition-colors hover:bg-sky-500/20"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Job
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No direct link
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteApplication(app._id, e)}
                        disabled={deletingId === app._id}
                        className="inline-flex items-center gap-1 rounded-xl p-2 text-xs font-medium text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        title="Remove from tracking"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!loading && !error && filteredApplications.length > 0 && viewMode === "table" && (
          <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/80 shadow-xl backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-secondary/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-6 py-4">Job & Company</th>
                    <th scope="col" className="px-4 py-4">Location</th>
                    <th scope="col" className="px-4 py-4">Match Score</th>
                    <th scope="col" className="px-4 py-4">Status</th>
                    <th scope="col" className="px-4 py-4">Your Skills</th>
                    <th scope="col" className="px-4 py-4">Skill Gap</th>
                    <th scope="col" className="px-4 py-4">Applied</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredApplications.map((app) => {
                    const score = app.resumeScore ?? app.matchPercentage ?? 0;
                    const scoreConfig = getScoreColorConfig(score);
                    const statusConfig = getStatusBadgeConfig(app.status);

                    return (
                      <tr
                        key={app._id}
                        className="transition-colors hover:bg-secondary/30"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">
                            {app.jobTitle || "Software Engineer"}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3 text-cyan-400" />
                            {app.company || "Company"}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          {app.location || "Remote / Unspecified"}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 text-xs font-bold ${scoreConfig.text}">
                              {score}%
                            </div>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${scoreConfig.badgeBg}`}
                            >
                              {app.chanceOfSuccess || (score >= 70 ? "High" : score >= 40 ? "Med" : "Low")}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <select
                            value={app.status}
                            disabled={updatingId === app._id}
                            onChange={(e) =>
                              handleStatusChange(
                                app._id,
                                e.target.value as "applied" | "interviewing" | "accepted" | "rejected"
                              )
                            }
                            className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold capitalize outline-none ${statusConfig.style}`}
                          >
                            <option value="applied" className="bg-popover text-foreground">
                              Applied
                            </option>
                            <option value="interviewing" className="bg-popover text-foreground">
                              Interviewing
                            </option>
                            <option value="accepted" className="bg-popover text-foreground">
                              Accepted
                            </option>
                            <option value="rejected" className="bg-popover text-foreground">
                              Rejected
                            </option>
                          </select>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {app.matchingSkills && app.matchingSkills.length > 0 ? (
                              app.matchingSkills.slice(0, 3).map((s) => (
                                <span
                                  key={s}
                                  className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-muted-foreground">-</span>
                            )}
                            {app.matchingSkills && app.matchingSkills.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{app.matchingSkills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {app.skillGap && app.skillGap.length > 0 ? (
                              app.skillGap.slice(0, 3).map((s) => (
                                <span
                                  key={s}
                                  className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-500"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-emerald-500">Perfect Match</span>
                            )}
                            {app.skillGap && app.skillGap.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{app.skillGap.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(app.appliedAt)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {app.jobUrl && (
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-2 text-sky-400 hover:bg-sky-500/10"
                                title="Open Job Link"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteApplication(app._id, e)}
                              disabled={deletingId === app._id}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
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
