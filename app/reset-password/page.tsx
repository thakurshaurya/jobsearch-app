"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState, Suspense } from "react";
import { resetPasswordWithToken } from "@/app/action";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the URL. Please use the link sent to your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    const result = await resetPasswordWithToken(token, password);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
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
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>

          <div className="mt-6 text-center">
            <h1 className="hero-gradient text-3xl font-extrabold">
              Set New Password
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Please enter and confirm your new account password below.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            {!token && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-center">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-amber-500" />
                <h3 className="font-semibold text-foreground">
                  Missing Reset Token
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  This reset link seems invalid or incomplete. Please request a fresh password reset link.
                </p>
                <div className="mt-4">
                  <Link
                    href="/forgot-password"
                    className="inline-block rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
                  >
                    Request New Link
                  </Link>
                </div>
              </div>
            )}

            {token && success ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Password Reset Complete!
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your password has been successfully changed. You can now login with your new credentials.
                </p>
                <div className="mt-6">
                  <motion.button
                    type="button"
                    onClick={() => router.push("/login")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full rounded-xl bg-blue-500 py-3 font-semibold text-white transition-all shadow-lg hover:bg-blue-600"
                  >
                    Go to Login
                  </motion.button>
                </div>
              </div>
            ) : token ? (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    New Password
                  </label>

                  <div className="flex items-center rounded-xl border border-border bg-background px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <input
                      type="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-transparent px-3 py-3 text-foreground outline-none placeholder:text-muted-foreground"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Confirm New Password
                  </label>

                  <div className="flex items-center rounded-xl border border-border bg-background px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-transparent px-3 py-3 text-foreground outline-none placeholder:text-muted-foreground"
                      required
                      minLength={6}
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
                      Updating Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </motion.button>
              </>
            ) : null}

            <p className="pt-2 text-center text-sm text-muted-foreground">
              <Link
                href="/login"
                className="font-semibold text-blue-500 transition-colors hover:text-cyan-500"
              >
                Return to Login
              </Link>
            </p>
          </div>
        </motion.section>
      </motion.form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
