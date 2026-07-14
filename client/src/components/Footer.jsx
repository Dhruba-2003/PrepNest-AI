import React from "react";
import { BsRobot } from "react-icons/bs";

function Footer() {
  return (
    <div className="w-full flex justify-center px-4 pb-10 py-4 pt-10 bg-transparent">
      <div className="w-full max-w-6xl bg-white rounded-2xl border border-slate-200/80 py-8 px-6 text-center shadow-sm">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="bg-gradient-to-tr from-cyan-600 to-cyan-500 text-white p-2 rounded-xl shadow-sm shadow-cyan-500/10">
            <BsRobot size={16} />
          </div>
          <h2 className="font-display font-bold text-slate-800 tracking-wide">
            PrepNest AI
          </h2>
        </div>
        <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-semibold">
          AI-powered placement preparation platform featuring ATS Resume Checker,
          Mock Tests, Coding Tests, and AI Mock Interviews.
        </p>
        <p className="text-slate-400 text-[10px] sm:text-xs mt-6 font-semibold">
          &copy; {new Date().getFullYear()} PrepNest AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Footer;
