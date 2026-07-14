import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  BsFileEarmarkPdf,
  BsUpload,
  BsCheckCircleFill,
  BsXCircleFill,
  BsExclamationTriangleFill,
  BsArrowLeft,
  BsCoin,
  BsPrinter,
  BsPlayFill,
  BsLightningCharge,
} from "react-icons/bs";

const axiosInstance = axios;

function AtsChecker() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Form states
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Loading & Flow states
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState("uploading");
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);

  // Scanning steps timeline
  useEffect(() => {
    if (!loading) return;

    const timers = [
      setTimeout(() => setScanStep("parsing"), 2000),
      setTimeout(() => setScanStep("evaluating"), 4500),
      setTimeout(() => setScanStep("finalizing"), 7000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Only PDF files are supported.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Only PDF files are supported.");
      }
    }
  };

  const triggerSearch = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drag a PDF resume file.");
      return;
    }
    if (!jobRole.trim()) {
      setError("Please specify a target Job Role.");
      return;
    }
    if (!userData) {
      setError("You must be logged in to analyze your resume.");
      return;
    }
    if (userData.credits < 5) {
      setError("Insufficient credits. You need at least 5 credits.");
      return;
    }

    setLoading(true);
    setScanStep("uploading");
    setError("");
    setReport(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobRole", jobRole);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await axiosInstance.post(
        ServerUrl + "/api/interview/check-ats",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setReport(response.data.report);

      // Update redux user credits
      dispatch(
        setUserData({
          ...userData,
          credits: response.data.creditsLeft,
        }),
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to complete resume ATS analysis.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 50) return "#f59e0b"; // Yellow/Orange
    return "#06b6d4"; // Cyan
  };

  const getScoreBgClass = (score) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-250";
    if (score >= 50)
      return "bg-amber-55 bg-amber-50 text-amber-700 border-amber-250";
    return "bg-cyan-50 text-cyan-700 border-cyan-200";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setFile(null);
    setJobRole("");
    setJobDescription("");
    setReport(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col print:bg-white print:text-black font-sans">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="flex-1 px-4 py-12 md:px-8 print:p-0">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 hover:text-slate-900 transition cursor-pointer"
              >
                <BsArrowLeft />
                <span>Back</span>
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => navigate("/")}
                className="hover:text-slate-900 transition cursor-pointer"
              >
                Back to Home
              </button>
              {report && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 transition text-xs font-bold cursor-pointer border-l border-slate-205 pl-4"
                >
                  <span>Check Another Resume</span>
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm text-xs font-bold text-slate-700">
              <BsCoin className="text-amber-500" />
              <span>{userData?.credits || 0} Credits</span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                Scan costs 5 credits
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-10 print:mb-6">
            <h1 className="text-3xl md:text-4xl font-display font-extrabold leading-tight text-slate-900">
              ATS Resume{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
                Checker
              </span>
            </h1>
            <p className="text-slate-500 mt-2 text-xs sm:text-sm max-w-xl mx-auto print:hidden leading-relaxed font-semibold">
              Analyze your resume's parser friendliness, benchmark keywords
              against targeted job requirements, and fix structural flags.
            </p>
          </div>

          {/* Form Setup View */}
          {!loading && !report && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-sm max-w-3xl mx-auto"
            >
              <form onSubmit={triggerSearch} className="space-y-6">
                {/* Drag and Drop File Area */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Upload Resume (PDF only)
                  </label>
                  <div
                    className={`relative border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                      dragActive
                        ? "border-cyan-500 bg-cyan-50/50"
                        : "border-slate-200 hover:border-slate-350 bg-slate-50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!file ? (
                      <label
                        htmlFor="resume-upload"
                        className="cursor-pointer flex flex-col items-center text-center"
                      >
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mb-4 transition hover:scale-105 shadow-sm">
                          <BsUpload size={20} />
                        </div>
                        <span className="font-bold text-slate-700 text-sm">
                          Drag & Drop your resume here
                        </span>
                        <span className="text-[11px] text-slate-450 mt-1 font-semibold">
                          or click to browse from computer (Max 5MB)
                        </span>
                      </label>
                    ) : (
                      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 w-full max-w-md shadow-sm">
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100">
                          <BsFileEarmarkPdf size={30} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-450 mt-0.5 font-semibold font-mono">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-xs text-slate-450 hover:text-red-600 transition px-2 py-1 cursor-pointer font-bold"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Role Input */}
                <div>
                  <label
                    htmlFor="jobRole"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                  >
                    Target Job Role <span className="text-cyan-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="jobRole"
                    placeholder="e.g. Frontend Developer, Senior Data Analyst"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-850 placeholder-slate-400 transition font-semibold"
                    required
                  />
                </div>

                {/* Job Description TextArea */}
                <div>
                  <label
                    htmlFor="jobDesc"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                  >
                    Target Job Description (Optional)
                  </label>
                  <textarea
                    id="jobDesc"
                    rows={4}
                    placeholder="Paste the target job description here to extract exact missing keywords and check relevance mapping..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-slate-850 placeholder-slate-400 resize-none transition font-semibold"
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-red-50 text-red-705 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl border border-red-200 flex items-center gap-2 font-semibold"
                  >
                    <BsXCircleFill />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:opacity-95 transition-opacity py-3.5 rounded-full font-bold shadow-md shadow-cyan-600/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BsLightningCharge />
                    <span>Analyze Resume (Costs 5 Credits)</span>
                  </button>
                  <p className="text-center text-[10px] text-slate-450 mt-3 font-semibold">
                    By submitting, 5 credits will be deducted from your account.
                  </p>
                </div>
              </form>
            </motion.div>
          )}

          {/* Scanning / Loading Screen */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-slate-200 rounded-3xl p-10 shadow-lg max-w-lg mx-auto text-center flex flex-col items-center"
            >
              <div className="relative w-48 h-60 border border-dashed border-cyan-200 rounded-2xl overflow-hidden bg-slate-50 mb-8 flex flex-col items-center justify-center">
                <BsFileEarmarkPdf className="text-6xl text-red-500 mb-2 animate-pulse" />
                <p className="text-xs font-bold text-slate-700 px-4 truncate max-w-full">
                  {file?.name}
                </p>
                <p className="text-[10px] text-slate-450 font-mono font-semibold">
                  {(file?.size / (1024 * 1024)).toFixed(2)} MB
                </p>

                {/* Scanning sweep laser */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_10px_#0ea5e9]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              <h3 className="text-xl font-display font-bold mb-2 text-slate-800">
                Evaluating ATS Scores...
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-sm leading-relaxed font-semibold">
                {scanStep === "uploading" && "Uploading document to parser..."}
                {scanStep === "parsing" &&
                  "Extracting semantic structure and headings..."}
                {scanStep === "evaluating" &&
                  "Evaluating formatting guidelines and tables..."}
                {scanStep === "finalizing" &&
                  "Checking keywords match and finalizing report..."}
              </p>

              {/* Progress lights */}
              <div className="flex gap-2 mt-6">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${scanStep === "uploading" ? "bg-cyan-500 scale-125 shadow-[0_0_8px_#0ea5e9]" : "bg-slate-200"}`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${scanStep === "parsing" ? "bg-cyan-500 scale-125 shadow-[0_0_8px_#0ea5e9]" : "bg-slate-200"}`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${scanStep === "evaluating" ? "bg-cyan-500 scale-125 shadow-[0_0_8px_#0ea5e9]" : "bg-slate-200"}`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${scanStep === "finalizing" ? "bg-cyan-500 scale-125 shadow-[0_0_8px_#0ea5e9]" : "bg-slate-200"}`}
                />
              </div>
            </motion.div>
          )}

          {/* Results Dashboard Report */}
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 print:space-y-4"
            >
              {/* Header Overview Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden print:bg-white print:border-none print:shadow-none print:p-0 print:text-black">
                <div className="w-36 h-36 flex-shrink-0">
                  <CircularProgressbar
                    value={report.score}
                    text={`${report.score}%`}
                    styles={buildStyles({
                      pathColor: getScoreColor(report.score),
                      textColor: getScoreColor(report.score),
                      trailColor: "#1e293b",
                      textSize: "18px",
                      strokeLinecap: "round",
                    })}
                  />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start mb-3">
                    <h2 className="text-2xl font-display font-bold text-slate-800 print:text-black">
                      ATS Audit Score
                    </h2>
                    <span
                      className={`inline-block border text-[10px] font-bold px-3 py-1 rounded-full uppercase self-center md:self-auto ${getScoreBgClass(report.score)}`}
                    >
                      {report.score >= 80
                        ? "ATS Friendly"
                        : report.score >= 50
                          ? "Needs Tweaking"
                          : "Critical Issues"}
                    </span>
                  </div>

                  <p className="text-slate-500 print:text-gray-700 text-sm leading-relaxed mb-4 font-semibold">
                    {report.summary}
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-xs text-slate-450 print:text-gray-500 font-bold uppercase">
                    <div>
                      <span className="text-slate-500 print:text-gray-700">
                        Role:
                      </span>{" "}
                      <span className="text-slate-700">{jobRole}</span>
                    </div>
                    {jobDescription && (
                      <div>
                        <span className="text-slate-500 print:text-gray-700">
                          Relevance Match:
                        </span>{" "}
                        <span className="text-slate-700 font-bold">
                          Custom Requirements
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Print Button */}
                <div className="absolute top-6 right-6 flex items-center gap-2 print:hidden hidden md:flex">
                  <button
                    onClick={handlePrint}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition text-slate-500 hover:text-slate-900 cursor-pointer shadow-sm"
                    title="Print Report"
                  >
                    <BsPrinter size={18} />
                  </button>
                </div>
              </div>

              {/* Four Core Dimension Scores Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 print:grid-cols-2">
                {[
                  {
                    key: "formatting",
                    title: "Formatting",
                  },
                  {
                    key: "structure",
                    title: "Structure",
                  },
                  {
                    key: "content",
                    title: "Content Quality",
                  },
                  {
                    key: "keywordMatch",
                    title: "Keyword Match",
                  },
                ].map((dim) => {
                  const data = report.dimensions?.[dim.key] || {
                    score: 0,
                    feedback: "",
                  };
                  const scorePct = data.score * 10;
                  return (
                    <div
                      key={dim.key}
                      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm print:bg-white print:border-gray-200 print:text-black"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-slate-450 print:text-gray-500 uppercase tracking-wider">
                          {dim.title}
                        </span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: getScoreColor(scorePct) }}
                        >
                          {data.score}/10
                        </span>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full bg-slate-100 print:bg-gray-100 h-2 rounded-full mb-3 overflow-hidden border border-slate-200/40 print:border-none">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${scorePct}%`,
                            backgroundColor: getScoreColor(scorePct),
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 print:text-gray-600 leading-relaxed font-semibold">
                        {data.feedback}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Keywords Comparative Audits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-1">
                {/* Matched Keywords */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm print:bg-white print:border-gray-200">
                  <div className="flex items-center gap-2 mb-6">
                    <BsCheckCircleFill className="text-emerald-500 flex-shrink-0" />
                    <h3 className="font-display font-bold text-base sm:text-lg text-slate-800 print:text-black">
                      Matched Keywords & Skills (
                      {report.keywords?.matched?.length || 0})
                    </h3>
                  </div>

                  {report.keywords?.matched &&
                  report.keywords.matched.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {report.keywords.matched.map((kw, i) => (
                        <span
                          key={i}
                          className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-400 font-bold">
                      No matching keywords identified.
                    </p>
                  )}
                </div>

                {/* Missing Keywords */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm print:bg-white print:border-gray-200">
                  <div className="flex items-center gap-2 mb-6">
                    <BsXCircleFill className="text-red-500 flex-shrink-0" />
                    <h3 className="font-display font-bold text-base sm:text-lg text-slate-800 print:text-black">
                      Missing Keywords & Skills (
                      {report.keywords?.missing?.length || 0})
                    </h3>
                  </div>

                  {report.keywords?.missing &&
                  report.keywords.missing.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {report.keywords.missing.map((kw, i) => (
                        <span
                          key={i}
                          className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold"
                        >
                          +{kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-emerald-600 font-bold">
                      Excellent! Your resume covers all key variables for this
                      role.
                    </p>
                  )}
                </div>
              </div>

              {/* Red Flags logs */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm print:bg-white print:border-gray-200">
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-800 print:text-black mb-6">
                  Identified ATS Red Flags
                </h3>

                {report.issues && report.issues.length > 0 ? (
                  <div className="space-y-4">
                    {report.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 print:bg-gray-50 print:border-gray-200 transition"
                      >
                        <div className="mt-1 flex-shrink-0">
                          {issue.severity === "critical" ? (
                            <BsXCircleFill
                              className="text-red-500 text-lg"
                              title="Critical Issue"
                            />
                          ) : (
                            <BsExclamationTriangleFill
                              className="text-amber-500 text-lg"
                              title="Warning"
                            />
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                              Section: {issue.section}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                issue.severity === "critical"
                                  ? "bg-red-50 text-red-750 border border-red-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-250"
                              }`}
                            >
                              {issue.severity}
                            </span>
                          </div>

                          <p className="text-sm font-bold text-slate-800 print:text-black">
                            {issue.message}
                          </p>
                          <p className="text-xs text-slate-500 print:text-gray-700 leading-relaxed font-semibold">
                            <span className="font-bold text-cyan-600 mr-1">
                              Fix:
                            </span>{" "}
                            {issue.fix}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 flex flex-col items-center">
                    <BsCheckCircleFill className="text-emerald-500 text-3xl mb-2" />
                    <p className="font-bold text-slate-700">
                      No issues identified!
                    </p>
                    <p className="text-[11px] text-slate-450 mt-1 font-semibold">
                      Your resume format is fully compliance with parser
                      parameters.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Plan recommendations */}
              {report.recommendations && report.recommendations.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm print:bg-white print:border-gray-200">
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-800 print:text-black mb-6">
                    Action Plan Checklist
                  </h3>
                  <ul className="space-y-4">
                    {report.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="flex gap-3 items-start text-xs sm:text-sm text-slate-650 print:text-gray-700"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed font-semibold">
                          {rec}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 print:hidden">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-full text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Scan Another Resume
                </button>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={handlePrint}
                    className="w-full sm:w-auto bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-250 px-8 py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                  >
                    <BsPrinter />
                    <span>Print Report</span>
                  </button>

                  <button
                    onClick={() => navigate("/interview")}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold px-8 py-3 rounded-full text-xs flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 shadow-md shadow-indigo-600/10"
                  >
                    <BsPlayFill size={16} />
                    <span>Start Mock Interview</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

export default AtsChecker;
