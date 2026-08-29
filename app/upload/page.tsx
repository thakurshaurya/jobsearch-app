"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ArrowRight,
  Briefcase,
  Code,
  IndianRupee,
  Sparkles,
  FileCheck,
  Trash2,
  Check,
  MapPin,
} from "lucide-react";
import {
  saveUserResume,
  saveJobTarget,
  getUserProfileStatus,
  resetUserProfile,
} from "@/app/action";
import { getSkillIcon } from "@/lib/devicons";
import { countryOptions } from "@/lib/locations";
import { CustomSelect } from "@/components/ui/custom-select";

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

  // Resume / file input states
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>("");
  const [aboutSelf, setAboutSelf] = useState<string>("");

  // AI Loading states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>("");

  // AI Profile data (returned by Groq or loaded from db)
  const [parsedText, setParsedText] = useState<string>("");
  const [candidateName, setCandidateName] = useState<string>("");
  const [experienceYears, setExperienceYears] = useState<string>("");
  const [seniority, setSeniority] = useState<string>("Mid Level");
  const [education, setEducation] = useState<string>("");
  const [aiSkills, setAiSkills] = useState<string[]>([]);
  const [aiRoles, setAiRoles] = useState<string[]>([]);
  const [aiLocations, setAiLocations] = useState<string[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);

  // Editing state inputs
  const [skillInput, setSkillInput] = useState<string>("");
  const [roleInput, setRoleInput] = useState<string>("");
  const [locationInput, setLocationInput] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");
  const [targetSalaryMin, setTargetSalaryMin] = useState<string>("");
  const [targetSalaryMax, setTargetSalaryMax] = useState<string>("");
  const [targetCountry, setTargetCountry] = useState<string>("India");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    async function checkExistingProfile() {
      try {
        const isReset = new URLSearchParams(window.location.search).get("reset") === "true";
        if (isReset) {
          await resetUserProfile();
          setStep(1);
          setFile(null);
          setAboutSelf("");
          setCandidateName("");
          setExperienceYears("");
          setSeniority("Mid Level");
          setEducation("");
          setAiSkills([]);
          setAiRoles([]);
          setAiLocations([]);
          setTargetRole("");
          setTargetSalaryMin("");
          setTargetSalaryMax("");
          setTargetCountry("India");
        } else {
          const status = await getUserProfileStatus();
          if (status.authenticated) {
            if (status.hasResume && status.hasJobTarget) {
              router.push("/resultedjobs");
              return;
            } else if (status.resume) {
              // Populate edit state if resume exists but job target is incomplete
              const r = status.resume;
              setParsedText(r.resumeText || r.aboutSelf || "");
              setCandidateName(r.aboutSelf?.split("\n")?.[0] || "");
              setExperienceYears(r.experience || "");
              setEducation(r.education || "");
              setAiSkills(r.parsedSkills || []);
              setAiRoles(r.roles || []);
              setSeniority(r.seniority || "Mid Level");
              setAiLocations(r.locations || []);
              setSearchQueries(r.searchQueries || []);
              
              if (status.jobTarget) {
                setTargetRole(status.jobTarget.targetRole || "");
                setTargetSalaryMin(status.jobTarget.targetSalaryMin?.toString() || "");
                setTargetSalaryMax(status.jobTarget.targetSalaryMax?.toString() || "");
                setTargetCountry(status.jobTarget.targetCountry || "India");
              } else if (r.roles && r.roles.length > 0) {
                setTargetRole(r.roles[0]);
              }
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
      setCandidateName("");
      setExperienceYears("");
      setSeniority("Mid Level");
      setEducation("");
      setAiSkills([]);
      setAiRoles([]);
      setAiLocations([]);
      setTargetRole("");
      setTargetSalaryMin("");
      setTargetSalaryMax("");
      setTargetCountry("India");
      setError("");
      setSuccessMsg("Previous profile data deleted. You can now submit new profile details.");
      setLoading(false);
    }
  };

  const handleFileDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
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

  // Analyze Resume with AI via backend API route
  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const hasFile = Boolean(file);
    const textTrimmed = aboutSelf.trim();

    if (!hasFile && !textTrimmed) {
      setError("Please upload a resume or describe your professional experience.");
      return;
    }

    setIsAnalyzing(true);
    setLoadingStage("Scanning resume...");

    try {
      let parsedResumeText = "";

      // 1. Parsing file if uploaded
      if (file) {
        const formData = new FormData();
        formData.append("resume", file);

        const parseResponse = await fetch("/api/resume/parse", {
          method: "POST",
          body: formData,
        });

        const parseData = await parseResponse.json();

        if (!parseResponse.ok) {
          throw new Error(parseData?.error || "Failed to parse resume file");
        }

        parsedResumeText = parseData.text;
      }

      // If no file but we have text description
      if (!parsedResumeText && textTrimmed) {
        parsedResumeText = textTrimmed;
      }

      // 2. Multi-stage loading animation updates
      const stages = [
        "Understanding your profile...",
        "Identifying core skills...",
        "Finding relevant roles...",
        "Generating job search queries...",
        "Preparing profile review..."
      ];
      
      let stageIndex = 0;
      const stageInterval = setInterval(() => {
        if (stageIndex < stages.length) {
          setLoadingStage(stages[stageIndex]);
          stageIndex++;
        } else {
          clearInterval(stageInterval);
        }
      }, 1200);

      // 3. Request structured AI profile from backend
      const analyzeResponse = await fetch("/api/ai/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: parsedResumeText,
          aboutSelf: textTrimmed || undefined,
        }),
      });

      clearInterval(stageInterval);
      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok) {
        throw new Error(analyzeData?.error || "AI failed to analyze the resume");
      }

      const { analysis } = analyzeData;

      // 4. Populate review states
      setParsedText(parsedResumeText);
      setCandidateName(analysis.candidate?.name || "");
      setExperienceYears(analysis.candidate?.experienceYears?.toString() || "0");
      setSeniority(analysis.candidate?.seniority || "Mid Level");
      setEducation(analysis.candidate?.education?.join(", ") || "");
      setAiSkills(analysis.skills || []);
      setAiRoles(analysis.roles || []);
      setAiLocations(analysis.locations || []);
      setSearchQueries(analysis.searchQueries || []);

      // Pre-fill target role with the primary recommendation
      if (analysis.roles && analysis.roles.length > 0) {
        setTargetRole(analysis.roles[0]);
      }

      setSuccessMsg("AI analysis complete! Please review and save your profile.");
      
      setTimeout(() => {
        setSuccessMsg("");
        setStep(2);
      }, 1000);

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze resume with AI.";
      console.error("AI Analysis error:", err);
      setError(errorMsg);
    } finally {
      setIsAnalyzing(false);
      setLoadingStage("");
    }
  };

  // Save reviewed AI Profile to Database
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!targetRole.trim()) {
      setError("Please select or type a target job role.");
      return;
    }

    if (!targetCountry.trim()) {
      setError("Please select a target country.");
      return;
    }

    setLoading(true);

    try {
      // 1. Save Resume Model details
      const saveResumeResult = await saveUserResume(
        file ? "both" : "about_self",
        undefined,
        aboutSelf.trim() || parsedText,
        aiSkills,
        experienceYears,
        education,
        parsedText,
        aiRoles,
        seniority,
        aiLocations,
        searchQueries
      );

      if (saveResumeResult?.error) {
        throw new Error(saveResumeResult.error);
      }

      // 2. Save JobTarget Model details
      const minVal = targetSalaryMin ? parseFloat(targetSalaryMin) : undefined;
      const maxVal = targetSalaryMax ? parseFloat(targetSalaryMax) : undefined;

      const saveTargetResult = await saveJobTarget(
        targetRole.trim(),
        aiSkills.length > 0 ? aiSkills : undefined,
        minVal,
        maxVal,
        targetCountry
      );

      if (saveTargetResult?.error) {
        throw new Error(saveTargetResult.error);
      }

      setSuccessMsg("AI Profile saved successfully! Loading matching jobs...");
      setTimeout(() => {
        router.push("/resultedjobs");
      }, 1200);

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save your profile preferences.";
      console.error("Error saving profile:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !aiSkills.includes(trimmed)) {
      setAiSkills([...aiSkills, trimmed]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setAiSkills(aiSkills.filter((s) => s !== skill));
  };

  const handleAddRole = (role: string) => {
    const trimmed = role.trim();
    if (trimmed && !aiRoles.includes(trimmed)) {
      setAiRoles([...aiRoles, trimmed]);
    }
    setRoleInput("");
  };

  const handleRemoveRole = (role: string) => {
    setAiRoles(aiRoles.filter((r) => r !== role));
  };

  const handleAddLocation = (loc: string) => {
    const trimmed = loc.trim();
    if (trimmed && !aiLocations.includes(trimmed)) {
      setAiLocations([...aiLocations, trimmed]);
    }
    setLocationInput("");
  };

  const handleRemoveLocation = (loc: string) => {
    setAiLocations(aiLocations.filter((l) => l !== loc));
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
              {step === 1 ? "AI Resume Upload" : "Verify AI Profile"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {step === 1
                ? "Upload your resume or tell us about your experience to generate your AI profile."
                : "Verify the information AI extracted from your resume."}
            </p>
          </div>

          {/* AI Progress overlay */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl bg-slate-950/80 backdrop-blur-md"
              >
                <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                <h3 className="mt-4 text-lg font-bold text-white tracking-wide">
                  AI analysis in progress
                </h3>
                <p className="mt-2 text-sm text-cyan-400 font-semibold animate-pulse">
                  {loadingStage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

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

          {/* STEP 1: RESUME UPLOAD AND BASIC TEXT */}
          {step === 1 && (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleAnalyzeResume}
              className="mt-8 space-y-8"
            >
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
                        File ready for AI analysis
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    Additional Details / Self Description (Optional)
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {aboutSelf.length} / 1000 characters
                  </span>
                </div>

                <textarea
                  value={aboutSelf}
                  onChange={(e) => setAboutSelf(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="You can write custom career achievements or additional details to override or supplement your resume (e.g. 'Looking to transition to React Developer after 2 years of Java backend experience...')"
                  className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground outline-none transition-all duration-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={isAnalyzing || isUploading || (!file && !aboutSelf.trim())}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3.5 text-base font-semibold text-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze Resume with AI
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* STEP 2: REVIEW AI PROFILE & EXPECTATIONS */}
          {step === 2 && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSaveProfile}
              className="mt-8 space-y-6"
            >
              {/* Profile details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Candidate Name"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Seniority Level
                  </label>
                  <CustomSelect
                    value={seniority}
                    onChange={setSeniority}
                    options={[
                      { value: "Entry Level", label: "Entry Level" },
                      { value: "Mid Level", label: "Mid Level" },
                      { value: "Senior", label: "Senior" },
                      { value: "Lead", label: "Lead / Manager" },
                      { value: "Executive", label: "Executive" }
                    ]}
                    placeholder="Select Seniority Level"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    min={0}
                    placeholder="e.g. 3"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Education / Qualifications
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              {/* Target role */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-sky-400" />
                  Primary Target Job Role <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  {aiRoles.length > 0 ? (
                    <CustomSelect
                      value={targetRole}
                      onChange={setTargetRole}
                      options={[
                        ...aiRoles.map((role) => ({ value: role, label: role })),
                        { value: "custom", label: "-- Type Custom Role --" }
                      ]}
                      placeholder="Select target role"
                    />
                  ) : (
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Frontend React Developer"
                      required
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  )}
                </div>

                {targetRole === "custom" && (
                  <input
                    type="text"
                    value=""
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Type custom role..."
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                )}
              </div>

              {/* Target Country */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-400" />
                  Target Country / Region <span className="text-red-400">*</span>
                </label>
                <CustomSelect
                  value={targetCountry}
                  onChange={setTargetCountry}
                  options={countryOptions}
                  placeholder="Select target country"
                />
              </div>

              {/* Recommended roles */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sky-400" />
                  Recommended Roles
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {aiRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(role)}
                        className="hover:text-red-400 transition-colors ml-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="Add suggested role..."
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-sky-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRole(roleInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddRole(roleInput)}
                    className="rounded-xl bg-secondary px-3.5 py-2 text-xs font-semibold hover:bg-secondary/80"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Core skills */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Code className="h-4 w-4 text-emerald-400" />
                  Core Skills
                </label>
                <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
                  {aiSkills.map((skill) => {
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
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-400 transition-colors ml-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add more skills..."
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-sky-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(skillInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillInput)}
                    className="rounded-xl bg-secondary px-3.5 py-2 text-xs font-semibold hover:bg-secondary/80"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  Preferred Locations / Remote
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {aiLocations.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300"
                    >
                      {loc}
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(loc)}
                        className="hover:text-red-400 transition-colors ml-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Add location (e.g. Remote, India)..."
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-sky-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLocation(locationInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddLocation(locationInput)}
                    className="rounded-xl bg-secondary px-3.5 py-2 text-xs font-semibold hover:bg-secondary/80"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Expected salary */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-emerald-400" />
                  Expected Salary Range (Optional)
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <input
                      type="number"
                      value={targetSalaryMin}
                      onChange={(e) => setTargetSalaryMin(e.target.value)}
                      placeholder="Minimum (e.g. 800000)"
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                    {targetSalaryMin && (
                      <p className="mt-1 text-xs text-emerald-400 font-medium">
                        {formatRupee(targetSalaryMin)}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      value={targetSalaryMax}
                      onChange={(e) => setTargetSalaryMax(e.target.value)}
                      placeholder="Maximum (e.g. 1500000)"
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                    {targetSalaryMax && (
                      <p className="mt-1 text-xs text-emerald-400 font-medium">
                        {formatRupee(targetSalaryMax)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Profile */}
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-border py-3.5 text-base font-semibold hover:bg-secondary/60 transition"
                >
                  Back
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-blue-500 py-3.5 text-slate-900 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving AI Profile...
                    </>
                  ) : (
                    <>
                      Confirm & Save Profile
                      <Check className="h-5 w-5" />
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