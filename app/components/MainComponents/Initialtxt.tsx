"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Resume Analysis",
    description:
      "Upload your resume and let the platform extract your skills, experience, education, and projects.",
  },
  {
    icon: Search,
    title: "Smart Job Search",
    description:
      "Find relevant opportunities based on your skills, preferred roles, location, and other preferences.",
  },
  {
    icon: Target,
    title: "Better Job Matching",
    description:
      "Instead of endlessly browsing listings, focus on jobs that are more relevant to your profile.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description:
      "Keep track of the opportunities you discover and the applications you make throughout your job search.",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload your resume",
    description:
      "Give JobSearch the information it needs to understand your professional profile.",
  },
  {
    number: "02",
    title: "Tell us what you want",
    description:
      "Choose the roles, skills, salary expectations, and locations that match your career goals.",
  },
  {
    number: "03",
    title: "Discover relevant jobs",
    description:
      "Search through available opportunities and quickly identify the roles worth applying for.",
  },
];

function InitialTxt() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Hero */}
      <section className="relative px-6 py-24 sm:py-32">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="max-w-5xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          >
            Your job search should be
            <br />
            <span className="hero-gradient">
              smarter, not harder.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.2 }}
            className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl"
          >
            JobSearch is built to make finding the right opportunity
            simpler. Instead of spending hours jumping between job portals,
            use one platform to understand your profile, discover relevant
            jobs, and manage your search.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.2 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/upload">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 rounded-xl  px-7 py-4 font-semibold text-white bg-blue-500"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </Link>

            <Link href="/jobs">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-7 py-4 font-semibold text-foreground backdrop-blur transition-colors hover:bg-accent"
              >
                <BriefcaseBusiness className="h-5 w-5" />
                Explore Jobs
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="relative px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.25 }}
          className="mx-auto flex max-w-6xl flex-col items-center rounded-[2rem] border border-border bg-card/70 p-8 text-center shadow-xl backdrop-blur-xl sm:p-12 lg:p-16"
        >
          <div className="mb-6 rounded-2xl bg-cyan-500/10 p-4 text-cyan-500">
            <BrainCircuit className="h-8 w-8" />
          </div>

          <h2 className="text-3xl font-black sm:text-4xl">
            What is{" "}
            <span className="hero-gradient">
              JobSearch?
            </span>
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            JobSearch is a career-focused platform designed to reduce the
            friction between your skills and your next opportunity. The idea
            is simple: understand who you are professionally, understand what
            you are looking for, and help you find opportunities that make
            sense for you.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              "Resume Analysis",
              "Job Discovery",
              "Skill Matching",
              "Application Tracking",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative px-6 py-24">
        <div className="mx-auto flex max-w-6xl flex-col">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500">
              What it does
            </p>

            <h2 className="mt-3 text-4xl font-black sm:text-5xl">
              Built around your{" "}
              <span className="cyber-gradient">
                career.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Everything is designed around making your job search more
              focused and less repetitive.
            </p>
          </motion.div>

          <div className="mt-14 flex flex-wrap gap-6">

            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.08,
                  }}
                  whileHover={{ y: -6 }}
                  className="flex w-full flex-1 flex-col rounded-3xl border border-border bg-card/70 p-7 shadow-lg backdrop-blur-xl transition-shadow hover:shadow-2xl sm:min-w-[280px]"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}

          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-6 py-24">
        <div className="mx-auto flex max-w-6xl flex-col">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500">
              How it works
            </p>

            <h2 className="mt-3 text-4xl font-black sm:text-5xl">
              Three steps.
              <br />
              <span className="hero-gradient">
                One smarter workflow.
              </span>
            </h2>
          </motion.div>

          <div className="mt-16 flex flex-col">

            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{
                  opacity: 0,
                  x: index % 2 === 0 ? -40 : 40,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.08,
                }}
                className="flex items-center gap-6 border-b border-border py-10 last:border-b-0 sm:gap-10"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 font-black text-white shadow-lg shadow-cyan-500/20">
                  {step.number}
                </div>

                <div>
                  <h3 className="text-2xl font-bold">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* Values / Philosophy */}
      <section className="relative px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.4 }}
          className="mx-auto flex max-w-6xl flex-col items-center rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-background to-blue-500/10 p-10 text-center sm:p-16"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h2 className="mt-6 text-3xl font-black sm:text-4xl">
            Less searching.
            <br />
            <span className="hero-gradient">
              More applying.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Your time is better spent preparing for the right opportunity
            than endlessly scrolling through thousands of irrelevant
            listings.
          </p>

          <Link href="/upload" className="mt-8">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-xl bg-foreground px-7 py-4 font-semibold text-background shadow-lg"
            >
              Start Your Search
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </Link>
        </motion.div>
      </section>

    </main>
  );
}
export default InitialTxt;

