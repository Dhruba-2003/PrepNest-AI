import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import Navbar from "../components/Navbar";
import { useToast } from "../components/Toast.jsx";
import Footer from "../components/Footer";
import {
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaArrowRight,
  FaClock,
  FaChartPie,
  FaHistory,
  FaSpinner,
  FaExclamationTriangle,
  FaBrain,
  FaCalculator,
  FaBook,
  FaCode,
  FaBolt,
  FaTrash,
} from "react-icons/fa";

const COMPANIES = [
  {
    name: "TCS NQT",
    color: "from-blue-600 to-indigo-700",
    desc: "National Qualifier Test style",
  },
  {
    name: "Infosys",
    color: "from-cyan-600 to-blue-800",
    desc: "Mathematical & Logical Focus",
  },
  {
    name: "Wipro",
    color: "from-purple-600 to-indigo-800",
    desc: "Aptitude & Coding Assessment",
  },
  {
    name: "Accenture",
    color: "from-fuchsia-600 to-pink-700",
    desc: "Cognitive & Technical Assessment",
  },
  {
    name: "Cognizant",
    color: "from-emerald-600 to-teal-800",
    desc: "GenC & GenC Next Patterns",
  },
  {
    name: "Amazon",
    color: "from-amber-600 to-orange-700",
    desc: "DSA, System & Leadership",
  },
  {
    name: "Google",
    color: "from-red-600 to-rose-700",
    desc: "High-Bar Problem Solving & Tech",
  },
  {
    name: "Microsoft",
    color: "from-blue-500 to-cyan-600",
    desc: "Core CS & Analytical Ability",
  },
  {
    name: "Meta",
    color: "from-blue-700 to-indigo-900",
    desc: "Meta Coding Speed & System Logic",
  },
  {
    name: "Flipkart",
    color: "from-yellow-600 to-amber-700",
    desc: "Machine Coding & E-commerce Tech",
  },
  {
    name: "Zomato",
    color: "from-red-500 to-pink-600",
    desc: "Fast-Paced Logical & Tech",
  },
  {
    name: "Custom",
    color: "from-gray-700 to-gray-900",
    desc: "Enter Any Target Company",
  },
];

const CATEGORIES = [
  {
    id: "Quantitative Aptitude",
    icon: <FaCalculator className="text-xl text-cyan-650 text-cyan-600" />,
    title: "Quantitative Aptitude",
    desc: "Speed arithmetic, number systems, percentages, time & work, probability, and algebra.",
  },
  {
    id: "Verbal Ability",
    icon: <FaBook className="text-xl text-cyan-650 text-cyan-600" />,
    title: "Verbal Ability",
    desc: "Reading comprehension, vocabulary, sentence correction, and business English.",
  },
  {
    id: "Logical Reasoning",
    icon: <FaBrain className="text-xl text-cyan-650 text-cyan-600" />,
    title: "Logical Reasoning",
    desc: "Puzzles, syllogisms, blood relations, seating arrangements, and coding-decoding.",
  },
  {
    id: "Company-Specific Technical",
    icon: <FaCode className="text-xl text-cyan-650 text-cyan-600" />,
    title: "Company-Specific Technical",
    desc: "Core domain concepts, coding logic, data structures, databases, and architecture.",
  },
];

