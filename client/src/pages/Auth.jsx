import React, { useState } from "react";
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../redux/userSlice";

function Auth({ isModel = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeAuth = (user) => {
    dispatch(setUserData(user));
    if (!isModel) navigate("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const endpoint = isSignUpMode ? "/api/auth/register" : "/api/auth/login";
      const payload = isSignUpMode ? { name, email, password } : { email, password };
      const result = await axios.post(ServerUrl + endpoint, payload, { withCredentials: true });
      completeAuth(result.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to continue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    try {
      const response = await signInWithPopup(auth, provider);
      const result = await axios.post(
        ServerUrl + "/api/auth/google",
        { name: response.user.displayName, email: response.user.email },
        { withCredentials: true },
      );
      completeAuth(result.data);
    } catch (requestError) {
      setError("Google sign-in failed. Please try again.");
      dispatch(setUserData(null));
    }
  };

  return (
    <div className={`w-full flex items-center justify-center ${isModel ? "py-4" : "min-h-screen bg-slate-50 px-6 py-20"}`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className={`w-full bg-white border border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ${isModel ? "max-w-md p-8 rounded-2xl" : "max-w-lg p-8 md:p-12 rounded-3xl"}`}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-gradient-to-tr from-cyan-600 to-cyan-500 text-white p-2 rounded-xl shadow-sm shadow-cyan-500/10"><BsRobot size={18} /></div>
          <h2 className="font-display font-bold text-lg text-slate-800">PrepNest AI</h2>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-center leading-snug mb-3 text-slate-900">
          {isSignUpMode ? "Create your account" : "Welcome back"}
          <span className="block text-cyan-600 text-base md:text-lg mt-2"><IoSparkles className="inline mr-2" size={16} />AI Smart Interview</span>
        </h1>
        <p className="text-slate-500 text-center text-sm leading-relaxed mb-7 font-semibold">{isSignUpMode ? "Save your practice history and unlock AI-powered interview feedback." : "Sign in to continue your interview preparation journey."}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUpMode && <label className="block text-xs font-bold text-slate-600">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" placeholder="Your name" /></label>}
          <label className="block text-xs font-bold text-slate-600">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" placeholder="you@example.com" /></label>
          <label className="block text-xs font-bold text-slate-600">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" placeholder="Enter your password" /></label>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>}
          <button disabled={isSubmitting} className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-md shadow-cyan-600/15 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Please wait..." : isSignUpMode ? "Create account" : "Sign in"}</button>
        </form>
        <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
        <motion.button onClick={handleGoogleAuth} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-3 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md cursor-pointer transition-colors"><FcGoogle size={20} /><span>Continue with Google</span></motion.button>
        <p className="mt-6 text-center text-xs font-semibold text-slate-500">{isSignUpMode ? "Already have an account?" : "New to PrepNest AI?"} <button type="button" onClick={() => { setIsSignUpMode(!isSignUpMode); setError(""); }} className="text-cyan-600 hover:text-cyan-700">{isSignUpMode ? "Sign in" : "Create an account"}</button></p>
      </motion.div>
    </div>
  );
}

export default Auth;