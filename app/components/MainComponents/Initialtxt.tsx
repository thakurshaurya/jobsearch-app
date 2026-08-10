"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { FaArrowRight } from "react-icons/fa";

const InitialTxt = () => {
  return (
    <section className="min-h-[90vh] flex items-center justify-center px-6">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="hero-gradient text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
            Searching for Jobs
            <br />
            Made{" "}
            <span className="cyber-gradient">
              Easier
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-8 mx-auto max-w-3xl text-lg md:text-xl text-muted-foreground leading-8"
        >
          Stop endlessly scrolling through hundreds of job portals.
          Let AI analyze your resume, match you with the best opportunities,
          and show exactly why each role fits your profile.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="mt-12 flex justify-center gap-5"
        >
          <Link href="/login">
            <button className="btn btn-primary px-8 py-6 rounded-xl text-lg shadow-lg hover:scale-105 transition-all duration-300">
              Get Started
              <FaArrowRight />
            </button>
          </Link>

          <Link href="#features">
            <button className="btn bg-transparent text-muted-foreground px-8 py-6 rounded-xl text-lg shadow-lg hover:scale-105 transition-all duration-300">
              Learn More
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default InitialTxt;