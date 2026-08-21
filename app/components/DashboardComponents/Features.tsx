"use client";

import Image from "next/image";
import { motion } from "motion/react";

function Features() {
  return (
    <section className="flex flex-col gap-40 px-8 py-24">

      <div className="flex items-center justify-center gap-24">

        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="w-1/2 max-w-xl"
        >
          <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-500">
            Step 1
          </span>

          <h2 className="mt-6 text-5xl font-black hero-gradient leading-tight">
            Upload Your Resume
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Upload your resume in PDF format. We extract your skills,
            education, projects and experience within seconds.
          </p>

          <ul className="mt-8 space-y-3 text-lg">
            <li>✅ Extracts skills automatically</li>
            <li>✅ ATS-friendly parsing</li>
            <li>✅ Supports PDF resumes</li>
            <li>✅ Instant profile generation</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -8 }}
          viewport={{ once: false }}
          transition={{
            duration: 0.3,
          }}
          className="flex justify-center"
        >
          <Image
            src="/Online-resume-amico.png"
            alt="Resume Upload"
            width={520}
            height={520}
            className="drop-shadow-2xl"
          />
        </motion.div>

      </div>


      <div className="flex items-center justify-center gap-24">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -8 }}
          viewport={{ once: false }}
          transition={{
            duration: 0.3,
          }}
          className="flex justify-center"
        >
          <Image
            src="/Online-resume-cuate.png"
            alt="Apply Jobs"
            width={520}
            height={520}
            className="drop-shadow-2xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="w-1/2 max-w-xl"
        >
          <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-500">
            Step 2
          </span>

          <h2 className="mt-6 text-5xl font-black hero-gradient leading-tight">
            Answer Simple Questions
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Tell us about your expectations regarding salary, skills, and experience. We will use this information to find the best matching jobs for you.
          </p>

          <ul className="mt-8 space-y-3 text-lg">
            <li>✅ Find your dream job</li>
            <li>✅ Get personalized recommendations</li>
            <li>✅ Match Score</li>
            <li>✅ Application tracking</li>
          </ul>
        </motion.div>

      </div>

      <div className="flex items-center justify-center gap-24">
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="w-1/2 max-w-xl"
        >
          <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-500">
            Step 3
          </span>

          <h2 className="mt-6 text-5xl font-black hero-gradient leading-tight">
            Apply With Confidence
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Browse jobs, apply directly using trusted links and
            monitor every application from one dashboard.
          </p>

          <ul className="mt-8 space-y-3 text-lg">
            <li>✅ Live job listings</li>
            <li>✅ Direct apply links</li>
            <li>✅ Match Score</li>
            <li>✅ Application tracking</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -8 }}
          viewport={{ once: false }}
          transition={{
            duration: 0.3,
          }}
          className="flex justify-center"
        >
          <Image
            src="/Online-resume-rafiki.png"
            alt="Apply Jobs"
            width={520}
            height={520}
            className="drop-shadow-2xl"
          />
        </motion.div>
      </div>

    </section>
  );
}

export default Features;