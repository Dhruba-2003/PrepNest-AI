import React from "react";
import { motion } from "motion/react";
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
} from "react-icons/fa";
import { useState } from "react";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";

function Step1SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);

    const formdata = new FormData();
    formdata.append("resume", resumeFile);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/resume",
        formdata,
        { withCredentials: true },
      );

      console.log(result.data);

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);

      setAnalyzing(false);
    } catch (error) {
      console.log(error);

      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/generate-questions",
        { role, experience, mode, resumeText, projects, skills },
        { withCredentials: true },
      );
      console.log(result.data);
      if (userData) {
        dispatch(
          setUserData({ ...userData, credits: result.data.creditsLeft }),
        );
      }
      setLoading(false);
      onStart(result.data);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex items-center justify-center py-4 text-slate-800"
    >
      <div className="w-full max-w-6xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        {/* Left Info Panel */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative bg-gradient-to-br from-slate-50 to-slate-100 p-8 md:p-12 flex flex-col justify-center border-r border-slate-150"
        >
          {/* Subtle glow background */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-cyan-500/5 blur-[50px] pointer-events-none" />

          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
            Start Your{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
              AI Interview
            </span>
          </h2>

          <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-md font-semibold">
            Practice real interview scenarios powered by AI. Improve
            communication, technical skills, and confidence.
          </p>

          <div className="space-y-4 max-w-sm">
            {[
              {
                icon: <FaUserTie className="text-cyan-600 text-lg" />,
                text: "Choose Role & Experience",
              },
              {
                icon: <FaMicrophoneAlt className="text-cyan-600 text-lg" />,
                text: "Smart Voice Interview",
              },
              {
                icon: <FaChartLine className="text-cyan-600 text-lg" />,
                text: "Performance Analytics",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-4 bg-white border border-slate-200/60 p-4 rounded-xl transition-all cursor-pointer shadow-sm hover:border-slate-300"
              >
                <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0 shadow-inner">
                  {item.icon}
                </div>
                <span className="text-slate-700 font-bold text-sm">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Form Panel */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-8 md:p-12 bg-white"
        >
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-8">
            Configure Interview
          </h2>

          <div className="space-y-5">
            {/* Role input */}
            <div className="relative">
              <FaUserTie className="absolute top-4 left-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter job role (e.g. React Developer)"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-slate-800 placeholder-slate-450 text-sm transition font-semibold"
                onChange={(e) => setRole(e.target.value)}
                value={role}
              />
            </div>

            {/* Experience input */}
            <div className="relative">
              <FaBriefcase className="absolute top-4 left-4 text-slate-400" />
              <input
                type="text"
                placeholder="Experience (e.g. 2 years)"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-slate-800 placeholder-slate-450 text-sm transition font-semibold"
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
              />
            </div>

            {/* Mode Select */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-slate-700 text-sm transition cursor-pointer font-bold"
            >
              <option value="Technical" className="bg-white text-slate-700">
                Technical Interview
              </option>
              <option value="HR" className="bg-white text-slate-700">
                HR Interview
              </option>
            </select>

            {/* File upload zone */}
            {!analysisDone && (
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => document.getElementById("resumeUpload").click()}
                className="border border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50/20 transition-all"
              >
                <FaFileUpload className="text-3xl mx-auto text-cyan-500 mb-3" />
                <input
                  type="file"
                  accept="application/pdf"
                  id="resumeUpload"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <p className="text-slate-700 font-bold text-xs sm:text-sm">
                  {resumeFile ? resumeFile.name : "Upload resume (Optional)"}
                </p>
                <p className="text-slate-450 text-[11px] mt-1 font-semibold">
                  PDF format (Max 5MB)
                </p>

                {resumeFile && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume();
                    }}
                    className="mt-4 bg-slate-900 border border-slate-800 text-white px-5 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Analysis details */}
            {analysisDone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs"
              >
                <h3 className="text-sm font-bold text-cyan-650">
                  Resume Analysis Complete
                </h3>

                {projects.length > 0 && (
                  <div>
                    <p className="font-bold text-slate-500 mb-1.5">
                      Parsed Projects:
                    </p>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 pl-1 leading-relaxed font-semibold">
                      {projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skills.length > 0 && (
                  <div>
                    <p className="font-bold text-slate-500 mb-1.5">
                      Extracted Skills:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="bg-cyan-50 border border-cyan-100 text-cyan-600 px-2.5 py-0.5 rounded-full font-bold text-[10px] sm:text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Start Button */}
            <motion.button
              onClick={handleStart}
              disabled={!role || !experience || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-600 to-cyan-500 text-white py-3 rounded-full text-base font-bold transition shadow-md cursor-pointer mt-4 shadow-cyan-600/10"
            >
              {loading ? "Starting session..." : "Start Interview"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Step1SetUp;
