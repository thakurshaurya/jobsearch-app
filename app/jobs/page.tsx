"use client";

import { useState } from "react";
import {
    Clock3,
    Globe2,
    MapPin,
    Search,
} from "lucide-react";

import {
    countryOptions,
    cityOptions,
} from "@/lib/locations";

const timeOptions = [
    {
        value: "week",
        label: "Last week",
    },
    {
        value: "month",
        label: "Last month",
    },
    {
        value: "any",
        label: "Last 3 months",
    },
];

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

export default function JobsPage() {
    const [query, setQuery] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [posted, setPosted] = useState("");

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
    const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

    const cities = country
        ? cityOptions[country] ?? []
        : [];

    async function handleSearch(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (query.trim().length === 0) {
            setError(
                "Enter a job title, role, or company to search"
            );
            return;
        }

        setLoading(true);
        setError("");
        setHasSearched(true);

        try {
            const params = new URLSearchParams({
                query: query.trim(),
            });


            const location = city || country;

            if (location) {
                params.set("location", location);
            }

            if (posted) {
                params.set("datePosted", posted);
            }

            const response = await fetch(
                `/api/jobs/search?${params.toString()}`
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data?.error ||
                    "Failed to fetch jobs"
                );

                setJobs([]);

                return;
            }

            setJobs(data?.jobs ?? []);
        } catch (error) {
            console.error(error);

            setError(
                "Something went wrong while searching for jobs"
            );

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
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setApplyingJobId(null);
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden">

            {/* Background */}
            <div className="pointer-events-none absolute inset-0" />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(15,23,42,0.12),transparent_60%)]" />

            {/* Search Section */}
            <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

                <form
                    onSubmit={handleSearch}
                    autoComplete="off"
                    className="flex flex-col gap-10 rounded-[2rem] border border-white/10 bg-white/80 p-8 shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/75 sm:p-12"
                >

                    {/* Heading */}
                    <div className="flex flex-col items-center gap-4 text-center">

                        <p className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm dark:bg-slate-900/80 dark:text-slate-100">

                            <Globe2 className="h-4 w-4" />

                            Search for jobs

                        </p>

                    </div>

                    {/* Search Box */}
                    <div className="flex flex-col gap-6 rounded-[1.8rem] border border-slate-200/80 bg-slate-950/5 p-6 shadow-inner dark:border-slate-800/70 dark:bg-slate-950/40">

                        <div className="relative overflow-hidden rounded-3xl bg-white/90 p-7 shadow-lg dark:bg-slate-950/80">

                            {/* Search Fields */}
                            <div className="mt-4 flex flex-wrap gap-4">

                                {/* Job */}
                                <label className="flex w-full flex-col gap-2 lg:flex-[1.8]">

                                    <span className="text-sm ml-1.25 font-medium text-slate-700 dark:text-slate-200">
                                        Job title, role or company
                                    </span>

                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder="e.g. React Developer"
                                        className="h-14 w-full rounded-xl border border-slate-300/80 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-slate-800"
                                    />

                                </label>

                                {/* Country */}
                                <label className="flex w-full flex-col gap-2 lg:flex-1">

                                    <span className="text-sm ml-1.25 font-medium text-slate-700 dark:text-slate-200">
                                        Country
                                    </span>

                                    <div className="relative">

                                        <select
                                            value={country}
                                            onChange={(event) => {
                                                setCountry(
                                                    event.target.value
                                                );

                                                setCity("");
                                            }}
                                            className="h-14 w-full rounded-xl border border-slate-300/80 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        >

                                            <option value="">
                                                Select a country
                                            </option>

                                            {countryOptions.map(
                                                (option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                        <MapPin className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                    </div>

                                </label>

                                {/* City */}
                                <label className="flex w-full flex-col gap-2 lg:flex-1">

                                    <span className="text-sm ml-1.25 font-medium text-slate-700 dark:text-slate-200">
                                        City
                                    </span>

                                    <div className="relative">

                                        <select
                                            disabled={country === ""}
                                            value={city}
                                            onChange={(event) =>
                                                setCity(event.target.value)
                                            }
                                            className="h-14 w-full rounded-xl border border-slate-300/80 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-900/40"
                                        >

                                            <option value="">
                                                All Cities
                                            </option>

                                            {cities.map(
                                                (option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                        <MapPin className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                    </div>

                                </label>

                                {/* Posted */}
                                <label className="flex w-full flex-col gap-2  lg:flex-1">

                                    <span className="text-sm ml-1.25 font-medium text-slate-700 dark:text-slate-200">
                                        When was it posted?
                                    </span>

                                    <div className="relative">

                                        <select
                                            value={posted}
                                            onChange={(event) =>
                                                setPosted(event.target.value)
                                            }
                                            className="h-14 w-full rounded-xl border border-slate-300/80 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        >

                                            <option value="">
                                                Any time
                                            </option>

                                            {timeOptions.map(
                                                (option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                        <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                    </div>

                                </label>

                            </div>

                            {/* Search Button */}
                            <div className="mt-4 flex justify-end">

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-3xl bg-blue-500 px-6 py-3 text-sm font-semibold transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    <Search className="h-4 w-4" />

                                    {loading
                                        ? "Searching..."
                                        : "Search jobs"}

                                </button>

                            </div>

                        </div>

                    </div>

                </form>

            </section>

            {/* Results */}
            <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                        {error}
                    </div>
                )}

                {hasSearched && !error && (
                    <>

                        {/* Results Header */}
                        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/80 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                                    Matching roles
                                </p>

                                <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                                    Selected jobs ready to explore
                                </h2>

                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-300">

                                {loading
                                    ? "Searching..."
                                    : `Showing ${jobs.length} result${jobs.length === 1
                                        ? ""
                                        : "s"
                                    } for your search.`}

                            </p>

                        </div>

                        {/* No Jobs */}
                        {!loading &&
                            jobs.length === 0 && (
                                <p className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-950/80 dark:text-slate-300">
                                    No jobs found. Try a different title,
                                    location, or time range.
                                </p>
                            )}

                        {/* Job Cards */}
                        <div className="flex flex-wrap gap-4">

                            {jobs.map((job) => (

                                <article
                                    key={job.id}
                                    className="group w-full overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700/70 dark:bg-slate-950/80 lg:w-[calc(50%-10px)]"
                                >

                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4">

                                        <div className="min-w-0 space-y-2">

                                            <h3 className="text-xl font-semibold text-slate-950 transition-colors group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                                                {job.title}
                                            </h3>

                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {job.company}
                                            </p>

                                        </div>

                                        {job.postedDate && (
                                            <div className="shrink-0 rounded-3xl bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
                                                {job.postedDate}
                                            </div>
                                        )}

                                    </div>

                                    {/* Location */}
                                    <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">

                                        <p className="inline-flex items-center gap-2">

                                            <MapPin className="h-4 w-4 shrink-0" />

                                            {job.location}

                                        </p>

                                        {job.remote && (
                                            <span className="rounded-full bg-green-500/10 px-3 py-1 text-green-600 dark:text-green-400">
                                                Remote
                                            </span>
                                        )}

                                    </div>

                                    {/* Employment Type */}
                                    {job.employmentType && (
                                        <div className="mt-4">

                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                {job.employmentType}
                                            </span>

                                        </div>
                                    )}

                                    {/* Salary */}
                                    {job.salary && (
                                        <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {job.salary}
                                        </p>
                                    )}

                                    {/* Footer */}
                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Job opportunity
                                        </span>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleApplyJob(job)}
                                                disabled={
                                                    applyingJobId === job.id ||
                                                    appliedJobs.has(job.id)
                                                }
                                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${appliedJobs.has(job.id)
                                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                                    : "bg-blue-500 text-white hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                                                    }`}
                                            >
                                                {applyingJobId === job.id
                                                    ? "Applying..."
                                                    : appliedJobs.has(job.id)
                                                        ? "✓ Interested"
                                                        : "Interested"}
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