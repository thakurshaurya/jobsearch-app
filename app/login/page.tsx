"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { User, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-6">
      <motion.form
        initial={{ opacity: 0, y: 35, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        className="relative z-10 w-full max-w-md"
      >
        <motion.section
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="rounded-3xl border border-slate-700/40 bg-slate-900/70 p-8 shadow-[0_0_60px_rgba(14,165,233,0.15)] backdrop-blur-xl"
        >

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>

          <div className="mt-6 text-center">
            <h1 className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-3xl font-bold text-transparent">
              Welcome Back
            </h1>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email
              </label>

              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/70 px-4 transition-all duration-300 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/20">
                <Mail className="h-5 w-5 text-slate-500" />

                <input
                  type="email"
                  placeholder="test@example.com"
                  className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/70 px-4 transition-all duration-300 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/20">
                <Lock className="h-5 w-5 text-slate-500" />

                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-500"
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
              Login
            </motion.button>

            <p className="pt-2 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link href={"/signup"}>
                <span className="cursor-pointer font-medium text-sky-400 hover:text-sky-300">
                  SignUp
                </span>
              </Link>
            </p>
          </div>
        </motion.section>
      </motion.form>
    </div>
  );
}