"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import { motion } from "motion/react";
import { User, Mail, Lock } from "lucide-react";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      const username = formData.get("username");
      const email = formData.get("email");
      const password = formData.get("password");

      const response = await fetch("/api/users/signup", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({username, email, password})
      });

      const data = await response.json();

      if (response.status === 201) {
        router.push("/login");
      } else {
        setError(data.error || "Error creating account");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-10">

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.2,
          ease: "easeIn",
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
                  id="username"
                  name="username"
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
                  id="email"
                  name="email"
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
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-3 text-foreground outline-none placeholder:text-muted-foreground"
                />

              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="mt-3 w-full rounded-xl bg-blue-500 py-3 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
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