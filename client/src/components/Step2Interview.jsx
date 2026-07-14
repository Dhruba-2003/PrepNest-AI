import React from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion, AnimatePresence } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash, FaArrowLeft } from "react-icons/fa";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import axios from "axios";
import { ServerUrl } from "../App";
import { BsArrowRight, BsSliders } from "react-icons/bs";

function Step2Interview({ interviewData, onFinish, onBack, onBackHome }) {
  const { interviewId, questions, userName } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Try known female voices first
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female"),
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // Try known male voices
      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male"),
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // Fallback: first voice (assume female)
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const toggleVoiceGender = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voiceGender === "female") {
      const maleVoice =
        voices.find(
          (v) =>
            v.name.toLowerCase().includes("david") ||
            v.name.toLowerCase().includes("mark") ||
            v.name.toLowerCase().includes("male") ||
            v.name.toLowerCase().includes("george") ||
            v.name.toLowerCase().includes("ravi"),
        ) ||
        voices[1] ||
        voices[0];
      setSelectedVoice(maleVoice);
      setVoiceGender("male");
    } else {
      const femaleVoice =
        voices.find(
          (v) =>
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("heera"),
        ) || voices[0];
      setSelectedVoice(femaleVoice);
      setVoiceGender("female");
    }
  };

  /* ---------------- SPEAK FUNCTION ---------------- */

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      // Add natural pauses after commas and periods
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      // Human-like pacing
      utterance.rate = 0.92; // slightly slower than normal
      utterance.pitch = 1.05; // small warmth
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
        setIsAIPlaying(false);

        if (isMicOn) {
          startMic();
        }
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) {
      return;
    }
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`,
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.",
        );

        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));

        // If last question (hard level)
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }
    };

    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true },
      );

      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true },
      );

      console.log(result.data);
      onFinish(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex flex-col text-slate-800 font-sans">
      {onBack && (
        <div className="w-full mb-6 flex justify-start z-10">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <button
              onClick={onBack}
              type="button"
              className="flex items-center gap-2 hover:text-cyan-600 transition cursor-pointer"
            >
              <FaArrowLeft size={12} />
              <span>Back</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={onBackHome}
              type="button"
              className="hover:text-cyan-600 transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
      <div className="w-full bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex flex-col lg:flex-row min-h-[80vh]">
        {/* Left Video/Audio Info Panel */}
        <div className="w-full lg:w-[35%] bg-slate-50 p-6 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80">
          {/* AI Avatar Video container */}
          <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner relative">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-48 sm:h-56 object-cover opacity-90"
            />
            {/* Visual Listening wave bar effect */}
            {isMicOn && !isAIPlaying && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                <div
                  className="w-1 h-3.5 bg-cyan-500 rounded-full animate-wave-bar"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-1 h-5 bg-cyan-650 bg-cyan-600 rounded-full animate-wave-bar"
                  style={{ animationDelay: "0.3s" }}
                />
                <div
                  className="w-1 h-3.5 bg-cyan-500 rounded-full animate-wave-bar"
                  style={{ animationDelay: "0.5s" }}
                />
                <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider ml-1">
                  Listening
                </span>
              </div>
            )}
          </div>

          {/* Switch Voice */}
          <div className="w-full max-w-sm my-4">
            <button
              onClick={toggleVoiceGender}
              className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <BsSliders size={12} className="text-cyan-600" />
              <span>
                Voice: {voiceGender === "female" ? "👩 Female" : "👨 Male"}
              </span>
              <span className="text-cyan-600 font-bold ml-1 underline">
                Switch
              </span>
            </button>
          </div>

          {/* Real-time Subtitles */}
          <div className="w-full max-w-sm flex-1 flex items-center justify-center mb-6">
            <AnimatePresence mode="wait">
              {subtitle ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                >
                  <p className="text-slate-700 text-sm font-semibold text-center leading-relaxed">
                    {subtitle}
                  </p>
                </motion.div>
              ) : (
                <div className="w-full border border-dashed border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-slate-450 text-xs font-semibold">
                    Avatar standby mode
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Status & Timer Card */}
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-450 font-semibold">
                Interview Session
              </span>
              <span
                className={`font-bold uppercase tracking-wider ${isAIPlaying ? "text-cyan-600" : "text-slate-400"}`}
              >
                {isAIPlaying ? "AI Speaking" : "Standby"}
              </span>
            </div>

            <div className="h-px bg-slate-100"></div>

            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit}
              />
            </div>

            <div className="h-px bg-slate-100"></div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xl font-extrabold text-cyan-650 text-cyan-600">
                  {currentIndex + 1}
                </p>
                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                  Current
                </p>
              </div>

              <div>
                <p className="text-xl font-extrabold text-slate-700">
                  {questions.length}
                </p>
                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                  Total Questions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Input Workspace */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 relative bg-white">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-800">
              Active Workspace
            </h2>
          </div>

          {/* Question Text Card */}
          {!isIntroPhase && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mb-6 bg-slate-50 border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-2">
                Question {currentIndex + 1} of {questions.length}
              </div>

              <div className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed ">
                {currentQuestion?.question}
              </div>
            </motion.div>
          )}

          {/* Answers Text Area */}
          <textarea
            placeholder="Your spoken transcript will appear here. You can also type or edit your answer directly..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 bg-slate-50 p-5 sm:p-6 rounded-2xl resize-none outline-none border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-800 placeholder-slate-400 text-sm leading-relaxed font-semibold"
          />

          {/* Feedbacks and CTA section */}
          {!feedback ? (
            <div className="flex items-center gap-4 mt-6">
              {/* Mic toggle */}
              <motion.button
                onClick={toggleMic}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl transition-colors cursor-pointer shadow-md shrink-0 ${
                  isMicOn
                    ? "bg-cyan-600 text-white hover:bg-cyan-500"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {isMicOn ? (
                  <FaMicrophone size={18} />
                ) : (
                  <FaMicrophoneSlash size={18} />
                )}
              </motion.button>

              {/* Submit answer */}
              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white py-3 sm:py-4 rounded-xl shadow-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base shadow-cyan-600/10"
              >
                {isSubmitting ? "Evaluating answer..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-cyan-50/50 border border-cyan-100 p-5 rounded-2xl shadow-sm text-cyan-950"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-650 text-cyan-600 mb-2">
                Instant Feedback
              </div>
              <p className="text-cyan-900 text-sm leading-relaxed mb-4 font-semibold">
                {feedback}
              </p>

              <button
                onClick={handleNext}
                type="button"
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold py-3 rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer text-sm shadow-md shadow-cyan-650/10"
              >
                <span>
                  {currentIndex + 1 >= questions.length
                    ? "Finish Session"
                    : "Next Question"}
                </span>
                <BsArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;
