import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import Step1SetUp from "../components/Step1SetUp";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";
import { FaArrowLeft, FaHistory, FaSpinner, FaTrash, FaPlus } from "react-icons/fa";
import { motion } from "motion/react";
import { useToast } from "../components/Toast.jsx";

function InterviewPage({ initialTab = "setup" }) {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [interviews, setInterviews] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const toast = useToast();

  const navigate = useNavigate();

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const result = await axios.get(
        ServerUrl + "/api/interview/get-interview",
        { withCredentials: true },
      );
      setInterviews(result.data);
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const deleteInterview = (event, interviewId) => {
    event.stopPropagation();

    toast.confirm(
      "Delete this interview permanently? This action cannot be undone.",
      async () => {
        setDeletingId(interviewId);
        setDeleteError("");

        try {
          await axios.delete(ServerUrl + "/api/interview/" + interviewId, {
            withCredentials: true,
          });
          setInterviews((currentInterviews) =>
            currentInterviews.filter((interview) => interview._id !== interviewId),
          );
          toast.success("Interview deleted successfully!");
        } catch (error) {
          console.error("Failed to delete interview:", error);
          const errMsg =
            error.response?.data?.message ||
            "Failed to delete interview. Please try again.";
          setDeleteError(errMsg);
          toast.error(errMsg);
        } finally {
          setDeletingId(null);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col font-sans">
      {(step === 1 || step === 2) && <Navbar />}

      <div
        className={
          (step === 1 || step === 2)
            ? "flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10"
            : "min-h-screen bg-slate-50"
        }
      >
        {step === 1 && (
          <>
            {/* Navigation / Header Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200">
              <div>
                <div className="mb-4 flex items-center gap-3 text-xs font-bold text-slate-500">
                  <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 hover:text-cyan-600 transition cursor-pointer" aria-label="Back"><FaArrowLeft size={12} /> Back</button>
                  <span className="text-slate-300">|</span>
                  <button onClick={() => navigate("/")} className="hover:text-cyan-600 transition cursor-pointer">Back to Home</button>
                </div>
                <span className="bg-cyan-50 border border-cyan-100 text-cyan-650 text-cyan-650 text-cyan-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  AI Smart Mock Interviews
                </span>
                <h1 className="text-3xl font-display font-extrabold text-slate-900 mt-2">
                  Start Your AI Interview
                </h1>
                <p className="text-slate-500 text-sm mt-1 max-w-xl font-semibold">
                  Practice real-world interview scenarios powered by AI. Improve
                  communication, technical skills, and confidence.
                </p>
              </div>

              <div className="flex items-center gap-3 self-stretch md:self-auto shrink-0">
                <button
                  onClick={() => setActiveTab("setup")}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                    activeTab === "setup"
                      ? "bg-cyan-600 text-white shadow-[0_4px_15px_rgba(6,182,212,0.25)]"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
                  }`}
                >
                  New Interview
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
                    activeTab === "history"
                      ? "bg-cyan-600 text-white shadow-[0_4px_15px_rgba(6,182,212,0.25)]"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
                  }`}
                >
                  <FaHistory />
                  <span>Past Results</span>
                </button>
              </div>
            </div>

            {activeTab === "setup" && (
              <Step1SetUp
                onStart={(data) => {
                  setInterviewData(data);
                  setStep(2);
                }}
              />
            )}

            {activeTab === "history" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800 flex items-center gap-3">
                    <FaHistory className="text-cyan-600" />
                    <span>Past Interview Reports</span>
                  </h2>
                  <button
                    onClick={() => setActiveTab("setup")}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer shadow-cyan-600/10"
                  >
                    <FaPlus size={10} />
                    <span>New Interview</span>
                  </button>
                </div>

                {deleteError && (
                  <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
                    {deleteError}
                  </div>
                )}

                {isLoadingHistory ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                    <FaSpinner className="animate-spin text-2xl text-cyan-600" />
                    <p className="text-slate-500 text-sm font-semibold">
                      Loading your interview history...
                    </p>
                  </div>
                ) : interviews.length === 0 ? (
                  <div className="py-20 text-center space-y-5">
                    <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-xl">
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">
                      No interviews taken yet!
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto font-semibold">
                      Start practicing your first role-based mock interview with
                      AI-powered assessment.
                    </p>
                    <button
                      onClick={() => setActiveTab("setup")}
                      className="px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-xl shadow hover:opacity-90 transition cursor-pointer text-sm shadow-cyan-600/10"
                    >
                      Start First Interview
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {interviews.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => navigate(`/report/${item._id}`)}
                        className="rounded-2xl border border-slate-200/85 p-5 bg-slate-50 hover:bg-white hover:border-cyan-500/35 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold bg-cyan-50 border border-cyan-100 text-cyan-600 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                              {item.mode}
                            </span>
                            <span className="text-[11px] text-slate-450 font-semibold">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-cyan-600 transition-colors">
                            {item.role}
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold mb-4">
                            Experience: {item.experience}
                          </p>
                        </div>

                        <div className="border-t border-slate-200/80 pt-4 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                              Overall Score
                            </p>
                            <p className="font-extrabold text-cyan-600 text-lg mt-0.5">
                              {item.finalScore || 0}{" "}
                              <span className="text-slate-400 text-xs font-normal">
                                / 10
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/report/${item._id}`);
                              }}
                              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-250 transition cursor-pointer shadow-sm"
                            >
                              Report
                            </button>
                            <button
                              disabled={deletingId === item._id}
                              onClick={(e) => deleteInterview(e, item._id)}
                              className="p-2 text-slate-400 hover:text-red-650 hover:text-red-650 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 cursor-pointer"
                              title="Delete interview"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

        {step === 2 && (
          <Step2Interview
            interviewData={interviewData}
            onBack={() => {
              toast.confirm(
                "Are you sure you want to exit the current interview session? Your progress will be lost.",
                () => setStep(1),
                null,
                "Exit Session",
                "warning"
              );
            }}
            onBackHome={() => {
              toast.confirm(
                "Are you sure you want to exit the current interview session? Your progress will be lost.",
                () => navigate("/"),
                null,
                "Exit Session",
                "warning"
              );
            }}
            onFinish={(report) => {
              setInterviewData(report);
              setStep(3);
            }}
          />
        )}

        {step === 3 && <Step3Report report={interviewData} />}
      </div>
    </div>
  );
}

export default InterviewPage;
