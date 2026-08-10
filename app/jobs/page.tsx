"use client";

import { useState } from "react";
import { Clock3, Globe2, MapPin, Search } from "lucide-react";
import { countryOptions, cityOptions } from "@/lib/locations";

const timeOptions = [
    { value: "week", label: "Last week" },
    { value: "month", label: "Last month" },
    { value: "any", label: "Last 3 months" },
];

type Job = {
    job_id: string;
    title: string;
    company: string;
    company_logo_url?: string;
    location: string;
    posted_date?: string;
    salary?: string | null;
    job_url: string;
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

    const cities = country ? cityOptions[country] ?? [] : [];

    async function handleSearch(event: React.FormEvent) {
        event.preventDefault();

        if (query.trim().length === 0) {
            setError("Enter a job title, role, or company to search");
            return;
        }

        setLoading(true);
        setError("");
        setHasSearched(true);

        try {
            const params = new URLSearchParams({ query: query.trim() });

            const location = city || country;
            if (location) params.set("location", location);
            if (posted) params.set("datePosted", posted);

            const response = await fetch(`/api/jobs/search?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to fetch jobs");
                setJobs([]);
                return;
            }

            setJobs(data?.data?.jobs ?? []);
        } catch (err) {
            setError("Something went wrong while searching for jobs");
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative overflow-hidden">
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
                        <p className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/60 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-black/20">
                            <Globe2 className="h-4 w-4" />
                            Search for jobs
                        </p>
                    </div>

                    {/* Search Box */}
                    <div className="flex flex-col gap-6 rounded-[1.8rem] border border-slate-200/80 bg-slate-950/5 p-6 shadow-inner shadow-slate-200/30 dark:border-slate-800/70 dark:bg-slate-950/40">

                        <div className="relative overflow-hidden rounded-3xl bg-white/90 p-1 shadow-lg shadow-slate-900/5 transition duration-500 ease-out dark:bg-slate-950/80">

                            {/* Search Fields */}
                            <div className="mt-4 flex flex-wrap gap-4">

                                {/* Job Search */}
                                <label className="flex w-full flex-col gap-2 lg:flex-[1.8]">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        Job title, role or company
                                    </span>

                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder="e.g. Product designer, frontend engineer"
                                        className="h-14 w-full rounded-3xl border border-slate-300/80 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-slate-800"
                                    />
                                </label>

                                {/* Country */}
                                <label className="flex w-full flex-col gap-2 lg:flex-1">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        Country
                                    </span>

                                    <div className="relative">
                                        <select
                                            value={country}
                                            onChange={(event) => {
                                                setCountry(event.target.value);
                                                setCity("");
                                            }}
                                            className="h-14 w-full rounded-3xl border border-slate-300/80 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-slate-800"
                                        >
                                            <option value="">Select a country</option>

                                            {countryOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>

                                        <MapPin className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </label>

                                {/* City */}
                                <label className="flex w-full flex-col gap-2 lg:flex-1">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        City
                                    </span>

                                    <div className="relative">
                                        <select
                                            disabled={country === ""}
                                            value={city}
                                            onChange={(event) => setCity(event.target.value)}
                                            className="h-14 w-full rounded-3xl border border-slate-300/80 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-900/40 dark:focus:border-cyan-400 dark:focus:ring-slate-800"
                                        >
                                            <option value="">All Cities</option>

                                            {cities.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>

                                        <MapPin className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </label>

                                {/* Posted */}
                                <label className="flex w-full flex-col gap-2 lg:flex-1">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        When was it posted?
                                    </span>

                                    <div className="relative">
                                        <select
                                            value={posted}
                                            onChange={(event) => setPosted(event.target.value)}
                                            className="h-14 w-full rounded-3xl border border-slate-300/80 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-slate-800"
                                        >
                                            <option value="">Any time</option>

                                            {timeOptions.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>

                                        <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </label>

                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-900 hover:scale-105 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Search className="h-4 w-4" />
                                    {loading ? "Searching..." : "Search jobs"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </section>

            {/* Results Section */}
            <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                        {error}
                    </div>
                )}

                {hasSearched && !error && (
                    <>
                        {/* Results Header */}
                        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/80 sm:flex-row sm:items-center sm:justify-between">

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
                                    : `Showing ${jobs.length} result${jobs.length === 1 ? "" : "s"} for your search.`}
                            </p>
                        </div>

                        {!loading && jobs.length === 0 && (
                            <p className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-950/80 dark:text-slate-300">
                                No jobs found. Try a different title, location, or time range.
                            </p>
                        )}

                        {/* Job Cards */}
                        <div className="flex flex-wrap gap-5">

                            {jobs.map((job) => (
                                <article
                                    key={job.job_id}
                                    className="group w-full overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700/70 dark:bg-slate-950/80 lg:w-[calc(50%-12px)]"
                                >

                                    {/* Job Header */}
                                    <div className="flex items-start justify-between gap-4">

                                        <div className="min-w-0 space-y-2">
                                            <h3 className="text-xl font-semibold text-slate-950 transition-colors duration-300 group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                                                {job.title}
                                            </h3>
                                        </div>

                                        {job.posted_date && (
                                            <div className="shrink-0 rounded-3xl bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">
                                                {job.posted_date}
                                            </div>
                                        )}

                                    </div>

                                    {/* Company + Location */}
                                    <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                                        <p>{job.company}</p>

                                        <p className="inline-flex items-center gap-2">
                                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                                            {job.location}
                                        </p>

                                    </div>

                                    {/* Footer */}
                                    <div className="mt-8 flex items-center gap-3 text-sm text-slate-500 transition-colors duration-300 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">

                                        <a
                                            href={job.job_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-full bg-slate-100/80 px-3 py-2 dark:bg-slate-900/80"
                                        >
                                            View job
                                        </a>

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
