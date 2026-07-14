import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import {
  BsRobot,
  BsCoin,
  BsBuilding,
  BsCode,
  BsLayoutTextSidebarReverse,
  BsHouseDoor,
  BsCreditCard,
  BsMic,
} from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import AuthModel from "./AuthModel";

function Navbar() {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "flex items-center gap-1.5 whitespace-nowrap bg-cyan-50/50 backdrop-blur-xs text-cyan-600 border border-cyan-200/80 px-2 lg:px-3 py-1.5 rounded-full hover:bg-cyan-100 hover:text-cyan-700 hover:border-cyan-300 transition-all cursor-pointer font-semibold shadow-sm shadow-cyan-500/5"
      : "flex items-center gap-1.5 whitespace-nowrap text-slate-500 hover:text-cyan-600 border border-transparent px-2 lg:px-3 py-1.5 rounded-full hover:bg-slate-50/50 transition-all cursor-pointer font-semibold";
  };

  return (
    <div className="w-full flex justify-center px-4 pt-6 z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-7xl bg-white/30 backdrop-blur-lg rounded-2xl border border-white/20 px-4 xl:px-6 py-3.5 flex justify-between items-center gap-4 relative shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
      >
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-4 cursor-pointer group flex-shrink-0"
        >
          <div className="bg-gradient-to-tr from-cyan-600 to-cyan-500 text-white p-2 rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-sm shadow-cyan-500/20">
            <BsRobot size={18} />
          </div>
          <h1 className="font-display font-bold hidden md:block text-base md:text-lg whitespace-nowrap bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            PrepNest AI
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-4 font-semibold text-sm text-slate-500 flex-shrink-0">
          <button onClick={() => navigate("/")} className={getLinkClass("/")}>
            <BsHouseDoor
              size={14}
              className={
                location.pathname === "/" ? "text-indigo-500" : "text-slate-400"
              }
            />
            <span>Home</span>
          </button>
          <button
            onClick={() => navigate("/ats-check")}
            className={getLinkClass("/ats-check")}
          >
            <BsLayoutTextSidebarReverse
              size={14}
              className={
                location.pathname === "/ats-check"
                  ? "text-indigo-500"
                  : "text-slate-400"
              }
            />
            <span>ATS Resume Checker</span>
          </button>
          <button
            onClick={() => navigate("/mock-tests")}
            className={getLinkClass("/mock-tests")}
          >
            <BsBuilding
              size={14}
              className={
                location.pathname === "/mock-tests"
                  ? "text-indigo-500"
                  : "text-slate-400"
              }
            />
            <span>Mock Tests</span>
          </button>
          <button
            onClick={() => navigate("/coding-tests")}
            className={getLinkClass("/coding-tests")}
          >
            <BsCode
              size={14}
              className={
                location.pathname === "/coding-tests"
                  ? "text-indigo-500"
                  : "text-slate-400"
              }
            />
            <span>Coding Tests</span>
          </button>
          <button
            onClick={() => navigate("/interview")}
            className={getLinkClass("/interview")}
          >
            <BsMic
              size={14}
              className={
                location.pathname === "/interview"
                  ? "text-indigo-500"
                  : "text-slate-400"
              }
            />
            <span>Mock Interview</span>
          </button>
          <button
            onClick={() => navigate("/pricing")}
            className={getLinkClass("/pricing")}
          >
            <BsCreditCard
              size={14}
              className={
                location.pathname === "/pricing"
                  ? "text-indigo-500"
                  : "text-slate-400"
              }
            />
            <span>Pricing</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 relative flex-shrink-0">
          {/* Credits Coins */}
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm px-4.5 py-2 rounded-full text-slate-700 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <BsCoin className="text-amber-500" size={16} />
              <span className="font-bold text-sm">
                {userData?.credits || 0}
              </span>
            </button>

            <AnimatePresence>
              {showCreditPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-xl p-5 shadow-2xl z-50 text-slate-800"
                >
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed font-semibold">
                    Need more credits to continue AI-powered interviews?
                  </p>
                  <button
                    onClick={() => {
                      setShowCreditPopup(false);
                      navigate("/pricing");
                    }}
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold py-2.5 rounded-lg text-xs hover:opacity-95 transition cursor-pointer shadow-md shadow-cyan-600/10"
                  >
                    Buy credits
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-9 h-9 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer hover:opacity-95 transition-opacity"
            >
              {userData ? (
                userData?.name.slice(0, 1).toUpperCase()
              ) : (
                <FaUserAstronaut size={16} />
              )}
            </button>

            <AnimatePresence>
              {showUserPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-xl p-3 shadow-2xl z-50 flex flex-col gap-1 text-slate-700"
                >
                  {userData ? (
                    <>
                      <p className="text-xs font-bold text-cyan-600 px-3 py-2 border-b border-slate-100 truncate">
                        {userData?.name}
                      </p>

                      {["Admin", "Editor", "Staff"].includes(userData?.role) && (
                        <button
                          onClick={() => {
                            setShowUserPopup(false);
                            navigate("/admin");
                          }}
                          className="w-full text-left text-xs font-bold py-2.5 px-3 rounded-lg bg-cyan-50/50 text-cyan-650 hover:bg-cyan-50 transition flex items-center gap-2 cursor-pointer border-b border-slate-100 mb-1"
                        >
                          <BsRobot size={14} className="text-cyan-500" />
                          <span>Admin Panel</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/ats-check");
                        }}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer"
                      >
                        <BsLayoutTextSidebarReverse
                          size={14}
                          className="text-cyan-500"
                        />
                        <span>ATS Resume Checker</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/mock-tests");
                        }}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer"
                      >
                        <BsBuilding size={14} className="text-cyan-500" />
                        <span>Mock Tests</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/coding-tests");
                        }}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer"
                      >
                        <BsCode size={14} className="text-cyan-500" />
                        <span>Coding Tests</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/interview");
                        }}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer"
                      >
                        <BsMic size={14} className="text-cyan-500" />
                        <span>Mock Interview</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
                      >
                        <HiOutlineLogout size={15} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-cyan-600 px-3 py-2 border-b border-slate-100 truncate">
                        Welcome Guest
                      </p>

                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/");
                        }}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer"
                      >
                        <BsHouseDoor size={14} className="text-cyan-500" />
                        <span>Home</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/ats-check");
                        }}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer"
                      >
                        <BsLayoutTextSidebarReverse
                          size={14}
                          className="text-cyan-500"
                        />
                        <span>ATS Resume Checker</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/mock-tests");
                        }}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer"
                      >
                        <BsBuilding size={14} className="text-cyan-500" />
                        <span>Mock Tests</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/coding-tests");
                        }}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer"
                      >
                        <BsCode size={14} className="text-cyan-500" />
                        <span>Coding Tests</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/interview");
                        }}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer"
                      >
                        <BsMic size={14} className="text-cyan-500" />
                        <span>Mock Interview</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          navigate("/pricing");
                        }}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer"
                      >
                        <BsCreditCard size={14} className="text-cyan-500" />
                        <span>Pricing</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserPopup(false);
                          setShowAuth(true);
                        }}
                        className="w-full text-left text-xs font-semibold py-2.5 px-3 rounded-lg hover:bg-cyan-50 text-cyan-600 hover:text-cyan-700 transition flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
                      >
                        <FaUserAstronaut size={14} className="text-cyan-500" />
                        <span>Login / Sign Up</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default Navbar;
