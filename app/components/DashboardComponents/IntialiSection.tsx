"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BriefcaseBusiness, FileUp, Sparkles } from "lucide-react";

function InitialSection() {
    return (
        <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-10">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
                <div className="absolute right-1/4 bottom-10 h-72 w-72 rounded-full bg-blue-600/10 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.55,
                    ease: "easeOut",
                }}
                className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.15,
                        duration: 0.5,
                    }}
                    className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl"
                >
                    Find the right job.
                    <br />
                    <span className="hero-gradient">
                        Not just another job.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.25,
                        duration: 0.5,
                    }}
                    className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl"
                >
                    Upload your resume, discover relevant opportunities,
                    and manage your entire job search from one place.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.35,
                        duration: 0.5,
                    }}
                    className="mt-10 flex flex-col gap-4 sm:flex-row"
                >
                    <Link href="/upload?reset=true">
                        <motion.div
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-7 py-4 text-base font-semibold text-white"
                        >
                            <FileUp className="h-5 w-5" />
                            Upload Resume
                            <ArrowRight className="h-4 w-4" />
                        </motion.div>
                    </Link>

                    <Link href="/resultedjobs">
                        <motion.div
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-7 py-4 text-base font-semibold text-foreground backdrop-blur transition-colors hover:bg-accent"
                        >
                            <BriefcaseBusiness className="h-5 w-5" />
                            Search For Jobs
                        </motion.div>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        delay: 0.5,
                        duration: 0.5,
                    }}
                    className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
                >
                    <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Resume analysis
                    </span>

                    <span className="hidden h-4 w-px bg-border sm:block" />

                    <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-500" />
                        Personalized jobs
                    </span>

                    <span className="hidden h-4 w-px bg-border sm:block" />

                    <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Application tracking
                    </span>
                </motion.div>


            </motion.div>
        </section>
    );
}

export default InitialSection;