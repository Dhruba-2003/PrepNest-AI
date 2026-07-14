import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText,
  BsFileEarmarkPdf,
  BsShieldCheck,
  BsGraphUp,
  BsArrowRight,
  BsLayoutTextSidebarReverse,
  BsBuilding,
  BsCode,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import AuthModel from "../components/AuthModel";
import Carousel from "../components/Carousel";
import Footer from "../components/Footer";

// Assets
import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const stepItems = [
    {
      icon: <BsFileEarmarkPdf size={24} className="text-cyan-500" />,
      step: "STEP 1",
      title: "ATS Resume Audit",
      desc: "Upload resume to scan for keyword gaps and target role compatibility.",
    },
    {
      icon: <BsCode size={24} className="text-cyan-500" />,
      step: "STEP 2",
      title: "Mock & Coding Practice",
      desc: "Solve aptitude exams and execute programming tests in real-time.",
    },
    {
      icon: <BsMic size={24} className="text-cyan-500" />,
      step: "STEP 3",
      title: "AI Voice Interview",
      desc: "Practice real-time adaptive interviews with role-specific voice questions.",
    },
    {
      icon: <BsBarChart size={24} className="text-cyan-500" />,
      step: "STEP 4",
      title: "Detailed Analytics",
      desc: "Get deep performance insights, scoring feedback, and PDF reports.",
    },
  ];

  const capabilityItems = [
    {
      image: evalImg,
      icon: <BsBarChart size={20} />,
      title: "AI Answer Evaluation",
      desc: "Scores communication, technical accuracy and confidence.",
    },
    {
      image: resumeImg,
      icon: <BsFileEarmarkText size={20} />,
      title: "Resume Based Interview",
      desc: "Project-specific questions based on uploaded resume.",
    },
    {
      image: pdfImg,
      icon: <BsFileEarmarkPdf size={20} />,
      title: "Downloadable PDF Report",
      desc: "Detailed strengths, weaknesses and improvement insights.",
    },
    {
      image: analyticsImg,
      icon: <BsGraphUp size={20} />,
      title: "History & Analytics",
      desc: "Track progress with performance graphs and topic analysis.",
    },
    {
      image: resumeImg,
      icon: <BsShieldCheck size={20} />,
      title: "ATS Resume Checker",
      desc: "Upload resume and compare it against target roles to find keyword gaps and formatting issues.",
    },
  ];

  const modeItems = [
    {
      img: resumeImg,
      title: "ATS Resume Checker",
      desc: "Scan your resume for keyword alignment, style formatting, and compatibility with target job descriptions.",
    },
    {
      img: evalImg,
      title: "Mock Aptitude Tests",
      desc: "Practice company-specific logical reasoning, quantitative analysis, and verbal aptitude exams.",
    },
    {
      img: techImg,
      title: "Coding Practice IDE",
      desc: "Solve structural DSA coding problems with multiple test cases in a live sandbox editor.",
    },
    {
      img: hrImg,
      title: "AI Voice Interviews",
      desc: "Experience voice-based mock interviews with adaptive follow-ups, tone assessment, and deep scoring.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-cyan-50/20 to-cyan-50/30 flex flex-col text-slate-800 font-sans">
      <Navbar />

      <div className="flex-1 px-6 py-16 md:py-24 relative overflow-hidden">
        {/* Glow backgrounds */}
        <div
          className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-pulse"
          style={{ animationDuration: "10s" }}
        />
        <div className="absolute top-[40%] left-[20%] w-[35%] h-[35%] rounded-full bg-cyan-500/8 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto z-10 relative">
          {/* Badge indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-white text-slate-700 text-xs font-semibold px-4.5 py-2 rounded-full flex items-center gap-2 border border-slate-200/80 shadow-sm">
              <HiSparkles size={14} className="text-cyan-500 animate-pulse" />
              <span>AI-Powered All-in-One Placement Preparation Platform</span>
            </div>
          </motion.div>

          {/* Hero Header */}
          <div className="text-center mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-display font-extrabold leading-tight max-w-4xl mx-auto tracking-tight text-slate-900"
            >
              Prep Smart.{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent px-2">
                Crack Faster.
              </span>{" "}
              Get Hired.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-slate-500 mt-6 max-w-3xl mx-auto text-base md:text-lg leading-relaxed font-medium"
            >
              PrepNest AI is your all-in-one AI-powered placement preparation platform with ATS Resume Checker, Mock Tests, Coding Tests, and AI Mock Interviews.
            </motion.p>
            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 mt-10"
            >
              <button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true);
                    return;
                  }
                  navigate("/ats-check");
                }}
                className="bg-white/15 backdrop-blur-md text-slate-700 border border-white/25 px-8 py-3.5 rounded-full hover:bg-gradient-to-r hover:from-cyan-600 hover:to-cyan-500 hover:text-white hover:border-transparent hover:shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:scale-[1.03] transition-all duration-300 cursor-pointer flex items-center gap-2 text-sm font-semibold shadow-sm group"
              >
                <BsLayoutTextSidebarReverse
                  size={16}
                  className="text-cyan-500 group-hover:text-white transition-colors"
                />
                <span>ATS Resume Checker</span>
              </button>

              <button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true);
                    return;
                  }
                  navigate("/mock-tests");
                }}
                className="bg-white/15 backdrop-blur-md text-slate-700 border border-white/25 px-8 py-3.5 rounded-full hover:bg-gradient-to-r hover:from-cyan-600 hover:to-cyan-500 hover:text-white hover:border-transparent hover:shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:scale-[1.03] transition-all duration-300 cursor-pointer flex items-center gap-2 text-sm font-semibold shadow-sm group"
              >
                <BsBuilding
                  size={16}
                  className="text-cyan-500 group-hover:text-white transition-colors"
                />
                <span>Mock Tests</span>
              </button>

              <button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true);
                    return;
                  }
                  navigate("/coding-tests");
                }}
                className="bg-white/15 backdrop-blur-md text-slate-700 border border-white/25 px-8 py-3.5 rounded-full hover:bg-gradient-to-r hover:from-cyan-600 hover:to-cyan-500 hover:text-white hover:border-transparent hover:shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:scale-[1.03] transition-all duration-300 cursor-pointer flex items-center gap-2 text-sm font-semibold shadow-sm group"
              >
                <BsCode
                  size={16}
                  className="text-cyan-500 group-hover:text-white transition-colors"
                />
                <span>Coding Tests</span>
              </button>

              <button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true);
                    return;
                  }
                  navigate("/interview");
                }}
                className="bg-white/15 backdrop-blur-md text-slate-700 border border-white/25 px-8 py-3.5 rounded-full hover:bg-gradient-to-r hover:from-cyan-600 hover:to-cyan-500 hover:text-white hover:border-transparent hover:shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:scale-[1.03] transition-all duration-300 cursor-pointer flex items-center gap-2 text-sm font-semibold shadow-sm group"
              >
                <BsMic
                  size={16}
                  className="text-cyan-500 group-hover:text-white transition-colors"
                />
                <span>Mock Interview</span>
              </button>
            </motion.div>
          </div>

          {/* Section 1: Carousel Steps */}
          <div className="mb-28">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-2xl font-display font-bold text-center mb-10 text-slate-800"
            >
              How it works
            </motion.h2>

            <Carousel itemsPerPage={{ mobile: 1, tablet: 2, desktop: 3 }}>
              {stepItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/15 p-8 h-64 flex flex-col justify-between shadow-sm hover:bg-cyan-500/25 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 relative group"
                >
                  <div className="absolute top-5 right-6 text-xs text-slate-400 font-bold tracking-wider">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/5 text-cyan-650 flex items-center justify-center mb-4 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold mb-2 text-slate-800 text-base sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>

          {/* Section 2: Advanced AI Capabilities */}
          <div className="mb-28">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-3xl font-display font-bold text-center mb-10 text-slate-800"
            >
              Advanced AI{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
                Capabilities
              </span>
            </motion.h2>

            <Carousel itemsPerPage={{ mobile: 1, tablet: 2, desktop: 3 }}>
              {capabilityItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (!userData) {
                      setShowAuth(true);
                      return;
                    }
                    navigate(
                      item.title.includes("ATS")
                        ? "/ats-check"
                        : item.title.includes("History")
                          ? "/history"
                          : "/interview",
                    );
                  }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/15 p-6 h-[22rem] flex flex-col justify-between cursor-pointer hover:bg-cyan-500/25 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 shadow-sm group"
                >
                  {/* Image container */}
                  <div className="w-full h-32 rounded-xl bg-slate-800 overflow-hidden border border-white/5 flex items-center justify-center p-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-end pt-4">
                    <div className="bg-white/15 backdrop-blur-sm text-cyan-650 border border-white/10 w-9 h-9 rounded-lg flex items-center justify-center mb-3">
                      {item.icon}
                    </div>
                    <h3 className="font-display font-bold mb-1.5 text-slate-800 text-base sm:text-lg flex items-center gap-1.5 group-hover:text-cyan-600 transition-colors">
                      <span>{item.title}</span>
                      <BsArrowRight
                        size={14}
                        className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                      />
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3 font-semibold">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>

          {/* Section 3: Multiple Interview Modes */}
          <div className="mb-20">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-3xl font-display font-bold text-center mb-10 text-slate-800"
            >
              Explore Our Core{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
                Modules
              </span>
            </motion.h2>

            <Carousel itemsPerPage={{ mobile: 1, tablet: 2, desktop: 3 }}>
              {modeItems.map((mode, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-6 h-64 flex flex-col justify-between shadow-sm hover:bg-cyan-500/25 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start gap-4 h-full">
                    <div className="flex-1 flex flex-col justify-between h-full">
                      <h3 className="font-display font-bold text-base sm:text-lg text-slate-800">
                        {mode.title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-2 line-clamp-4 font-semibold">
                        {mode.desc}
                      </p>
                    </div>

                    <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur-sm border border-white/5 p-2 flex items-center justify-center shrink-0">
                      <img
                        src={mode.img}
                        alt={mode.title}
                        className="max-h-full max-w-full object-contain opacity-90 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

      <Footer />
    </div>
  );
}

export default Home;
