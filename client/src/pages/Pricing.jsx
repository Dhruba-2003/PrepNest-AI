import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaCheckCircle, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import Navbar from "../components/Navbar";
import { useToast } from "../components/Toast.jsx";

function Pricing() {
  const navigate = useNavigate();
  const toast = useToast();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const dispatch = useDispatch();

  const [plans, setPlans] = useState([
    {
      _id: "free",
      name: "Free",
      price: "Rs 0",
      credits: 200,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "200 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
  ]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(ServerUrl + "/api/admin/public/plans");
        const freePlan = plans[0];
        const dynamicPlans = res.data.map((p) => ({
          ...p,
          price: `Rs ${p.amount}`,
        }));
        setPlans([freePlan, ...dynamicPlans]);
      } catch (error) {
        console.error("Failed to load plans:", error);
      }
    };
    fetchPlans();
  }, []);

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan._id);

      const result = await axios.post(
        ServerUrl + "/api/payment/order",
        {
          planId: plan._id,
        },
        { withCredentials: true },
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        name: "PrepNest AI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,

        handler: async function (response) {
          const verifypay = await axios.post(
            ServerUrl + "/api/payment/verify",
            response,
            { withCredentials: true },
          );
          dispatch(setUserData(verifypay.data.user));

          toast.success("Payment successful. Credits added!");
          navigate("/");
        },
        theme: {
          color: "#0ea5e9",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      setLoadingPlan(null);
    } catch (error) {
      console.log(error);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      <Navbar />

      <div className="flex-1 py-16 px-6 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto mb-14 flex items-start gap-4 z-10 relative">
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              title="Back"
              className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer shadow-sm"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={() => navigate("/")}
              aria-label="Back to home"
              title="Back to Home"
              className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer shadow-sm"
            >
              <FaHome />
            </button>
          </div>

          <div className="text-center w-full">
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">
              Choose Your Plan
            </h1>
            <p className="text-slate-500 mt-3 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed font-semibold">
              Flexible pricing to match your interview preparation goals.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto z-10 relative">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan._id;

            return (
              <motion.div
                key={plan._id}
                whileHover={!plan.default && { scale: 1.02 }}
                onClick={() => !plan.default && setSelectedPlan(plan._id)}
                className={`relative rounded-3xl p-8 transition-all duration-300 border flex flex-col justify-between min-h-[28rem] shadow-sm bg-white
                ${
                  isSelected
                    ? "border-cyan-500 shadow-xl"
                    : "border-slate-200 hover:border-slate-350"
                }
                ${plan.default ? "cursor-default" : "cursor-pointer"}
              `}
              >
                <div>
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute top-6 right-6 bg-cyan-50 border border-cyan-100 text-cyan-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {plan.badge}
                    </div>
                  )}

                  {/* Default Tag */}
                  {plan.default && (
                    <div className="absolute top-6 right-6 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      Default
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3 className="text-lg font-display font-bold text-slate-800">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-cyan-600">
                      {plan.price}
                    </span>
                    <p className="text-slate-450 text-xs mt-1 font-bold uppercase tracking-wider">
                      {plan.credits} Credits
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-slate-500 mt-4 text-xs sm:text-sm leading-relaxed font-semibold">
                    {plan.description}
                  </p>

                  {/* Features */}
                  <div className="mt-8 space-y-3.5 text-left border-t border-slate-150 pt-6">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <FaCheckCircle className="text-cyan-500 text-xs shrink-0" />
                        <span className="text-slate-600 text-xs sm:text-sm font-semibold">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {!plan.default && (
                    <button
                      disabled={loadingPlan === plan._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) {
                          setSelectedPlan(plan._id);
                        } else {
                          handlePayment(plan);
                        }
                      }}
                      className={`w-full mt-8 py-3 rounded-xl font-bold transition text-xs sm:text-sm cursor-pointer shadow-sm ${
                      isSelected
                        ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:opacity-95 shadow-md shadow-cyan-600/10"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    >
                      {loadingPlan === plan._id
                        ? "Processing order..."
                        : isSelected
                          ? "Proceed to Pay"
                          : "Select Plan"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Pricing;
