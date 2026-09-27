"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";
import { motion } from "motion/react";

interface SocialAuthButtonsProps {
  callbackUrl?: string;
}

export function SocialAuthButtons({ callbackUrl = "/dashboard" }: SocialAuthButtonsProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      if (provider === "google") {
        setGoogleLoading(true);
      } else {
        setGithubLoading(true);
      }

      await signIn(provider, {
        callbackUrl,
      });
    } catch (err) {
      console.error(`Sign in with ${provider} failed`, err);
    } finally {
      setGoogleLoading(false);
      setGithubLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <motion.button
        type="button"
        disabled={googleLoading || githubLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleOAuthSignIn("google")}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FcGoogle className="h-5 w-5" />
        <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
      </motion.button>

      <motion.button
        type="button"
        disabled={googleLoading || githubLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleOAuthSignIn("github")}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FaGithub className="h-5 w-5 text-foreground" />
        <span>{githubLoading ? "Connecting to GitHub..." : "Continue with GitHub"}</span>
      </motion.button>
    </div>
  );
}
