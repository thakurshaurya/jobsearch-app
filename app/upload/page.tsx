"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Loader2,
  ArrowRight,
  Briefcase,
  Code,
  IndianRupee,
  Sparkles,
  RefreshCw,
  FileCheck,
  Trash2,
} from "lucide-react";
import {
  saveUserResume,
  saveJobTarget,
  getUserProfileStatus,
  resetUserProfile,
} from "@/app/action";
import { DEVICON_SKILLS, getSkillIcon } from "@/lib/devicons";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function UploadPage() {
  const router = useRouter();

  // Navigation & initial check state
  const [step, setStep] = useState<1 | 2>(1);
  const [initialChecking, setInitialChecking] = useState(true);

  // Step 1 state
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>("");
  const [aboutSelf, setAboutSelf] = useState<string>("");

  // Step 2 state
  const [targetRole, setTargetRole] = useState<string>("");
  const [targetSkills, setTargetSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>("");
  const [targetSalaryMin, setTargetSalaryMin] = useState<string>("");
  const [targetSalaryMax, setTargetSalaryMax] = useState<string>("");

  // Generic status states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [failedSubmissionStep, setFailedSubmissionStep] = useState<1 | 2 | null>(
    null
  );

  // Check if profile is already set up on mount or if user requested reset
  useEffect(() => {
    async function checkExistingProfile() {
      try {
        const isReset = new URLSearchParams(window.location.search).get("reset") === "true";
        if (isReset) {
          await resetUserProfile();
          setStep(1);
          setFile(null);
          setAboutSelf("");
          setTargetRole("");
          setTargetSkills([]);
        } else {
          const status = await getUserProfileStatus();
          if (status.authenticated) {
            if (status.hasResume && status.hasJobTarget) {
              router.push("/resultedjobs");
              return;
            } else if (status.hasResume && !status.hasJobTarget) {
              setStep(2);
            }
          }
        }
      } catch (err) {
        console.error("Error checking profile status:", err);
      } finally {
        setInitialChecking(false);
      }
    }
    checkExistingProfile();
  }, [router]);

  const handleResetData = async () => {
    if (confirm("Are you sure you want to delete your previous profile data and start fresh?")) {
      setLoading(true);
      await resetUserProfile();
      setStep(1);
      setFile(null);
      setAboutSelf("");
      setTargetRole("");
      setTargetSkills([]);
      setError("");
      setSuccessMsg("Previous profile data deleted. You can now submit new profile details.");
      setLoading(false);
    }
  };

  // Dropzone file handler
  const handleFileDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setFileError("");
    setError("");

    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.file.size > MAX_FILE_SIZE) {
        setFileError("File size exceeds the 5MB limit. Please upload a smaller file.");
      } else {
        setFileError("Invalid file type. Please upload a .pdf or .docx document.");
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];

      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileError("File size exceeds the 5MB limit. Please upload a smaller file.");
        return;
      }

      setFile(selectedFile);
      setIsUploading(true);
      setUploadProgress(10);

      // Simulate realistic upload progress bar
      let currentProgress = 10;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 25) + 15;
        if (currentProgress >= 100) {
          setUploadProgress(100);
          setIsUploading(false);
          clearInterval(interval);
        } else {
          setUploadProgress(currentProgress);
        }
      }, 120);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
    },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setFileError("");
  };

  // Extract experience and education snippets from aboutSelf text
  const extractExperienceAndEducation = (text: string) => {
    if (!text.trim()) return { experience: null, education: null };

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const expKeywords = ["experience", "worked", "year", "years", "role", "company", "developer", "engineer"];
    const eduKeywords = ["education", "degree", "university", "college", "bachelor", "master", "b.tech", "m.tech", "phd", "graduated"];

    const expLines = lines.filter((line) =>
      expKeywords.some((kw) => line.toLowerCase().includes(kw))
    );
    const eduLines = lines.filter((line) =>
      eduKeywords.some((kw) => line.toLowerCase().includes(kw))
    );

    return {
      experience: expLines.length > 0 ? expLines.join("; ") : text.slice(0, 300),
      education: eduLines.length > 0 ? eduLines.join("; ") : null,
    };
  };

  // Step 1 submit handler
  const handleStep1Submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    setFailedSubmissionStep(null);

    const hasFile = Boolean(file);
    const textTrimmed = aboutSelf.trim();
    const hasText = textTrimmed.length > 0;

    if (!hasFile && !hasText) {
      setError("Please complete either the resume upload or self-description (or both).");
      return;
    }

    if (hasText && textTrimmed.length < 50) {
      setError("Self-description must be at least 50 characters long (or clear it and upload a resume instead).");
      return;
    }

    setLoading(true);

    let sourceType: "resume" | "about_self" | "both" = "resume";
    if (hasFile && hasText) {
      sourceType = "both";
    } else if (hasText) {
      sourceType = "about_self";
    } else {
      sourceType = "resume";
    }

    const fakeS3Url = hasFile ? `s3://resumes/${Date.now()}_${file?.name}` : undefined;
    const { experience, education } = extractExperienceAndEducation(textTrimmed);

    try {
      const res = await saveUserResume(
        sourceType,
        fakeS3Url,
        hasText ? textTrimmed : undefined,
        [],
        experience || undefined,
        education || undefined
      );

      if (res?.error) {
        setError(res.error);
        setFailedSubmissionStep(1);
      } else {
        setSuccessMsg("Profile saved! Now tell us about your job preferences.");
        setTimeout(() => {
          setSuccessMsg("");
          setStep(2);
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || "Network error occurred while saving profile. Please try again.");
      setFailedSubmissionStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Skill management for Step 2
  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (!targetSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setTargetSkills([...targetSkills, trimmed]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTargetSkills(targetSkills.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  const toggleSuggestionSkill = (skill: string) => {
    if (targetSkills.includes(skill)) {
      handleRemoveSkill(skill);
    } else {
      handleAddSkill(skill);
    }
  };

  // Step 2 submit handler
  const handleStep2Submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    setFailedSubmissionStep(null);

    if (!targetRole.trim()) {
      setError("Target role is required. Please specify what role you are looking for.");
      return;
    }

    setLoading(true);

    const minVal = targetSalaryMin ? parseFloat(targetSalaryMin) : undefined;
    const maxVal = targetSalaryMax ? parseFloat(targetSalaryMax) : undefined;

    try {
      const res = await saveJobTarget(
        targetRole.trim(),
        targetSkills.length > 0 ? targetSkills : undefined,
        minVal,
        maxVal
      );

      if (res?.error) {
        setError(res.error);
        setFailedSubmissionStep(2);
      } else {
        setSuccessMsg("Preferences saved! Redirecting to jobs...");
        setTimeout(() => {
          router.push("/resultedjobs");
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || "Network error occurred while saving preferences. Please try again.");
      setFailedSubmissionStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Format currency display
  const formatRupee = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (initialChecking) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          <p className="text-sm font-medium text-muted-foreground">Checking profile status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl"
      >
        <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Mac window dots header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetData}
                className="flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                title="Delete previous profile data and start fresh"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Reset Data</span>
              </button>
              <div className="flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-semibold text-sky-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Step {step} of 2</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-500 to-cyan-400"
              initial={{ width: step === 1 ? "50%" : "50%" }}
              animate={{ width: step === 1 ? "50%" : "100%" }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Header Title */}
          <div className="mt-6 text-center">
            <h1 className="hero-gradient text-3xl font-extrabold sm:text-4xl">
              {step === 1 ? "Setup Your Profile" : "Job Preferences"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {step === 1
                ? "Upload your resume or tell us about your experience to get started."
                : "Help us find the right opportunities matching your goals."}
            </p>
          </div>

          {/* Alert Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
                {failedSubmissionStep && (
                  <button
                    type="button"
                    onClick={() =>
                      failedSubmissionStep === 1
                        ? handleStep1Submit()
                        : handleStep2Submit()
                    }
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/30"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                )}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1 FORM */}
          {step === 1 && (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleStep1Submit}
              className="mt-8 space-y-8"
            >
              {/* Section 1: Resume Upload */}
              <div className="space-y-3">
                <label className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-sky-400" />
                    Upload Your Resume
                  </span>
                  <span className="text-xs text-muted-foreground">PDF or DOCX (Max 5MB)</span>
                </label>

                {!file ? (
                  <div>
                    <div
                      {...getRootProps()}
                      className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer ${
                        isDragActive
                          ? "border-sky-400 bg-sky-500/10 scale-[1.01]"
                          : "border-border hover:border-sky-400/60 hover:bg-secondary/40"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="rounded-full bg-sky-500/10 p-4 text-sky-400 transition-transform group-hover:scale-110">
                        <UploadCloud className="h-8 w-8" />
                      </div>
                      <p className="mt-3 text-base font-medium text-foreground">
                        {isDragActive ? "Drop your file here..." : "Drag & drop your resume here"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        or click to browse files from your device
                      </p>
                    </div>
                    {fileError && (
                      <p className="mt-2 text-xs font-medium text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {fileError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5 transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="rounded-xl bg-sky-500/10 p-3 text-sky-400">
                          <FileCheck className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        title="Remove file"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Upload progress state */}
                    {isUploading ? (
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs text-sky-400 font-medium">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        File ready for submission
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: Self Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    Tell Us About Yourself
                  </label>
                  <span
                    className={`text-xs ${
                      aboutSelf.length > 0 && aboutSelf.length < 50
                        ? "text-amber-400 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {aboutSelf.length} / 1000 characters
                  </span>
                </div>

                <textarea
                  value={aboutSelf}
                  onChange={(e) => setAboutSelf(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Your experience, skills, education, key achievements..."
                  className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground outline-none transition-all duration-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder:text-muted-foreground resize-none"
                />

                {aboutSelf.length > 0 && aboutSelf.length < 50 && (
                  <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    At least 50 characters required if providing self-description ({50 - aboutSelf.length} more needed).
                  </p>
                )}
              </div>

              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={loading || isUploading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-sky-500/30 transition-all hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      Save Profile
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* STEP 2 FORM */}
          {step === 2 && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleStep2Submit}
              className="mt-8 space-y-6"
            >
              {/* Field 1: Target Role */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-sky-400" />
                  What role are you looking for? <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior React Developer, Product Manager"
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all duration-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder:text-muted-foreground"
                />
              </div>

              {/* Field 2: Target Skills */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Code className="h-4 w-4 text-cyan-400" />
                  What skills do you want to work with?{" "}
                  <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                </label>

                {/* Selected Skills Tags */}
                {targetSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {targetSkills.map((skill) => {
                      const IconComp = getSkillIcon(skill);
                      return (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300"
                        >
                          <IconComp className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-red-400 transition-colors ml-0.5"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Input with Add button */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Search or type a skill (e.g. React, Python)..."
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-all duration-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillInput)}
                    className="flex items-center gap-1 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                {/* Searchable Devicon Suggestions (At most 7 shown) */}
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span>
                      {skillInput.trim()
                        ? `Matching skills:`
                        : "Suggested skills:"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Showing {DEVICON_SKILLS.filter((s) => s.name.toLowerCase().includes(skillInput.trim().toLowerCase())).slice(0, 7).length} of at most 7
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {DEVICON_SKILLS.filter((s) =>
                      s.name.toLowerCase().includes(skillInput.trim().toLowerCase())
                    )
                      .slice(0, 7)
                      .map((skillItem) => {
                        const isSelected = targetSkills.includes(skillItem.name);
                        const IconComp = skillItem.icon;
                        return (
                          <button
                            key={skillItem.name}
                            type="button"
                            onClick={() => toggleSuggestionSkill(skillItem.name)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                              isSelected
                                ? "border-sky-500 bg-sky-500 text-slate-900 font-semibold shadow-md shadow-sky-500/20"
                                : "border-border bg-background/60 text-muted-foreground hover:border-sky-500/50 hover:text-foreground"
                            }`}
                          >
                            <IconComp className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-slate-900" : "text-cyan-400"}`} />
                            {isSelected ? `✓ ${skillItem.name}` : skillItem.name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Field 3: Salary Range */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-emerald-400" />
                  Expected Salary Range (in ₹){" "}
                  <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Minimum Salary
                    </label>
                    <input
                      type="number"
                      value={targetSalaryMin}
                      onChange={(e) => setTargetSalaryMin(e.target.value)}
                      placeholder="Min: ₹15,00,000"
                      min={0}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-all duration-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder:text-muted-foreground"
                    />
                    {targetSalaryMin && (
                      <p className="mt-1 text-xs text-emerald-400 font-medium">
                        {formatRupee(targetSalaryMin)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Maximum Salary
                    </label>
                    <input
                      type="number"
                      value={targetSalaryMax}
                      onChange={(e) => setTargetSalaryMax(e.target.value)}
                      placeholder="Max: ₹25,00,000"
                      min={0}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-all duration-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder:text-muted-foreground"
                    />
                    {targetSalaryMax && (
                      <p className="mt-1 text-xs text-emerald-400 font-medium">
                        {formatRupee(targetSalaryMax)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-sky-500/30 transition-all hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving Preferences...
                    </>
                  ) : (
                    <>
                      Save Preferences
                      <CheckCircle2 className="h-5 w-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </section>
      </motion.div>
    </div>
  );
}