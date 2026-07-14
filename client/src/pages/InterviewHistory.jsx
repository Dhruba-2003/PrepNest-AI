import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import { FaArrowLeft, FaHistory, FaHome, FaSpinner, FaTrash } from "react-icons/fa";
import { useToast } from "../components/Toast.jsx";

function InterviewHistory() {
  const toast = useToast();
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/interview/get-interview", { withCredentials: true });
        setInterviews(result.data);
      } catch (error) {
        setDeleteError(error.response?.data?.message || "Failed to load interview history.");
      } finally {
        setIsLoading(false);
      }
    };
    getMyInterviews();
  }, []);

  const deleteInterview = (event, interviewId) => {
    event.stopPropagation();
    toast.confirm(
      "Delete this interview permanently? This action cannot be undone.",
      async () => {
        setDeletingId(interviewId);
        setDeleteError("");
        try {
          await axios.delete(ServerUrl + "/api/interview/" + interviewId, { withCredentials: true });
          setInterviews((current) => current.filter((item) => item._id !== interviewId));
          toast.success("Interview deleted successfully!");
        } catch (error) {
          setDeleteError(error.response?.data?.message || "Failed to delete interview. Please try again.");
          toast.error(error.response?.data?.message || "Failed to delete interview. Please try again.");
        } finally {
          setDeletingId(null);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => navigate(-1)} aria-label="Back" title="Back" className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition hover:border-cyan-200 hover:text-cyan-600">
                <FaArrowLeft />
              </button>
              <button onClick={() => navigate("/")} aria-label="Back to home" title="Back to Home" className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition hover:border-cyan-200 hover:text-cyan-600">
                <FaHome />
              </button>
            </div>
            <div><span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-600"><FaHistory /> Performance archive</span><h1 className="mt-3 font-display text-3xl font-extrabold text-slate-900">Interview History</h1><p className="mt-1 text-sm font-semibold text-slate-500">Review your past AI interview performance and feedback.</p></div>
          </div>
          <button onClick={() => navigate("/interview")} className="rounded-xl bg-cyan-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-cyan-600/15 transition hover:bg-cyan-500">Start Mock Interview</button>
        </div>
        {deleteError && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{deleteError}</div>}
        {isLoading ? <div className="py-24 text-center"><FaSpinner className="mx-auto animate-spin text-2xl text-cyan-600" /><p className="mt-3 text-sm font-semibold text-slate-500">Loading your interview history...</p></div> : interviews.length === 0 ? <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm"><FaHistory className="mx-auto text-3xl text-cyan-600" /><h2 className="mt-4 text-xl font-bold text-slate-800">No interviews yet</h2><p className="mt-2 text-sm font-semibold text-slate-500">Your completed AI interview reports will appear here.</p></div> : <div className="grid gap-4">{interviews.map((item) => <article key={item._id} onClick={() => navigate(`/report/${item._id}`)} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold text-slate-800">{item.role}</h2><p className="mt-1 text-xs font-semibold text-slate-500">{item.experience} <span className="mx-1.5 text-slate-300">•</span> {item.mode}</p><p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p></div><div className="flex items-center gap-4"><div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-2 text-center"><p className="text-lg font-extrabold text-cyan-600">{item.finalScore || 0}<span className="text-xs text-cyan-500">/10</span></p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall score</p></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${item.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.status}</span><button type="button" aria-label={`Delete ${item.role} interview`} title="Delete interview" disabled={deletingId === item._id} onClick={(event) => deleteInterview(event, item._id)} className="rounded-xl border border-red-100 p-3 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"><FaTrash /></button></div></div></article>)}</div>}
      </main>
    </div>
  );
}
export default InterviewHistory;