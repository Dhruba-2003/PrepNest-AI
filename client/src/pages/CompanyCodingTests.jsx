import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaClock,
  FaHistory,
  FaSpinner,
  FaExclamationTriangle,
  FaCode,
  FaBolt,
  FaPlay,
  FaCheckDouble,
  FaMemory,
  FaTerminal,
  FaLightbulb,
  FaCopy,
  FaRedo,
  FaTrash,
} from "react-icons/fa";

const COMPANIES = [
  {
    name: "Amazon",
    color: "from-amber-500 to-orange-600",
    desc: "DSA, Trees, Graphs & Dynamic Programming",
  },
  {
    name: "Google",
    color: "from-red-500 to-rose-600",
    desc: "High-Bar Mathematical & Graph Optimization",
  },
  {
    name: "Microsoft",
    color: "from-blue-500 to-cyan-600",
    desc: "Core Data Structures, Strings & Arrays",
  },
  {
    name: "Meta",
    color: "from-blue-600 to-indigo-700",
    desc: "Speed Coding, Hash Maps & Interval Logic",
  },
  {
    name: "TCS NQT",
    color: "from-indigo-600 to-purple-700",
    desc: "Digital Coding & Array Transformations",
  },
  {
    name: "Infosys",
    color: "from-cyan-600 to-blue-800",
    desc: "SP & DSE Specialist Coding Challenges",
  },
  {
    name: "Wipro",
    color: "from-purple-600 to-indigo-800",
    desc: "Turbo & Elite Coding Assessments",
  },
  {
    name: "Flipkart",
    color: "from-yellow-500 to-amber-600",
    desc: "Machine Coding & E-Commerce Logic",
  },
  {
    name: "Zomato",
    color: "from-red-500 to-pink-600",
    desc: "Fast-Paced System Algorithms & Sorting",
  },
  {
    name: "Custom",
    color: "from-gray-700 to-gray-900",
    desc: "Enter Any Target Tech Company",
  },
];

const LANGUAGES = [
  { id: "python", name: "Python 3.11", monacoLang: "python", icon: "Py" },
  { id: "javascript", name: "JavaScript (Node 20)", monacoLang: "javascript", icon: "JS" },
  { id: "cpp", name: "C++ (GCC 13)", monacoLang: "cpp", icon: "C++" },
  { id: "java", name: "Java 17 (OpenJDK)", monacoLang: "java", icon: "Java" },
  { id: "c", name: "C (GCC 13)", monacoLang: "c", icon: "C" },
];

