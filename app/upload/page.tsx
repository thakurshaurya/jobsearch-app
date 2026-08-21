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
  Check,
} from "lucide-react";
import {
  saveUserResume,
  saveJobTarget,
  getUserProfileStatus,
  resetUserProfile,
} from "@/app/action";
import { DEVICON_SKILLS, getSkillIcon } from "@/lib/devicons";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function extractSkillsFromText(text: string): string[] {
  if (!text || typeof text !== "string") return [];

  const commonSkills = [
    // Frontend
    "React", "Vue", "Angular", "Next.js", "TypeScript", "JavaScript",
    "HTML", "CSS", "Tailwind", "Bootstrap",

    // Backend
    "Node.js", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP",
    "Django", "Flask", "Express", "Spring",

    // Databases
    "MongoDB", "PostgreSQL", "MySQL", "Firebase", "Redis", "SQL",

    // DevOps/Tools
    "Docker", "Kubernetes", "AWS", "Git", "CI/CD", "Jenkins",
    "Linux", "Docker Compose",

    // Other
    "REST API", "GraphQL", "Microservices", "Data Structures",
    "Algorithms", "Machine Learning", "API"
  ];

  const foundSkills = new Set<string>();

  commonSkills.forEach((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefix = /^\w/.test(skill) ? "\\b" : "";
    const suffix = /\w$/.test(skill) ? "\\b" : "";
    const regex = new RegExp(`${prefix}${escaped}${suffix}`, "i");
    if (regex.test(text)) {
      foundSkills.add(skill);
    }
  });

  return Array.from(foundSkills);
}

