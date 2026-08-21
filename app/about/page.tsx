"use client";

import { motion } from "motion/react";
import {
    BrainCircuit,
    Search,
    Target,
    Sparkles,
} from "lucide-react";

export default function AboutPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-6 py-10 sm:py-18">

            <div className="relative mx-auto flex max-w-5xl flex-col">

                {/* Hero */}
                <motion.section
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="text-center"
                >

                    <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                        A better way to
                        <br />
                        <span className="hero-gradient">
                            approach your job search.
                        </span>
                    </h1>

                    <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
                        JobSearch AI is built around a simple idea: finding a job
                        shouldn't mean spending hours searching through thousands of
                        listings hoping to find something relevant.
                    </p>
                </motion.section>

                {/* The Problem */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.2 }}
                    className="mt-32"
                >
                    <div className="flex flex-col gap-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500">
                            The problem
                        </p>

                        <h2 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
                            Job hunting can become a full-time job of its own.
                        </h2>

                        <p className="max-w-4xl text-lg leading-8 text-muted-foreground">
                            Modern job seekers often have to move between multiple
                            platforms, repeatedly search for the same roles, compare
                            hundreds of listings, and manually figure out which positions
                            actually match their skills.
                        </p>

                        <p className="max-w-4xl text-lg leading-8 text-muted-foreground">
                            The problem isn't necessarily that there aren't enough
                            opportunities. It's that finding the right opportunities can
                            take an enormous amount of time.
                        </p>
                    </div>
                </motion.section>

                {/* Our Idea */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.25 }}
                    className="mt-28"
                >
                    <div className="rounded-[2rem] border border-border bg-card/60 p-8 shadow-xl backdrop-blur-xl sm:p-12">

                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
                                <BrainCircuit className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500">
                                    Our idea
                                </p>

                                <h2 className="mt-1 text-3xl font-bold">
                                    Let technology handle the repetition.
                                </h2>
                            </div>
                        </div>

                        <p className="mt-8 text-lg leading-8 text-muted-foreground">
                            JobSearch AI is designed to understand a user's professional
                            profile and turn that information into a more focused job
                            search. Instead of treating every listing as equally relevant,
                            the goal is to help users spend more time on opportunities that
                            actually align with their background and career goals.
                        </p>

                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
                            The platform brings resume analysis, job discovery, skill
                            matching, and application management together into one
                            experience.
                        </p>

                    </div>
                </motion.section>

                {/* How it works conceptually */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35 }}
                    className="mt-28"
                >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500">
                        The idea in three parts
                    </p>

                    <div className="mt-10 flex flex-col">

                        <div className="flex gap-6 border-b border-border py-8">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                                <Search className="h-5 w-5" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                    Understand the candidate
                                </h3>

                                <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
                                    A resume contains far more information than a list of
                                    keywords. Skills, projects, experience, education, and
                                    career direction all contribute to understanding what a
                                    candidate is looking for.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 border-b border-border py-8">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                <Target className="h-5 w-5" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                    Narrow down the opportunities
                                </h3>

                                <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
                                    A good job search should reduce noise, not create more of
                                    it. Relevant roles should be easier to discover based on
                                    the candidate's actual profile and preferences.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 py-8">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                                <BrainCircuit className="h-5 w-5" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                    Make the search more useful
                                </h3>

                                <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
                                    The long-term vision is to go beyond simply finding jobs.
                                    The platform should help users understand why an
                                    opportunity fits, where their skill gaps are, and how their
                                    applications are progressing.
                                </p>
                            </div>
                        </div>

                    </div>
                </motion.section>

                {/* Philosophy */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.4 }}
                    className="mt-28"
                >
                    <div className="border-t border-border pt-12">

                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500">
                            Our philosophy
                        </p>

                        <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                            Less noise.
                            <br />
                            <span className="hero-gradient">
                                Better decisions.
                            </span>
                        </h2>

                        <p className="mt-6 max-w-4xl text-lg leading-8 text-muted-foreground">
                            JobSearch AI isn't meant to replace the job seeker. It is meant
                            to remove some of the repetitive work around the job search so
                            that the user can focus on what actually matters: improving
                            their skills, preparing for interviews, and finding work that
                            fits their goals.
                        </p>

                    </div>
                </motion.section>

                {/* Final statement */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="mt-28 pb-10 text-center"
                >
                    <p className="text-lg text-muted-foreground">
                        Job searching is difficult enough.
                    </p>

                    <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                        Finding the right opportunity{" "}
                        <span className="cyber-gradient">
                            shouldn't be.
                        </span>
                    </h2>
                </motion.section>

            </div>
        </main>
    );
}