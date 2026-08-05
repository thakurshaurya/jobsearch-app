"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { User, Mail, Lock } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-10">

      <motion.form
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        className="relative z-10 w-full max-w-md"
      >
        <motion.section
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
          className="rounded-3xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-xl"
        >

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>


          <div className="mt-6 text-center">

            <h1 className="hero-gradient text-3xl font-extrabold">
              Create Account
            </h1>

            <p className="mt-3 text-sm text-muted-foreground">
              Start your AI-powered job search journey.
            </p>

          </div>


          <div className="mt-8 space-y-5">


            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Username
              </label>

              <div className="flex items-center rounded-xl border border-border bg-background px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">

                <User className="h-5 w-5 text-muted-foreground" />

                <input
                  type="text"
                  placeholder="Enter Username"
                  className="w-full bg-transparent px-3 py-3 text-foreground outline-none placeholder:text-muted-foreground"
                />

              </div>
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email
              </label>

              <div className="flex items-center rounded-xl border border-border bg-background px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">

                <Mail className="h-5 w-5 text-muted-foreground" />

                <input
                  type="email"
                  placeholder="example@email.com"
                  className="w-full bg-transparent px-3 py-3 text-foreground outline-none placeholder:text-muted-foreground"
                />

              </div>
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-border bg-background px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">

                <Lock className="h-5 w-5 text-muted-foreground" />

                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-3 text-foreground outline-none placeholder:text-muted-foreground"
                />

              </div>
            </div>
            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-3 font-semibold text-slate-900 shadow-lg shadow-sky-500/30 transition-all"
            >
              Create Account
            </motion.button>


            <p className="pt-2 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-500 transition-colors hover:text-cyan-500"
              >
                Login
              </Link>
            </p>

          </div>

        </motion.section>
      </motion.form>
    </div>
  );
}