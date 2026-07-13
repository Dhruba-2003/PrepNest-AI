import React from "react";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Step3Report({ report }) {
  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-sans">
        <p className="text-lg font-semibold">Loading Report...</p>
      </div>
    );
  }
  const navigate = useNavigate();
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0,
  }));

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 25;

    // ================= TITLE =================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(14, 165, 233); // Cyan
    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 5;

    // underline
    doc.setDrawColor(14, 165, 233);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    currentY += 15;

    // ================= FINAL SCORE BOX =================
    doc.setFillColor(236, 253, 245); // cyan-50
    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Final Score: ${finalScore}/10`, pageWidth / 2, currentY + 12, {
      align: "center",
    });

    currentY += 30;

    // ================= SKILLS BOX =================
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");

    doc.setFontSize(12);

    doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
    doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
    doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

    currentY += 45;

    // ================= ADVICE =================
    let advice = "";

    if (finalScore >= 8) {
      advice =
        "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
    } else if (finalScore >= 5) {
      advice =
        "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
    } else {
      advice =
        "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.";
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220);
    doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

    doc.setFont("helvetica", "bold");
    doc.text("Professional Advice", margin + 10, currentY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
    doc.text(splitAdvice, margin + 10, currentY + 20);

    currentY += 50;

    // ================= QUESTION TABLE =================
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question,
        `${q.score}/10`,
        q.feedback,
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 5,
        valign: "top",
      },
      headStyles: {
        fillColor: [14, 165, 233],
        textColor: 255,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" }, // index
        1: { cellWidth: 55 }, // question
        2: { cellWidth: 20, halign: "center" }, // score
        3: { cellWidth: "auto" }, // feedback
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    doc.save("AI_Interview_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-10 py-8 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/history")}
              className="mt-1 p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer shadow-sm"
            >
              <FaArrowLeft />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                Interview Analytics Dashboard
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-semibold">
                AI-powered performance insights
              </p>
            </div>
          </div>

          <button
            onClick={downloadPDF}
            className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-5 py-3 rounded-xl shadow-md font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-cyan-600/10"
          >
            <FaDownload size={14} />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left panel: ratings */}
          <div className="space-y-6">
            {/* Score Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 text-center shadow-sm"
            >
              <h3 className="text-slate-400 mb-6 text-xs font-bold uppercase tracking-wider">
                Overall Performance
              </h3>
              <div className="relative w-24 h-24 mx-auto">
                <CircularProgressbar
                  value={percentage}
                  text={`${score}/10`}
                  styles={buildStyles({
                    textSize: "18px",
                    pathColor: "#0ea5e9",
                    textColor: "#0ea5e9",
                    trailColor: "#1e293b",
                  })}
                />
              </div>

              <div className="mt-6 space-y-2">
                <p className="font-bold text-slate-800 text-sm sm:text-base">
                  {performanceText}
                </p>
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                  {shortTagline}
                </p>
              </div>
            </motion.div>

            {/* Skill bars */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm"
            >
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                Skill Evaluation
              </h3>

              <div className="space-y-5">
                {skills.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2 text-xs sm:text-sm font-semibold">
                      <span className="text-slate-600 font-bold">
                        {s.label}
                      </span>
                      <span className="font-bold text-cyan-600">
                        {s.value} / 10
                      </span>
                    </div>

                    <div className="bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                      <div
                        className="bg-gradient-to-r from-cyan-550 from-cyan-500 to-cyan-400 h-full rounded-full"
                        style={{ width: `${s.value * 10}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right panel: Charts & breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                Performance Trend
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={questionScoreData}
                    margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="scoreColor"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0ea5e9"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0ea5e9"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      stroke="#94a3b8"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        color: "#f8fafc",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#0ea5e9"
                      fillOpacity={1}
                      fill="url(#scoreColor)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Breakdown List */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                Question Breakdown
              </h3>

              <div className="space-y-5">
                {questionWiseScore.map((q, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 border border-slate-200/60 p-5 rounded-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">
                          Question {i + 1}
                        </p>
                        <p className="font-bold text-slate-800 text-sm leading-relaxed">
                          {q.question || "Question not available"}
                        </p>
                      </div>

                      <div className="bg-cyan-50 border border-cyan-100 text-cyan-600 px-3.5 py-1 rounded-full font-bold text-xs shrink-0 self-start shadow-sm">
                        Score: {q.score ?? 0}/10
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-4 rounded-lg">
                      <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-1.5">
                        AI Feedback
                      </p>
                      <p className="text-xs sm:text-sm text-slate-650 text-slate-600 leading-relaxed font-semibold">
                        {q.feedback && q.feedback.trim() !== ""
                          ? q.feedback
                          : "No feedback available for this question."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step3Report;