export default function UploadPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [initialChecking, setInitialChecking] = useState(true);

  // Step 1: Resume & Profile Bio
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>("");
  const [aboutSelf, setAboutSelf] = useState<string>("");
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [extractedSkillInput, setExtractedSkillInput] = useState<string>("");

  // Step 2: Job Preferences
  const [targetRole, setTargetRole] = useState<string>("");
  const [targetSkills, setTargetSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>("");
  const [targetSalaryMin, setTargetSalaryMin] = useState<string>("");
  const [targetSalaryMax, setTargetSalaryMax] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [failedSubmissionStep, setFailedSubmissionStep] = useState<1 | 2 | null>(
    null
  );

  useEffect(() => {
    async function checkExistingProfile() {
      try {
        const isReset = new URLSearchParams(window.location.search).get("reset") === "true";
        if (isReset) {
          await resetUserProfile();
          setStep(1);
          setFile(null);
          setAboutSelf("");
          setExtractedSkills([]);
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
              if (status.resume?.parsedSkills && status.resume.parsedSkills.length > 0) {
                setExtractedSkills(status.resume.parsedSkills);
              }
              if (status.resume?.aboutSelf) {
                setAboutSelf(status.resume.aboutSelf);
              }
            } else if (status.resume) {
              if (status.resume.parsedSkills && status.resume.parsedSkills.length > 0) {
                setExtractedSkills(status.resume.parsedSkills);
              }
              if (status.resume.aboutSelf) {
                setAboutSelf(status.resume.aboutSelf);
              }
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
      setExtractedSkills([]);
      setTargetRole("");
      setTargetSkills([]);
      setError("");
      setSuccessMsg("Previous profile data deleted. You can now submit new profile details.");
      setLoading(false);
    }
  };

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

  // Handle self-description text change & auto-extract skills
  const handleAboutSelfChange = (text: string) => {
    setAboutSelf(text);
    const detected = extractSkillsFromText(text);
    if (detected.length > 0) {
      setExtractedSkills((prev) => {
        const set = new Set([...prev]);
        detected.forEach((skill) => set.add(skill));
        return Array.from(set);
      });
    }
  };

  const handleAddExtractedSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (!extractedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setExtractedSkills([...extractedSkills, trimmed]);
    }
    setExtractedSkillInput("");
  };

  const handleRemoveExtractedSkill = (skillToRemove: string) => {
    setExtractedSkills(extractedSkills.filter((s) => s !== skillToRemove));
  };

  const handleExtractedSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddExtractedSkill(extractedSkillInput);
    }
  };

  const toggleExtractedSuggestionSkill = (skill: string) => {
    if (extractedSkills.includes(skill)) {
      handleRemoveExtractedSkill(skill);
    } else {
      handleAddExtractedSkill(skill);
    }
  };

  const handleStep1Submit = async (
    e?: React.FormEvent
  ) => {
    if (e) e.preventDefault();

    setError("");
    setSuccessMsg("");
    setFailedSubmissionStep(null);

    const hasFile = Boolean(file);
    const textTrimmed = aboutSelf.trim();
    const hasText = textTrimmed.length > 0;

    if (!hasFile && !hasText) {
      setError(
        "Please upload a resume or tell us about yourself."
      );
      return;
    }

    if (hasText && textTrimmed.length < 50) {
      setError(
        "Self-description must be at least 50 characters long."
      );
      return;
    }

    setLoading(true);

    try {
      let parsedResumeText = "";

      // --------------------------------
      // 1. Parse uploaded resume
      // --------------------------------
      if (file) {
        const formData = new FormData();

        formData.append("resume", file);

        const parseResponse = await fetch(
          "/api/resume/parse",
          {
            method: "POST",
            body: formData,
          }
        );

        const parseData = await parseResponse.json();

        if (!parseResponse.ok) {
          throw new Error(
            parseData?.error ||
            "Failed to parse resume"
          );
        }

        parsedResumeText = parseData.text;
      }

      // --------------------------------
      // 2. Combine resume + self description
      // --------------------------------

      const combinedText = [
        parsedResumeText,
        textTrimmed,
      ]
        .filter(Boolean)
        .join("\n\n");

      // --------------------------------
      // 3. Extract skills
      // --------------------------------

      const autoParsed =
        extractSkillsFromText(combinedText);

      const skillsToSave = Array.from(
        new Set([
          ...extractedSkills,
          ...autoParsed,
        ])
      );

      // --------------------------------
      // 4. Extract experience/education
      // --------------------------------

      const {
        experience,
        education,
      } = extractExperienceAndEducation(
        combinedText
      );

      // --------------------------------
      // 5. Determine source
      // --------------------------------

      let sourceType:
        | "resume"
        | "about_self"
        | "both";

      if (file && hasText) {
        sourceType = "both";
      } else if (file) {
        sourceType = "resume";
      } else {
        sourceType = "about_self";
      }

      // --------------------------------
      // 6. Save profile
      // --------------------------------

      const res = await saveUserResume(
        sourceType,
        undefined,
        combinedText || undefined,
        skillsToSave,
        experience || undefined,
        education || undefined
      );

      if (res?.error) {
        setError(res.error);
        setFailedSubmissionStep(1);
        return;
      }

      setExtractedSkills(skillsToSave);

      setSuccessMsg(
        "Resume analyzed successfully! Now tell us about your job preferences."
      );

      setTimeout(() => {
        setSuccessMsg("");
        setStep(2);
      }, 1200);

    } catch (error: any) {
      console.error(
        "Resume submission error:",
        error
      );

      setError(
        error?.message ||
        "Failed to process your resume."
      );

      setFailedSubmissionStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Skill Management
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
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl"
      >
        <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
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

          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: step === 1 ? "50%" : "50%" }}
              animate={{ width: step === 1 ? "50%" : "100%" }}
              transition={{ duration: 0.4 }}
            />
          </div>

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


          {step === 1 && (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleStep1Submit}
              className="mt-8 space-y-8"
            >
              {/* Resume File Upload */}
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
                      className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer ${isDragActive
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

                    {isUploading ? (
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs text-sky-400 font-medium">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-blue-500 transition-all duration-150"
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

              {/* Tell Us About Yourself Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    Tell Us About Yourself
                  </label>
                  <span
                    className={`text-xs ${aboutSelf.length > 0 && aboutSelf.length < 50
                      ? "text-amber-400 font-medium"
                      : "text-muted-foreground"
                      }`}
                  >
                    {aboutSelf.length} / 1000 characters
                  </span>
                </div>

                <textarea
                  value={aboutSelf}
                  onChange={(e) => handleAboutSelfChange(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Your experience, skills, education, key achievements (e.g. 'Experienced in React, TypeScript, Python, Node.js, and AWS...')"
                  className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground outline-none transition-all duration-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder:text-muted-foreground resize-none"
                />

                {aboutSelf.length > 0 && aboutSelf.length < 50 && (
                  <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    At least 50 characters required if providing self-description ({50 - aboutSelf.length} more needed).
                  </p>
                )}
              </div>

              {/* Extracted Skills Review & Editing */}
              <div className="space-y-3 rounded-2xl border border-border/80 bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Code className="h-4 w-4 text-sky-400" />
                    Detected / Added Skills
                  </label>
                  <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-400 border border-sky-500/20">
                    {extractedSkills.length} {extractedSkills.length === 1 ? "skill" : "skills"}
                  </span>
                </div>

                {/* Extracted Skills List */}
                {extractedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {extractedSkills.map((skill) => {
                      const IconComp = getSkillIcon(skill);
                      return (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                        >
                          <IconComp className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveExtractedSkill(skill)}
                            className="hover:text-red-400 transition-colors ml-0.5"
                            title={`Remove ${skill}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Type your skills into the self-description above (e.g. React, Python, Docker) to automatically extract them, or add them manually below.
                  </p>
                )}

                {/* Add Manual Extracted Skill */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={extractedSkillInput}
                    onChange={(e) => setExtractedSkillInput(e.target.value)}
                    onKeyDown={handleExtractedSkillKeyDown}
                    placeholder="Add more skills (e.g. Docker, GraphQL, Redis)..."
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-xs text-foreground outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddExtractedSkill(extractedSkillInput)}
                    className="flex items-center gap-1 rounded-xl bg-secondary px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>

                {/* Quick skill suggestions */}
                <div className="pt-1">
                  <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                    Quick suggestions:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["React", "Node.js", "Python", "TypeScript", "JavaScript", "AWS", "Docker", "MongoDB", "PostgreSQL", "Next.js", "Tailwind"].map(
                      (skill) => {
                        const isSelected = extractedSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
                        const IconComp = getSkillIcon(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleExtractedSuggestionSkill(skill)}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium transition-all ${isSelected
                              ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 font-semibold"
                              : "border-border bg-background/60 text-muted-foreground hover:border-sky-500/40 hover:text-foreground"
                              }`}
                          >
                            <IconComp className="h-3 w-3 shrink-0" />
                            {isSelected && <Check className="h-3 w-3" />}
                            {skill}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={loading || isUploading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3.5 text-base font-semibold text-slate-900 transition-all  disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* ================= STEP 2: JOB PREFERENCES ================= */}
          {step === 2 && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleStep2Submit}
              className="mt-8 space-y-6"
            >
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

              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Code className="h-4 w-4 text-cyan-400" />
                  What skills do you want to work with?{" "}
                  <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                </label>

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
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${isSelected
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3.5 text-base font-semibold text-slate-900 transition-all  disabled:opacity-50 disabled:cursor-not-allowed"
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