function CompanyMockTests() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { userData } = useSelector((state) => state.user);

  // Stage: 'selection', 'exam', 'report', 'history'
  const [stage, setStage] = useState("selection");

  // Setup state
  const [selectedCompany, setSelectedCompany] = useState("TCS NQT");
  const [customCompany, setCustomCompany] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    "Quantitative Aptitude",
  );
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("Standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Active Exam state
  const [mockTestId, setMockTestId] = useState(null);
  const [testSummary, setTestSummary] = useState("");
  const [questions, setQuestions] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Report state
  const [completedTest, setCompletedTest] = useState(null);

  // History state
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  // Timer effect during 'exam' stage
  useEffect(() => {
    let timer;
    if (stage === "exam" && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, timeLeftSeconds]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGenerateTest = async () => {
    if (!userData) {
      toast.warning("Please login first to generate AI Mock Tests.");
      navigate("/auth");
      return;
    }

    if (userData.credits < 15) {
      toast.warning(
        "Not enough credits! You need at least 15 credits to generate a custom company mock test.",
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
        ServerUrl + "/api/mock-test/generate",
        {
          companyName: companyToUse,
          testCategory: selectedCategory,
          questionCount: questionCount,
          difficulty: difficulty,
        },
        { withCredentials: true },
      );

      if (response.data && response.data.success) {
        if (userData) {
          dispatch(
            setUserData({ ...userData, credits: response.data.userCredits }),
          );
        }

        setMockTestId(response.data.mockTestId);
        setTestSummary(response.data.testSummary);
        setQuestions(response.data.questions);
        setDurationMinutes(response.data.durationMinutes);
        setTimeLeftSeconds(response.data.durationMinutes * 60);
        setCurrentQuestionIdx(0);
        setUserAnswers({});
        setStage("exam");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error.response?.data?.message ||
          "Failed to generate AI test. Please check your network or try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitTest = async () => {
    if (isSubmitting || !mockTestId) return;
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        ServerUrl + "/api/mock-test/submit",
        {
          mockTestId: mockTestId,
          userAnswers: userAnswers,
        },
        { withCredentials: true },
      );

      if (response.data && response.data.success) {
        setCompletedTest(response.data.mockTest);
        setStage("report");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    setStage("history");
    try {
      const res = await axios.get(ServerUrl + "/api/mock-test/history", {
        withCredentials: true,
      });
      if (res.data && res.data.success) {
        setHistoryList(res.data.mockTests);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const deleteMockTest = (testId) => {
    toast.confirm(
      "Delete this mock test permanently? This action cannot be undone.",
      async () => {
        setDeletingId(testId);
        setDeleteError("");
        try {
          await axios.delete(ServerUrl + "/api/mock-test/" + testId, { withCredentials: true });
          setHistoryList((tests) => tests.filter((test) => test._id !== testId));
          toast.success("Mock test deleted successfully!");
        } catch (error) {
          setDeleteError(error.response?.data?.message || "Failed to delete mock test. Please try again.");
          toast.error(error.response?.data?.message || "Failed to delete mock test. Please try again.");
        } finally {
          setDeletingId(null);
        }
      }
    );
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Buttons */}
        <div className="mb-6 flex items-center gap-4 text-xs font-bold text-slate-500">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:text-slate-900 transition cursor-pointer"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => navigate("/")}
            className="hover:text-slate-900 transition cursor-pointer"
          >
            Back to Home
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200">
          <div>
            <span className="bg-cyan-50 border border-cyan-100 text-cyan-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              AI Recruitment Prep
            </span>
            <h1 className="text-3xl font-display font-extrabold text-slate-900 mt-2 flex items-center gap-3">
              Mock Tests
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
              New Mock Test
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
              <span>Past Results</span>
            </button>
          </div>
        </div>

        {/* STAGE 1: SELECTION */}
        {stage === "selection" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 space-y-10 shadow-sm"
          >
            {/* Step 1: Select Company */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-1">
                <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-3">
                  <span className="w-7 h-7 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center text-xs font-bold border border-cyan-100">
                    1
                  </span>
                  Select Target Company
                </h2>

                {selectedCompany === "Custom" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full sm:max-w-xs flex flex-col gap-1.5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 shrink-0">
                      Enter Target Company Name:
                    </span>
                    <input
                      type="text"
                      value={customCompany}
                      onChange={(e) => setCustomCompany(e.target.value)}
                      placeholder="e.g. Netflix, Apple, Bloomberg, Uber, Oracle..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition text-xs font-semibold placeholder-slate-400 shadow-sm"
                    />
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {COMPANIES.map((company) => {
                  const isSelected = selectedCompany === company.name;
                  return (
                    <div
                      key={company.name}
                      onClick={() => setSelectedCompany(company.name)}
                      className={`cursor-pointer rounded-2xl p-4.5 border-2 transition-all duration-205 flex flex-col justify-between h-28 ${
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
                          <FaCheckCircle className="text-cyan-600 text-base" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold line-clamp-2 leading-relaxed">
                        {company.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-200/50" />

            {/* Step 2: Select Test Category */}
            <div>
              <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-3 mb-5">
                <span className="w-7 h-7 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center text-xs font-bold border border-cyan-100">
                  2
                </span>
                Select Exam Category
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex items-start gap-4 ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-50/50 shadow-sm"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-inner">
                        {cat.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                            {cat.title}
                          </h3>
                          {isSelected && (
                            <FaCheckCircle className="text-cyan-600 text-sm" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
                          {cat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-200/50" />

            {/* Step 3: Difficulty & Question Count */}
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-3 mb-4">
                  <span className="w-7 h-7 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center text-xs font-bold border border-cyan-100">
                    3
                  </span>
                  Question Count
                </h2>
                <div className="flex gap-4">
                  {[10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer ${
                        questionCount === cnt
                          ? "border-cyan-500 bg-cyan-600 text-white shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cnt} Questions ({Math.round(cnt * 1.5)} Mins)
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-3 mb-4">
                  <span className="w-7 h-7 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center text-xs font-bold border border-cyan-100">
                    4
                  </span>
                  Exam Difficulty
                </h2>
                <div className="flex gap-4">
                  {["Standard", "Tough"].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer ${
                        difficulty === diff
                          ? "border-cyan-500 bg-cyan-600 text-white shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {diff} Level
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold">
                <FaExclamationTriangle className="text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center">
                  <FaBolt size={14} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Cost: 15 Credits
                  </p>
                  <p className="text-xs text-slate-500 font-semibold">
                    Your balance:{" "}
                    <span className="font-bold text-cyan-600">
                      {userData?.credits || 0} credits
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateTest}
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm shadow-cyan-600/10"
              >
                {isGenerating ? (
                  <>
                    <FaSpinner className="animate-spin text-base" />
                    <span>Analyzing Exam Pattern...</span>
                  </>
                ) : (
                  <>
                    <span>Start Mock Test</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 2: LIVE EXAM INTERFACE */}
        {stage === "exam" && questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-4 gap-6"
          >
            {/* Left Panel: Question Workspace */}
            <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[520px] shadow-sm">
              <div>
                {/* Exam Title & Time */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5 mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
                      {selectedCompany === "Custom"
                        ? customCompany
                        : selectedCompany}{" "}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800 mt-3">
                      Question {currentQuestionIdx + 1} of {questions.length}
                    </h2>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-650 text-red-650 text-red-600 px-4 py-2 rounded-xl font-mono font-bold text-lg shadow-sm">
                      <FaClock className="text-red-500 animate-pulse" />
                      <span>{formatTime(timeLeftSeconds)}</span>
                    </div>

                    <button
                      onClick={() => {
                        toast.confirm(
                          "Are you sure you want to end test and submit your answers right now?",
                          handleSubmitTest,
                          null,
                          "Submit Test",
                          "info"
                        );
                      }}
                      disabled={isSubmitting}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer transition shadow-sm"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Test"}
                    </button>
                  </div>
                </div>

                {/* Question tags */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-3 py-1 rounded-md">
                    Topic: {questions[currentQuestionIdx]?.topic || "General"}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-3 py-1 rounded-md">
                    Difficulty:{" "}
                    {questions[currentQuestionIdx]?.difficulty || "Standard"}
                  </span>
                </div>

                {/* Question text */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed mb-8">
                  {questions[currentQuestionIdx]?.questionText}
                </h3>

                {/* Options List */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {questions[currentQuestionIdx]?.options.map((option, idx) => {
                    const qId = questions[currentQuestionIdx].id;
                    const isSelected = userAnswers[qId] === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setUserAnswers((prev) => ({ ...prev, [qId]: idx }));
                        }}
                        className={`cursor-pointer rounded-2xl p-5 border-2 transition flex items-start gap-3 ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-50/50 shadow-sm font-semibold text-cyan-700"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs ${
                            isSelected
                              ? "bg-cyan-600 border-cyan-600 text-white"
                              : "bg-white border-slate-200 text-slate-400"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-sm leading-snug pt-0.5 font-medium">
                          {option}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer controls */}
              <div className="flex items-center justify-between border-t border-slate-200/80 pt-5">
                <button
                  onClick={() =>
                    setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIdx === 0}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs sm:text-sm hover:bg-slate-55 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <FaArrowLeft className="text-[10px]" /> <span>Previous</span>
                </button>

                <button
                  onClick={() => {
                    const qId = questions[currentQuestionIdx].id;
                    const nextAnswers = { ...userAnswers };
                    delete nextAnswers[qId];
                    setUserAnswers(nextAnswers);
                  }}
                  className="text-xs text-slate-450 hover:text-red-650 hover:text-red-600 underline transition cursor-pointer font-bold"
                >
                  Clear Selection
                </button>

                {currentQuestionIdx < questions.length - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentQuestionIdx((prev) =>
                        Math.min(questions.length - 1, prev + 1),
                      )
                    }
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-sm cursor-pointer shadow-cyan-600/10"
                  >
                    <span>Next</span> <FaArrowRight className="text-[10px]" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer shadow-cyan-600/10"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Exam"}
                  </button>
                )}
              </div>
            </div>

            {/* Right Sidebar: Palette */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between self-start shadow-sm">
              <div>
                <h3 className="font-bold text-slate-450 mb-5 text-xs uppercase tracking-wider">
                  Question Palette
                </h3>
                <div className="grid grid-cols-5 gap-2.5">
                  {questions.map((q, idx) => {
                    const isAnswered = userAnswers[q.id] !== undefined;
                    const isCurrent = currentQuestionIdx === idx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition relative cursor-pointer ${
                          isCurrent
                            ? "ring-2 ring-cyan-500 ring-offset-2 ring-offset-white " +
                              (isAnswered
                                ? "bg-cyan-600 text-white"
                                : "bg-slate-300 text-slate-800")
                            : isAnswered
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 space-y-3.5 text-xs text-slate-500 border-t border-slate-200 pt-5">
                  <div className="flex items-center gap-2.5 font-semibold">
                    <span className="w-3 h-3 rounded-md bg-cyan-600 inline-block"></span>
                    <span>Answered ({Object.keys(userAnswers).length})</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-semibold">
                    <span className="w-3 h-3 rounded-md bg-slate-50 border border-slate-200 inline-block"></span>
                    <span>
                      Not Answered (
                      {questions.length - Object.keys(userAnswers).length})
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-200">
                <button
                  onClick={() => {
                    toast.confirm(
                      "Are you sure you want to end test and submit right now?",
                      handleSubmitTest,
                      null,
                      "Submit Test",
                      "info"
                    );
                  }}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-650 text-red-600 border border-red-200 font-bold rounded-xl text-xs sm:text-sm transition shadow cursor-pointer"
                >
                  End & Submit Test
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: REPORT & EXPLANATIONS */}
        {stage === "report" && completedTest && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Banner overview box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] pointer-events-none" />

              <div className="space-y-3 text-center md:text-left">
                <span className="bg-cyan-50 border border-cyan-100 text-cyan-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Test Report - {completedTest.companyName}
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800">
                  {completedTest.testCategory}
                </h2>
                <p className="text-slate-500 max-w-xl text-xs sm:text-sm leading-relaxed font-semibold">
                  {completedTest.testSummary}
                </p>
              </div>

              <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 px-8 py-5 rounded-2xl shrink-0 shadow-inner">
                <div className="text-center">
                  <p className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">
                    Your Score
                  </p>
                  <p className="text-3xl font-extrabold text-cyan-600 mt-1">
                    {completedTest.score}{" "}
                    <span className="text-base text-slate-400 font-normal">
                      / {completedTest.totalQuestions}
                    </span>
                  </p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">
                    Accuracy
                  </p>
                  <p className="text-3xl font-extrabold text-slate-700 mt-1">
                    {completedTest.accuracy}%
                  </p>
                </div>
              </div>
            </div>

            {/* Questions Review list */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
              <h3 className="text-lg font-display font-bold text-slate-800 mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
                <FaChartPie className="text-cyan-600" />
                <span>Question-by-Question Diagnostics</span>
              </h3>

              <div className="space-y-6">
                {completedTest.questions.map((q, idx) => {
                  const userChoiceIdx = completedTest.userAnswers?.[q.id];
                  const isAttempted =
                    userChoiceIdx !== undefined && userChoiceIdx !== null;
                  const isCorrect =
                    isAttempted &&
                    Number(userChoiceIdx) === Number(q.correctOptionIndex);

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border-2 p-5 sm:p-6 transition ${
                        isCorrect
                          ? "border-emerald-200 bg-emerald-50/[0.1]"
                          : isAttempted
                            ? "border-red-200 bg-red-50/[0.1]"
                            : "border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-white border border-slate-250 text-slate-700 font-bold flex items-center justify-center text-xs">
                            Q{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold bg-white text-slate-500 border border-slate-200 px-3 py-1 rounded-md shadow-sm">
                            {q.topic}
                          </span>
                          <span className="text-[10px] font-bold bg-white text-slate-500 border border-slate-200 px-3 py-1 rounded-md shadow-sm">
                            {q.difficulty}
                          </span>
                        </div>

                        <div>
                          {isCorrect ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                              <FaCheckCircle />
                              <span>Correct</span>
                            </span>
                          ) : isAttempted ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full">
                              <FaTimesCircle />
                              <span>Incorrect</span>
                            </span>
                          ) : (
                            <span className="text-xs font-bold bg-white text-slate-400 border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                              Not Attempted
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-5 leading-relaxed">
                        {q.questionText}
                      </h4>

                      <div className="grid sm:grid-cols-2 gap-3 mb-6">
                        {q.options.map((opt, optIdx) => {
                          const isTheCorrectOpt =
                            Number(optIdx) === Number(q.correctOptionIndex);
                          const isUserOpt =
                            isAttempted &&
                            Number(optIdx) === Number(userChoiceIdx);

                          return (
                            <div
                              key={optIdx}
                              className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between font-semibold ${
                                isTheCorrectOpt
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                  : isUserOpt
                                    ? "bg-red-600 text-white border-red-600 shadow-sm"
                                    : "bg-white border-slate-200 text-slate-600"
                              }`}
                            >
                              <span>{opt}</span>
                              {isTheCorrectOpt && (
                                <span className="text-[9px] font-bold uppercase tracking-wider ml-2 bg-emerald-700/20 px-2 py-0.5 rounded">
                                </span>
                              )}
                              {!isTheCorrectOpt && isUserOpt && (
                                <span className="text-[9px] font-bold uppercase tracking-wider ml-2 bg-red-700/20 px-2 py-0.5 rounded">
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* AI Explanations */}
                      <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <FaBrain className="text-cyan-600" />
                          <span>AI Step-by-Step Explanation</span>
                        </p>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-4 border-t border-slate-100 pt-8">
                <button
                  onClick={() => setStage("selection")}
                  className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow transition cursor-pointer text-sm shadow-cyan-600/10"
                >
                  Take Another Mock Test
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition cursor-pointer text-sm shadow-sm"
                >
                  Back to Home
                </button>
              </div>
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
                <FaHistory className="text-cyan-600" />
                <span>Past Mock Test Reports</span>
              </h2>

              <button
                onClick={() => setStage("selection")}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-cyan-600/10"
              >
                + New Test
              </button>
            </div>

            {deleteError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{deleteError}</div>
            )}
            {isLoadingHistory ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <FaSpinner className="animate-spin text-2xl text-cyan-600" />
                <p className="text-slate-500 text-sm font-semibold">
                  Loading test history...
                </p>
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-xl">
                </div>
                <h3 className="text-lg font-bold text-slate-750">
                  No mock tests taken yet!
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto font-semibold">
                  Start preparing for TCS, Amazon, Google or any target company
                  with AI-powered mock tests.
                </p>
                <button
                  onClick={() => setStage("selection")}
                  className="px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-xl shadow hover:opacity-90 transition cursor-pointer text-xs shadow-cyan-600/10"
                >
                  Take Your First Mock Test
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
                        <span className="text-[10px] font-bold bg-cyan-50 border border-cyan-100 text-cyan-600 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          {test.companyName}
                        </span>
                        <span className="text-[11px] text-slate-450 font-semibold">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-800 text-lg mb-1">
                        {test.testCategory}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-semibold">
                        {test.testSummary}
                      </p>
                    </div>

                    <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                          Score
                        </p>
                        <p className="font-extrabold text-slate-800 text-base mt-0.5">
                          {test.score} / {test.totalQuestions}{" "}
                          <span className="text-[11px] font-bold text-cyan-600 ml-1">
                            ({test.accuracy}%)
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCompletedTest(test);
                            setStage("report");
                          }}
                          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                        >
                          View Review
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${test.companyName} mock test`}
                          title="Delete mock test"
                          disabled={deletingId === test._id}
                          onClick={() => deleteMockTest(test._id)}
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

export default CompanyMockTests;
