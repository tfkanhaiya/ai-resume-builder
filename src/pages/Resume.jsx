import { useState } from "react";
import { supabase } from "../supabaseClient";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Check,
  LogOut,
} from "lucide-react";

// ✅ Safely convert any experience item to a string
const formatExperienceItem = (item) => {
  if (typeof item === "string") return item;
  if (typeof item === "object" && item !== null) {
    const parts = [];
    if (item.position) parts.push(item.position);
    if (item.company) parts.push(`at ${item.company}`);
    if (item.duration) parts.push(`(${item.duration})`);
    if (item.achievements) {
      const ach = Array.isArray(item.achievements)
        ? item.achievements.join(", ")
        : item.achievements;
      parts.push(`— ${ach}`);
    }
    return parts.length > 0 ? parts.join(" ") : JSON.stringify(item);
  }
  return String(item);
};

// ✅ Build plain text resume for copy/download
const buildResumeText = (result, formData) => {
  const experience = Array.isArray(result.experience)
    ? result.experience.map((item) => `  • ${formatExperienceItem(item)}`).join("\n")
    : "";

  return `
=====================================
         AI GENERATED RESUME
=====================================

NAME: ${formData.name}
ROLE: ${formData.role}

-------------------------------------
PROFESSIONAL SUMMARY
-------------------------------------
${result.summary}

-------------------------------------
EXPERIENCE HIGHLIGHTS
-------------------------------------
${experience}

-------------------------------------
COVER LETTER
-------------------------------------
${result.coverLetter}

=====================================
`.trim();
};

export default function Resume({ session }) {
  const [formData, setFormData] = useState({
    name: "",
    skills: "",
    experience: "",
    role: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Logout
  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    // App.jsx session listener auto-redirects to login
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("https://ai-resume-builder-iinu.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.error) {
        setResult({
          error: Array.isArray(data.error) ? data.error.join(", ") : data.error,
        });
      } else {
        setResult(data.result);
      }
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Something went wrong. Please try again." });
    }

    setLoading(false);
  };

  // ✅ Copy to clipboard
  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildResumeText(result, formData));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // ✅ Download as .txt
  const handleDownload = () => {
    if (!result) return;
    setDownloading(true);
    try {
      const text = buildResumeText(result, formData);
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formData.name.replace(/\s+/g, "_")}_Resume.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          {/* Left — Logo */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Sparkles className="w-7 h-7 text-blue-500" />
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                AI Resume Builder
              </h1>
            </div>
            <p className="text-slate-400 text-xs">
              Create stunning, AI-powered professional resumes in minutes
            </p>
          </div>

          {/* Right — User info + Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-slate-300 text-sm font-medium">
                {session.user.email}
              </span>
              <span className="text-slate-500 text-xs">Logged in</span>
            </div>

            {/* ✅ Avatar circle with first letter of email */}
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm uppercase">
              {session.user.email[0]}
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-950 border border-slate-700 hover:border-red-800 text-slate-300 hover:text-red-400 rounded-xl transition text-sm font-medium disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Form Section */}
          <div className="lg:col-span-2 lg:sticky lg:top-32 h-fit">
            <form
              onSubmit={handleSubmit}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  📋
                </span>
                Your Information
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-50 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="React, Node.js, Python, AWS"
                    value={formData.skills}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-50 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    placeholder="Senior Developer at Tech Corp (2020-2024)"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-50 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Target Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    placeholder="Senior Full-Stack Engineer"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-50 placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Resume
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {!result && !loading && (
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center h-96 flex flex-col items-center justify-center">
                <Sparkles className="w-16 h-16 text-slate-700 mb-4" />
                <p className="text-slate-400 text-lg">
                  Fill in your information and generate your AI-powered resume
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center h-96 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-300 text-lg">
                  Creating your professional resume...
                </p>
              </div>
            )}

            {result?.error && (
              <div className="bg-red-950/40 backdrop-blur-xl border border-red-800 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-400 mb-2">Error</h3>
                    <p className="text-red-300">{result.error}</p>
                  </div>
                </div>
              </div>
            )}

            {result && !result.error && (
              <div className="space-y-6">

                {/* ✅ Copy + Download Buttons */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl transition text-sm font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Resume
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition text-sm font-medium"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download .txt
                      </>
                    )}
                  </button>
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                      <h3 className="text-xl font-semibold">Professional Summary</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {typeof result.summary === "string"
                        ? result.summary
                        : JSON.stringify(result.summary)}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {Array.isArray(result.experience) && result.experience.length > 0 && (
                  <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                      <h3 className="text-xl font-semibold">Experience Highlights</h3>
                    </div>
                    <ul className="space-y-3">
                      {result.experience.map((item, index) => (
                        <li key={index} className="flex gap-3 text-slate-300">
                          <span className="text-blue-500 font-bold mt-1">•</span>
                          <span>{formatExperienceItem(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cover Letter */}
                {result.coverLetter && (
                  <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                      <h3 className="text-xl font-semibold">Cover Letter</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {typeof result.coverLetter === "string"
                        ? result.coverLetter
                        : JSON.stringify(result.coverLetter)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
