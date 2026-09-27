"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Mail, Lock } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loginUser } from "@/app/action";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

function LoginForm() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getFriendlyErrorMessage = (code: string | null) => {
    if (!code) return "";
    switch (code) {
      case "OAuthAccountNotLinked":
        return "An account with this email already exists using another login method or different credentials. Please sign in with your original method.";
      case "OAuthSignin":
      case "OAuthCallbackError":
        return "Could not complete sign in with OAuth provider. Please try again or use your password.";
      case "AccessDenied":
        return "Access denied or sign in was cancelled.";
      case "Configuration":
        return "OAuth server configuration error. Please ensure environment variables are configured.";
      default:
        return "Authentication failed. Please try again.";
    }
  };

  const displayError = error || getFriendlyErrorMessage(oauthError);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await loginUser(email, password);

    setError(result?.error || "Login failed");
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
              Welcome Back
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Login to continue your AI-powered job search.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email
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

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-border bg-background px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-3 text-foreground outline-none placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-500 transition-colors hover:text-cyan-500"
              >
                Forgot Password?
              </Link>
            </div>

            {displayError && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                {displayError}
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
              className="mt-3 w-full rounded-xl bg-blue-500 py-3 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>

            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">
                OR
              </span>
            </div>

            <SocialAuthButtons callbackUrl={callbackUrl} />

            <p className="pt-2 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-blue-500 transition-colors hover:text-cyan-500"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </motion.section>
      </motion.form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}