function CompanyCodingTests() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  // Stage: 'selection', 'coding', 'report', 'history'
  const [stage, setStage] = useState("selection");

  // Selection setup state
  const [selectedCompany, setSelectedCompany] = useState("Amazon");
  const [customCompany, setCustomCompany] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [selectedLang, setSelectedLang] = useState("python");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Active Coding IDE state
  const [codingTestId, setCodingTestId] = useState(null);
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [code, setCode] = useState("");
  const [editorFontSize, setEditorFontSize] = useState(15);

  // Execution & Submission state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [activeTab, setActiveTab] = useState("testcases"); // 'testcases' | 'analysis'

  // Report state
  const [completedReport, setCompletedReport] = useState(null);

  // History state
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const handleGenerateChallenge = async () => {
    if (!userData) {
      alert("Please login first to generate AI coding assessments.");
      navigate("/auth");
      return;
    }

    if (userData.credits < 20) {
      alert(
        "Not enough credits! You need at least 20 credits to generate an AI coding assessment.",
      );
      navigate("/pricing");
      return;
    }

    const companyToUse =
      selectedCompany === "Custom" ? customCompany.trim() : selectedCompany;
    if (!companyToUse) {
      setErrorMsg("Please enter or select a target company name.");
      return;
    }

    setErrorMsg("");
    setIsGenerating(true);

    try {
      const response = await axios.post(
        ServerUrl + "/api/coding-test/generate",
        {
          companyName: companyToUse,
          difficulty: difficulty,
          language: selectedLang,
        },
        { withCredentials: true },
      );

      if (response.data && response.data.success) {
        if (userData) {
          dispatch(
            setUserData({ ...userData, credits: response.data.userCredits }),
          );
        }

        const testData = response.data.codingTest;
        setCodingTestId(testData._id);
        setProblem(testData.problem);
        setTestCases(testData.testCases || []);

        const initialBoilerplate =
          testData.problem.starterCode?.[selectedLang] ||
          "// Write your solution here\n";
        setCode(initialBoilerplate);
        setExecutionResult(null);
        setStage("coding");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error.response?.data?.message ||
          "Failed to generate coding assessment. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLanguageChange = (newLangId) => {
    setSelectedLang(newLangId);
    if (problem && problem.starterCode) {
      const boilerplate =
        problem.starterCode[newLangId] || "// Write your code here\n";
      setCode(boilerplate);
    }
  };

  const handleResetBoilerplate = () => {
    if (
      window.confirm(
        "Are you sure you want to reset your code to the initial boilerplate?",
      )
    ) {
      const boilerplate =
        problem?.starterCode?.[selectedLang] || "// Write your code here\n";
      setCode(boilerplate);
    }
  };

  const handleRunCode = async () => {
    if (isRunning || isSubmitting || !codingTestId) return;
    setIsRunning(true);
    setExecutionResult(null);
    setActiveTab("testcases");

    try {
      const response = await axios.post(
        ServerUrl + "/api/coding-test/execute",
        {
          codingTestId: codingTestId,
          code: code,
          language: selectedLang,
          isSubmission: false,
        },
        { withCredentials: true },
      );

      if (response.data && response.data.success) {
        setExecutionResult(response.data.result);
      }
    } catch (error) {
      console.error(error);
      alert("Execution failed. Please verify network connection.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitFinalCode = async () => {
    if (isRunning || isSubmitting || !codingTestId) return;
    if (
      !window.confirm(
        "Submit final code for grading? All public and hidden test cases will be evaluated.",
      )
    )
      return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        ServerUrl + "/api/coding-test/execute",
        {
          codingTestId: codingTestId,
          code: code,
          language: selectedLang,
          isSubmission: true,
        },
        { withCredentials: true },
      );

      if (response.data && response.data.success) {
        setCompletedReport({
          ...response.data.result,
          problemTitle: problem?.title,
          companyName:
            selectedCompany === "Custom" ? customCompany : selectedCompany,
          difficulty: difficulty,
          language: selectedLang,
          submittedCode: code,
        });
        setStage("report");
      }
    } catch (error) {
      console.error(error);
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    setStage("history");
    try {
      const res = await axios.get(ServerUrl + "/api/coding-test/history", {
        withCredentials: true,
      });
      if (res.data && res.data.success) {
        setHistoryList(res.data.codingTests);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const deleteCodingTest = async (testId) => {
    if (!window.confirm("Delete this coding test permanently? This action cannot be undone.")) return;
    setDeletingId(testId);
    setDeleteError("");
    try {
      await axios.delete(ServerUrl + "/api/coding-test/" + testId, { withCredentials: true });
      setHistoryList((tests) => tests.filter((test) => test._id !== testId));
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Failed to delete coding test. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Home Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-xs font-bold cursor-pointer"
          >
            <FaArrowLeft />
            <span>Back to Home</span>
          </button>
        </div>
        {/* Navigation Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200">
          <div>
            <span className="bg-cyan-50 border border-cyan-100 text-cyan-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Real-time IDE
            </span>
            <h1 className="text-3xl font-display font-extrabold text-slate-900 mt-2.5 flex items-center gap-3">
              Company-Wise Coding Tests
            </h1>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto shrink-0">
            <button
              onClick={() => setStage("selection")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                stage === "selection"
                  ? "bg-cyan-600 text-white shadow-[0_4px_15px_rgba(6,182,212,0.25)]"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
              }`}
            >
              + New Challenge
            </button>
            <button
              onClick={fetchHistory}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                stage === "history"
                  ? "bg-cyan-600 text-white shadow-[0_4px_15px_rgba(6,182,212,0.25)]"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
              }`}
            >
              <FaHistory />
              <span>Past Submissions</span>
            </button>
          </div>
        </div>

        {/* STAGE 1: SELECTION */}
        {stage === "selection" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm space-y-10"
          >
            {/* Step 1: Select Target Company */}
            <div>
              <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2.5 mb-5">
                <span className="w-7 h-7 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center text-xs font-bold border border-cyan-100">
                  1
                </span>
                Select Target Tech Company
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {COMPANIES.map((company) => {
                  const isSelected = selectedCompany === company.name;
                  return (
                    <div
                      key={company.name}
                      onClick={() => setSelectedCompany(company.name)}
                      className={`cursor-pointer rounded-2xl p-4.5 border-2 transition-all duration-200 flex flex-col justify-between h-28 ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-50/50 shadow-sm transform scale-[1.02]"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-800 text-sm sm:text-base">
                          {company.name}
                        </span>
                        {isSelected && (
                          <FaCheckCircle className="text-cyan-600 text-sm" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed line-clamp-2">
                        {company.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {selectedCompany === "Custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-5"
                >
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 mb-2">
                    Enter Target Company Name:
                  </label>
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder="e.g. Netflix, Apple, Bloomberg, Uber, Oracle..."
                    className="w-full max-w-md px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition text-sm font-semibold placeholder-slate-450"
                  />
                </motion.div>
              )}
            </div>

            <hr className="border-slate-200/50" />

            {/* Step 2: Difficulty & Language */}
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2.5 mb-4">
                  <span className="w-7 h-7 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center text-xs font-bold border border-cyan-100">
                    2
                  </span>
                  Difficulty Level
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      id: "Easy",
                      color:
                        "border-emerald-250 bg-emerald-50 text-emerald-700",
                    },
                    {
                      id: "Medium",
                      color:
                        "border-amber-250 bg-amber-55 bg-amber-50 text-amber-700",
                    },
                    {
                      id: "Hard",
                      color: "border-red-250 bg-red-50 text-red-700",
                    },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm transition text-center cursor-pointer ${
                        difficulty === d.id
                          ? d.color + " shadow-sm scale-[1.02]"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {d.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2.5 mb-4">
                  <span className="w-7 h-7 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center text-xs font-bold border border-cyan-100">
                    3
                  </span>
                  Programming Language
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                        selectedLang === lang.id
                          ? "border-cyan-500 bg-cyan-600 text-white shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      <span>{lang.icon}</span>
                      <span>{lang.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold">
                <FaExclamationTriangle className="text-red-505 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center text-lg shrink-0">
                  <FaBolt />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-805 text-slate-800">
                    Assessment Cost: 20 Credits
                  </p>
                  <p className="text-xs text-slate-500 font-semibold">
                    Your balance:{" "}
                    <span className="font-bold text-cyan-650 text-cyan-600">
                      {userData?.credits || 0} credits
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateChallenge}
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm shadow-cyan-600/10"
              >
                {isGenerating ? (
                  <>
                    <FaSpinner className="animate-spin text-base" />
                    <span>Analyzing Problem...</span>
                  </>
                ) : (
                  <>
                    <FaCode />
                    <span>Start Coding Challenge</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 2: SPLIT SCREEN CODING IDE */}
        {stage === "coding" && problem && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-12 gap-6 min-h-[760px]"
          >
            {/* Left Column: Problem description */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between max-h-[820px] overflow-y-auto space-y-6 shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100">
                    {selectedCompany === "Custom"
                      ? customCompany
                      : selectedCompany}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                      difficulty === "Easy"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : difficulty === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {difficulty}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mb-4 leading-tight">
                  {problem.title}
                </h2>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 font-semibold">
                  {problem.description}
                </p>

                {/* IO formats */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                      Input Format
                    </h4>
                    <p className="text-xs text-slate-650 text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-semibold">
                      {problem.inputFormat}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-455 text-slate-450 mb-1.5">
                      Output Format
                    </h4>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-semibold">
                      {problem.outputFormat}
                    </p>
                  </div>
                </div>

                {/* Constraints */}
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">
                    Constraints
                  </h4>
                  <div className="bg-amber-55 bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs font-mono text-amber-700 font-semibold">
                    {problem.constraints}
                  </div>
                </div>

                {/* Sample IO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-450 uppercase">
                        Sample Input
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(problem.sampleInput)
                        }
                        className="text-[10px] font-bold text-cyan-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FaCopy /> Copy
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap font-bold">
                      {problem.sampleInput}
                    </pre>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-450 uppercase">
                        Sample Output
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(problem.sampleOutput)
                        }
                        className="text-[10px] font-bold text-cyan-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FaCopy /> Copy
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap font-bold">
                      {problem.sampleOutput}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold">
                <button
                  onClick={() => setStage("selection")}
                  className="font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FaArrowLeft /> Exit Challenge
                </button>
                <span className="text-slate-450">
                  Auto-evaluates edge cases
                </span>
              </div>
            </div>

            {/* Right Column: Code Editor + execution terminal */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Code Editor block */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex-1 flex flex-col min-h-[440px]">
                {/* Editor header */}
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FaCode className="text-cyan-600" /> Online IDE
                    </span>
                    <select
                      value={selectedLang}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer focus:ring-1 focus:ring-cyan-500"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.icon} {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={editorFontSize}
                      onChange={(e) =>
                        setEditorFontSize(Number(e.target.value))
                      }
                      className="bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-xl outline-none cursor-pointer font-semibold"
                    >
                      <option value={13}>13px</option>
                      <option value={15}>15px</option>
                      <option value={17}>17px</option>
                      <option value={19}>19px</option>
                    </select>

                    <button
                      onClick={handleResetBoilerplate}
                      className="text-xs text-slate-655 text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer font-bold shadow-sm"
                    >
                      <FaRedo className="text-xs" /> Reset Code
                    </button>
                  </div>
                </div>

                {/* Monaco component */}
                <div className="flex-1 w-full pt-2 bg-[#1e1e1e]">
                  <Editor
                    height="380px"
                    language={
                      LANGUAGES.find((l) => l.id === selectedLang)
                        ?.monacoLang || "python"
                    }
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    theme="vs-dark"
                    options={{
                      fontSize: editorFontSize,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      wordWrap: "on",
                    }}
                  />
                </div>

                {/* Editor Action buttons */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="text-[10px] text-slate-500 font-semibold">
                    Ensure your variables align with function parameters.
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning || isSubmitting}
                      className="px-5 py-2.5 bg-white border border-slate-250 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {isRunning ? (
                        <FaSpinner className="animate-spin text-cyan-500" />
                      ) : (
                        <FaPlay className="text-cyan-600" />
                      )}
                      <span>Run Code</span>
                    </button>

                    <button
                      onClick={handleSubmitFinalCode}
                      disabled={isRunning || isSubmitting}
                      className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-cyan-600/10"
                    >
                      {isSubmitting ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheckDouble />
                      )}
                      <span>Submit Code</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Console terminal evaluator */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab("testcases")}
                      className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition flex items-center gap-2 cursor-pointer ${
                        activeTab === "testcases"
                          ? "border-cyan-500 text-cyan-600"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <FaTerminal /> Test Cases & Console
                    </button>
                    <button
                      onClick={() => setActiveTab("analysis")}
                      className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition flex items-center gap-2 cursor-pointer ${
                        activeTab === "analysis"
                          ? "border-cyan-500 text-cyan-600"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <FaMemory /> Execution Metrics
                    </button>
                  </div>

                  {executionResult && (
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                        executionResult.status === "Passed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {executionResult.status}
                    </span>
                  )}
                </div>

                {/* Console tabs content */}
                <div>
                  {isRunning ? (
                    <div className="py-12 text-center space-y-3">
                      <FaSpinner className="animate-spin text-3xl text-cyan-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700">
                        Evaluating code against virtual sandbox test cases...
                      </p>
                      <p className="text-xs text-slate-450 font-semibold">
                        Estimating execution time, memory footprint, and time
                        complexity...
                      </p>
                    </div>
                  ) : !executionResult ? (
                    <div className="py-10 text-center text-slate-400 text-xs space-y-2 font-semibold">
                      <p className="font-bold text-slate-500 uppercase tracking-wide">
                        No Execution Results Yet
                      </p>
                      <p className="text-slate-450 max-w-sm mx-auto leading-relaxed">
                        Click{" "}
                        <strong className="text-slate-600">Run Code</strong>{" "}
                        above to verify logic, or click{" "}
                        <strong className="text-cyan-650">Submit Code</strong>{" "}
                        to start evaluation scoring.
                      </p>
                    </div>
                  ) : activeTab === "testcases" ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        {executionResult.testCaseResults?.map((tc, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border-2 transition ${
                              tc.passed
                                ? "border-emerald-200 bg-emerald-50/[0.05]"
                                : "border-red-200 bg-red-50/[0.05]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                Test Case #{tc.testCaseId || idx + 1}
                              </span>
                              {tc.passed ? (
                                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                  <FaCheckCircle /> Passed
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-red-700 flex items-center gap-1 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                                  <FaTimesCircle /> Failed
                                </span>
                              )}
                            </div>

                            <div className="space-y-2 text-[11px] font-mono leading-relaxed text-slate-600 font-semibold">
                              <div>
                                <span className="text-slate-450">Input: </span>
                                <span className="text-slate-800 font-bold">
                                  {tc.input}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-455 text-slate-450">
                                  Expected:{" "}
                                </span>
                                <span className="text-emerald-755 text-emerald-600 font-bold">
                                  {tc.expectedOutput}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-455 text-slate-455 text-slate-455 text-slate-450">
                                  Actual:{" "}
                                </span>
                                <span
                                  className={
                                    tc.passed
                                      ? "text-emerald-600 font-bold"
                                      : "text-red-655 text-red-600 font-bold"
                                  }
                                >
                                  {tc.actualOutput}
                                </span>
                              </div>
                            </div>

                            {tc.executionTimeMs !== undefined && (
                              <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[10px] text-slate-450 font-mono font-bold">
                                <span>Speed: {tc.executionTimeMs} ms</span>
                                <span>Memory: {tc.memoryKB} KB</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {executionResult.feedback && (
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-semibold">
                          <span className="font-bold text-cyan-600 uppercase tracking-wider block mb-1.5">
                            AI Feedback
                          </span>
                          {executionResult.feedback}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Metric widgets */}
                      {[
                        {
                          label: "Time Complexity",
                          value: executionResult.timeComplexity || "O(N)",
                          color: "text-amber-600",
                        },
                        {
                          label: "Space Complexity",
                          value: executionResult.spaceComplexity || "O(1)",
                          color: "text-cyan-600",
                        },
                        {
                          label: "Avg Runtime",
                          value: `${executionResult.executionTimeMs || 12} ms`,
                          color: "text-emerald-600",
                        },
                        {
                          label: "Peak Memory",
                          value: `${executionResult.memoryKB || 13400} KB`,
                          color: "text-purple-600",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center"
                        >
                          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                            {item.label}
                          </p>
                          <p
                            className={`text-lg font-mono font-extrabold mt-1.5 ${item.color}`}
                          >
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: COMPREHENSIVE PERFORMANCE REPORT */}
        {stage === "report" && completedReport && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero score card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] pointer-events-none" />

              <div className="space-y-3 text-center md:text-left">
                <span className="bg-cyan-55 bg-cyan-50 border border-cyan-100 text-cyan-650 text-cyan-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Assessment Report - {completedReport.companyName}
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-905 text-slate-900">
                  {completedReport.problemTitle}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold">
                  Language:{" "}
                  <strong className="text-slate-800 uppercase">
                    {completedReport.language}
                  </strong>{" "}
                  <strong className="text-amber-600">
                    {completedReport.difficulty}
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 px-8 py-5 rounded-2xl shrink-0 shadow-inner">
                <div className="text-center">
                  <p className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">
                    Overall Score
                  </p>
                  <p className="text-3xl font-extrabold text-cyan-650 text-cyan-600 mt-1">
                    {completedReport.score || 100}{" "}
                    <span className="text-base text-slate-400 font-normal">
                      / 100
                    </span>
                  </p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-455 text-slate-450 uppercase tracking-wider font-bold">
                    Clean Code
                  </p>
                  <p className="text-3xl font-extrabold text-cyan-600 mt-1">
                    {completedReport.cleanCodeScore || 90}%
                  </p>
                </div>
              </div>
            </div>

            {/* Complexity metric cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Estimated Time Complexity",
                  value: completedReport.timeComplexity || "O(N log N)",
                  color: "text-amber-655 text-amber-600",
                  desc: "Optimal runtime scaling boundaries.",
                },
                {
                  label: "Estimated Space Complexity",
                  value: completedReport.spaceComplexity || "O(N)",
                  color: "text-cyan-600",
                  desc: "Auxiliary memory allocation constraints.",
                },
                {
                  label: "Execution Runtime",
                  value: `${completedReport.executionTimeMs || 14.2} ms`,
                  color: "text-emerald-600",
                  desc: "Evaluated across all public & hidden inputs.",
                },
                {
                  label: "Peak Memory Usage",
                  value: `${completedReport.memoryKB || 13800} KB`,
                  color: "text-purple-605 text-purple-600",
                  desc: "Platform system bounds for code stacks.",
                },
              ].map((metric, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                >
                  <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">
                    {metric.label}
                  </p>
                  <p
                    className={`text-xl font-mono font-extrabold ${metric.color}`}
                  >
                    {metric.value}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-semibold">
                    {metric.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* AI Code reviews */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-display font-bold text-slate-800 mb-5 flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <FaLightbulb className="text-amber-500 text-xl" />
                <span>AI Principal Engineer Code Review</span>
              </h3>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-bold">
                {completedReport.feedback ||
                  "Your code successfully passed all edge cases and boundary conditions with optimal time complexity."}
              </div>
            </div>

            {/* Detailed test cases breakdown */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-display font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
                Detailed Test Case Evaluation Report
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {completedReport.testCaseResults?.map((tc, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-xl border-2 ${
                      tc.passed
                        ? "border-emerald-200 bg-emerald-50/[0.05]"
                        : "border-red-200 bg-red-50/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Test Case #{tc.testCaseId || idx + 1}
                      </span>
                      {tc.passed ? (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <FaCheckCircle /> Passed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-700 flex items-center gap-1 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                          <FaTimesCircle /> Failed
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-[11px] font-mono text-slate-600 font-semibold">
                      <div>
                        <strong className="text-slate-450">Input:</strong>{" "}
                        {tc.input}
                      </div>
                      <div>
                        <strong className="text-slate-450 font-semibold">
                          Expected:
                        </strong>{" "}
                        <span className="text-emerald-600 font-bold">
                          {tc.expectedOutput}
                        </span>
                      </div>
                      <div>
                        <strong className="text-slate-455 text-slate-450 font-semibold">
                          Actual:
                        </strong>{" "}
                        <span
                          className={
                            tc.passed
                              ? "text-emerald-600 font-bold"
                              : "text-red-600 font-bold"
                          }
                        >
                          {tc.actualOutput}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-slate-100 pt-6">
              <button
                onClick={() => setStage("selection")}
                className="px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow transition cursor-pointer text-sm shadow-cyan-600/10"
              >
                Solve Another Challenge
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition border border-slate-200 cursor-pointer text-sm shadow-sm"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 4: HISTORY */}
        {stage === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800 flex items-center gap-3">
                <FaHistory className="text-cyan-650 text-cyan-600" />
                <span>Past Company Coding Assessments</span>
              </h2>
              <button
                onClick={() => setStage("selection")}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-550 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-cyan-600/10"
              >
                + New Coding Test
              </button>
            </div>

            {deleteError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{deleteError}</div>
            )}
            {isLoadingHistory ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <FaSpinner className="animate-spin text-2xl text-cyan-600" />
                <p className="text-slate-500 text-sm font-semibold">
                  Loading your coding submissions history...
                </p>
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-14 h-14 bg-slate-105 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-cyan-600 text-xl font-bold shadow-inner">
                  <FaCode />
                </div>
                <h3 className="text-lg font-bold text-slate-750">
                  No coding challenges attempted yet!
                </h3>
                <p className="text-slate-550 text-xs sm:text-sm max-w-sm mx-auto font-semibold">
                  Take realistic coding rounds for Amazon, Google, Microsoft,
                  and TCS right inside our online Monaco IDE.
                </p>
                <button
                  onClick={() => setStage("selection")}
                  className="px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-xl shadow hover:bg-cyan-700 transition cursor-pointer text-xs shadow-cyan-600/10"
                >
                  Start Your First Coding Assessment
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyList.map((test) => (
                  <div
                    key={test._id}
                    className="rounded-2xl border border-slate-200 p-5 bg-slate-50 hover:bg-white hover:border-cyan-500/35 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold bg-cyan-50 border border-cyan-100 text-cyan-605 text-cyan-600 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          {test.companyName}
                        </span>
                        <span className="text-[11px] text-slate-455 font-semibold">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-800 text-lg mb-1.5 truncate">
                        {test.problem?.title || "Coding Challenge"}
                      </h3>

                      <p className="text-xs text-slate-500 font-semibold mb-4 flex items-center gap-3">
                        <span>
                          Lang:{" "}
                          <strong className="text-slate-700 uppercase">
                            {test.language}
                          </strong>
                        </span>
                        <span>
                          Difficulty:{" "}
                          <strong className="text-amber-600">
                            {test.difficulty}
                          </strong>
                        </span>
                      </p>
                    </div>

                    <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                          Final Score
                        </p>
                        <p className="font-extrabold text-cyan-600 text-base mt-0.5">
                          {test.submission?.score || 0} / 100{" "}
                          <span className="text-[10px] text-slate-455 font-bold ml-1 uppercase">
                            ({test.submission?.status || "Grading"})
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCompletedReport({
                              ...test.submission,
                              problemTitle: test.problem?.title,
                              companyName: test.companyName,
                              difficulty: test.difficulty,
                              language: test.language,
                            });
                            setStage("report");
                          }}
                          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                        >
                          View Report
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${test.companyName} coding test`}
                          title="Delete coding test"
                          disabled={deletingId === test._id}
                          onClick={() => deleteCodingTest(test._id)}
                          className="rounded-xl border border-red-100 bg-white p-2.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default CompanyCodingTests;
