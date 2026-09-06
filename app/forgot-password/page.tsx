"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { requestPasswordReset } from "@/app/action";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [sentEmail, setSentEmail] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    const result = await requestPasswordReset(email);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccessMsg(result.message || "A reset link has been sent to your email.");
      setSentEmail(email);
    }
    setLoading(false);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>

          <div className="mt-6 text-center">
            <h1 className="hero-gradient text-3xl font-extrabold">
              Forgot Password
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Enter your account email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            {successMsg ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Check your inbox
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {successMsg}
                </p>
                {sentEmail && (
                  <p className="mt-2 text-xs font-medium text-emerald-400">
                    Sent to: {sentEmail}
                  </p>
                )}
                <div className="mt-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessMsg("");
                      setError("");
                    }}
                    className="text-xs font-semibold text-blue-500 hover:text-cyan-500 underline"
                  >
                    Resend link or use another email
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Email Address
                  </label>

                  <div className="flex items-center rounded-xl border border-border bg-background px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      placeholder="example@email.com"
                      className="w-full bg-transparent px-3 py-3 text-foreground outline-none placeholder:text-muted-foreground"
                      required
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
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-3 w-full rounded-xl bg-blue-500 py-3 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </motion.button>
              </>
            )}

            <p className="pt-2 text-center text-sm text-muted-foreground">
              Remembered your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-500 transition-colors hover:text-cyan-500"
              >
                Log In
              </Link>
            </p>
          </div>
        </motion.section>
      </motion.form>
    </div>
  );
}
