import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "../components/Toast.jsx";
import {
  FaUsers,
  FaChartLine,
  FaCogs,
  FaEnvelope,
  FaUserShield,
  FaTicketAlt,
  FaSignOutAlt,
  FaFileAlt,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaUpload,
  FaKey,
  FaSpinner,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function AdminPanel() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  // Dark/Light Mode state
  const darkMode = false;

  // Active Tab state
  const [activeTab, setActiveTab] = useState("dashboard");

  // General Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data States
  const [stats, setStats] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [selectedUserRowId, setSelectedUserRowId] = useState(null);
  const [usersPagination, setUsersPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [plans, setPlans] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [messages, setMessages] = useState([]);
  const [settings, setSettings] = useState({
    siteName: "",
    logoUrl: "",
    contactEmail: "",
    contactPhone: "",
    socialLinks: { facebook: "", twitter: "", linkedin: "", github: "" },
    currency: "INR",
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pages, setPages] = useState([]);

  // Search/Filter states for users
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userPage, setUserPage] = useState(1);

  // Modals States
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUserEdit, setCurrentUserEdit] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "User", credits: 200 });

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [currentPlanEdit, setCurrentPlanEdit] = useState(null);
  const [planForm, setPlanForm] = useState({ name: "", amount: 0, credits: 100, description: "", features: "", badge: "", isActive: true });

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [currentCouponEdit, setCurrentCouponEdit] = useState(null);
  const [couponForm, setCouponForm] = useState({ code: "", discountPercent: 10, expiresAt: "", isActive: true });

  const [showPostModal, setShowPostModal] = useState(false);
  const [currentPostEdit, setCurrentPostEdit] = useState(null);
  const [postForm, setPostForm] = useState({ title: "", content: "", categoryId: "", tags: [], status: "draft" });

  const [showPageModal, setShowPageModal] = useState(false);
  const [currentPageEdit, setCurrentPageEdit] = useState(null);
  const [pageForm, setPageForm] = useState({ title: "", content: "", status: "draft" });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", password: "", confirmPassword: "" });

  // Verification & Role Gate
  useEffect(() => {
    if (userData && !["Admin", "Editor", "Staff"].includes(userData.role)) {
      setError("Access Denied: You do not have permissions to view this page.");
    }
  }, [userData]);

  // Load Initial Tab Data
  useEffect(() => {
    if (!userData || !["Admin", "Editor", "Staff"].includes(userData.role)) return;

    if (activeTab === "dashboard") {
      fetchDashboardStats();
    } else if (activeTab === "users" && userData.role === "Admin") {
      fetchUsers();
    } else if (activeTab === "plans" && userData.role === "Admin") {
      fetchPlans();
    } else if (activeTab === "coupons" && userData.role === "Admin") {
      fetchCoupons();
    } else if (activeTab === "messages") {
      fetchMessages();
    } else if (activeTab === "content") {
      fetchContentData();
    } else if (activeTab === "settings" && userData.role === "Admin") {
      fetchSettings();
    }
  }, [activeTab, userData, userSearch, userRoleFilter, userPage]);

  // 1. Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ServerUrl}/api/admin/stats`, { withCredentials: true });
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard statistics.");
      setLoading(false);
    }
  };

  // 2. Fetch & Manage Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${ServerUrl}/api/admin/users?search=${userSearch}&role=${userRoleFilter}&page=${userPage}`,
        { withCredentials: true }
      );
      setUsersData(res.data.users);
      setUsersPagination(res.data.pagination);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch users.");
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentUserEdit) {
        await axios.put(`${ServerUrl}/api/admin/users/${currentUserEdit._id}`, userForm, { withCredentials: true });
        setSuccess("User updated successfully.");
      } else {
        await axios.post(`${ServerUrl}/api/admin/users`, userForm, { withCredentials: true });
        setSuccess("User created successfully.");
      }
      setShowUserModal(false);
      fetchUsers();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "User operation failed.");
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    toast.confirm(
      "Are you sure you want to delete this user? This action is permanent.",
      async () => {
        try {
          setLoading(true);
          await axios.delete(`${ServerUrl}/api/admin/users/${id}`, { withCredentials: true });
          setSuccess("User deleted successfully.");
          fetchUsers();
          setLoading(false);
        } catch (err) {
          setError("Failed to delete user.");
          setLoading(false);
        }
      },
      null,
      "Delete User",
      "danger"
    );
  };

  // 3. Fetch & Manage Plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ServerUrl}/api/admin/plans`, { withCredentials: true });
      setPlans(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch pricing plans.");
      setLoading(false);
    }
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    const formattedForm = {
      ...planForm,
      features: planForm.features.split("\n").map((f) => f.trim()).filter((f) => f.length > 0),
    };
    try {
      setLoading(true);
      if (currentPlanEdit) {
        await axios.put(`${ServerUrl}/api/admin/plans/${currentPlanEdit._id}`, formattedForm, { withCredentials: true });
        setSuccess("Plan updated successfully.");
      } else {
        await axios.post(`${ServerUrl}/api/admin/plans`, formattedForm, { withCredentials: true });
        setSuccess("Plan created successfully.");
      }
      setShowPlanModal(false);
      fetchPlans();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Plan operation failed.");
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id) => {
    toast.confirm(
      "Delete this pricing plan?",
      async () => {
        try {
          setLoading(true);
          await axios.delete(`${ServerUrl}/api/admin/plans/${id}`, { withCredentials: true });
          setSuccess("Plan deleted.");
          fetchPlans();
          setLoading(false);
        } catch (err) {
          setError("Failed to delete plan.");
          setLoading(false);
        }
      },
      null,
      "Delete Plan",
      "danger"
    );
  };

  // 4. Fetch & Manage Coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ServerUrl}/api/admin/coupons`, { withCredentials: true });
      setCoupons(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch coupons.");
      setLoading(false);
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentCouponEdit) {
        await axios.put(`${ServerUrl}/api/admin/coupons/${currentCouponEdit._id}`, couponForm, { withCredentials: true });
        setSuccess("Coupon code updated successfully.");
      } else {
        await axios.post(`${ServerUrl}/api/admin/coupons`, couponForm, { withCredentials: true });
        setSuccess("Coupon code created successfully.");
      }
      setShowCouponModal(false);
      setCurrentCouponEdit(null);
      fetchCoupons();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Coupon operation failed.");
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    toast.confirm(
      "Delete this coupon code?",
      async () => {
        try {
          setLoading(true);
          await axios.delete(`${ServerUrl}/api/admin/coupons/${id}`, { withCredentials: true });
          setSuccess("Coupon deleted.");
          fetchCoupons();
          setLoading(false);
        } catch (err) {
          setError("Failed to delete coupon.");
          setLoading(false);
        }
      },
      null,
      "Delete Coupon",
      "danger"
    );
  };

  // 5. Contact Form Messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ServerUrl}/api/admin/messages`, { withCredentials: true });
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch messages.");
      setLoading(false);
    }
  };

  const markMessageAsRead = async (id) => {
    try {
      await axios.put(`${ServerUrl}/api/admin/messages/${id}/read`, {}, { withCredentials: true });
      fetchMessages();
    } catch (err) {
      setError("Failed to mark message read.");
    }
  };

  const handleDeleteMessage = async (id) => {
    toast.confirm(
      "Delete this message?",
      async () => {
        try {
          await axios.delete(`${ServerUrl}/api/admin/messages/${id}`, { withCredentials: true });
          setSuccess("Message deleted.");
          fetchMessages();
        } catch (err) {
          setError("Failed to delete message.");
        }
      },
      null,
      "Delete Message",
      "danger"
    );
  };

  // 6. Settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ServerUrl}/api/admin/settings`, { withCredentials: true });
      setSettings(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load settings.");
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`${ServerUrl}/api/admin/settings`, settings, { withCredentials: true });
      setSuccess("Global website settings updated successfully.");
      setLoading(false);
    } catch (err) {
      setError("Failed to update settings.");
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post(`${ServerUrl}/api/admin/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setSettings((prev) => ({ ...prev, logoUrl: res.data.fileUrl }));
      setSuccess("Logo uploaded successfully.");
      setLoading(false);
    } catch (err) {
      setError("Logo upload failed.");
      setLoading(false);
    }
  };

  // 7. Content Management (Pages & Posts)
  const fetchContentData = async () => {
    try {
      setLoading(true);
      const [catsRes, tagsRes, postsRes, pagesRes] = await Promise.all([
        axios.get(`${ServerUrl}/api/admin/content/categories`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/admin/content/tags`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/admin/content/posts`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/admin/content/pages`, { withCredentials: true }),
      ]);
      setCategories(catsRes.data);
      setTags(tagsRes.data);
      setPosts(postsRes.data);
      setPages(pagesRes.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load blog posts and pages.");
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentPostEdit) {
        await axios.put(`${ServerUrl}/api/admin/content/posts/${currentPostEdit._id}`, postForm, { withCredentials: true });
        setSuccess("Post updated.");
      } else {
        await axios.post(`${ServerUrl}/api/admin/content/posts`, postForm, { withCredentials: true });
        setSuccess("Post created.");
      }
      setShowPostModal(false);
      fetchContentData();
      setLoading(false);
    } catch (err) {
      setError("Post save failed.");
      setLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    toast.confirm(
      "Delete this post?",
      async () => {
        try {
          await axios.delete(`${ServerUrl}/api/admin/content/posts/${id}`, { withCredentials: true });
          setSuccess("Post deleted.");
          fetchContentData();
        } catch (err) {
          setError("Failed to delete post.");
        }
      },
      null,
      "Delete Post",
      "danger"
    );
  };

  const handlePageSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentPageEdit) {
        await axios.put(`${ServerUrl}/api/admin/content/pages/${currentPageEdit._id}`, pageForm, { withCredentials: true });
        setSuccess("Page updated.");
      } else {
        await axios.post(`${ServerUrl}/api/admin/content/pages`, pageForm, { withCredentials: true });
        setSuccess("Page created.");
      }
      setShowPageModal(false);
      fetchContentData();
      setLoading(false);
    } catch (err) {
      setError("Page save failed.");
      setLoading(false);
    }
  };

  const handleDeletePage = async (id) => {
    toast.confirm(
      "Delete this page?",
      async () => {
        try {
          await axios.delete(`${ServerUrl}/api/admin/content/pages/${id}`, { withCredentials: true });
          setSuccess("Page deleted.");
          fetchContentData();
        } catch (err) {
          setError("Failed to delete page.");
        }
      },
      null,
      "Delete Page",
      "danger"
    );
  };

  // 8. Profile & Password update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileForm.password !== profileForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      await axios.put(
        `${ServerUrl}/api/user/update-profile`,
        {
          name: profileForm.name || userData.name,
          password: profileForm.password,
        },
        { withCredentials: true }
      );
      setSuccess("Profile settings updated successfully.");
      setShowProfileModal(false);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile settings.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${ServerUrl}/api/auth/logout`, { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/");
    } catch (err) {
      setError("Logout failed.");
    }
  };

  // Clear Alert Timeouts and trigger Toast notifications
  useEffect(() => {
    if (error) {
      // Don't toast if it's the Access Forbidden full screen page error
      if (!stats && activeTab === "dashboard") return;
      toast.error(error);
      const t = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(t);
    }
  }, [error, stats, activeTab, toast]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      const t = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(t);
    }
  }, [success, toast]);

  // Gate check UI render
  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-800">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-md text-center">
          <FaUserShield className="text-cyan-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm font-semibold mb-6">
            Please login with an administrative account to access this system.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold py-3 rounded-full hover:opacity-95 transition cursor-pointer"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error && !stats && activeTab === "dashboard") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-800">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-md text-center">
          <FaTimes className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Access Forbidden</h2>
          <p className="text-red-500 text-sm font-bold mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"} font-sans transition-colors duration-300`}>
      {/* Dynamic Alerts are handled by ToastProvider */}

      {/* SIDEBAR PANEL */}
      <div className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between p-6 shadow-sm">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-gradient-to-tr from-cyan-600 to-cyan-500 text-white p-2.5 rounded-xl">
              <FaUserShield size={20} />
            </div>
            <h2 className="text-lg font-bold font-display text-slate-900">
              PrepNest AI
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: <FaChartLine />, roles: ["Admin", "Editor", "Staff"] },
              { id: "users", label: "User Management", icon: <FaUsers />, roles: ["Admin"] },
              { id: "plans", label: "Plan Pricing", icon: <FaTicketAlt />, roles: ["Admin"] },
              { id: "coupons", label: "Coupons & Discounts", icon: <FaTicketAlt />, roles: ["Admin"] },
              { id: "content", label: "Content Control", icon: <FaFileAlt />, roles: ["Admin", "Editor", "Staff"] },
              { id: "settings", label: "Settings", icon: <FaCogs />, roles: ["Admin"] },
            ].map((tab) => {
              if (!tab.roles.includes(userData.role)) return null;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${isActive
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/10 border border-cyan-600"
                      : "text-slate-600 hover:bg-cyan-50/70 hover:text-cyan-600 border border-transparent"
                    }`}
                >
                  {tab.icon}
                  <span className="whitespace-nowrap truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Settings */}
        <div className="space-y-4">
          <div
            onClick={() => {
              setProfileForm({ name: userData.name, password: "", confirmPassword: "" });
              setShowProfileModal(true);
            }}
            className="p-3 rounded-xl flex items-center gap-3 cursor-pointer border bg-slate-50 hover:bg-slate-100 border-slate-150"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {userData.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-slate-800">{userData.name}</p>
              <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">
                {userData.role}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-250 text-red-650 bg-red-50/30 hover:bg-red-50/60 text-xs font-bold transition cursor-pointer"
          >
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER BAR */}
        <header className={`px-8 py-5 flex items-center justify-between border-b ${darkMode ? "border-slate-850 bg-slate-900" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold font-display capitalize">{activeTab}</h1>
            {loading && <FaSpinner className="animate-spin text-cyan-500 text-lg" />}
          </div>

          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* WORKSPACE CONTENT PANELS */}
        <main className="flex-1 p-8">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && stats && (
            <div className="space-y-8">
              {/* Stat Cards Grid */}
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { label: "Total Users", val: stats.metrics.totalUsers, desc: "Platform registrations", icon: <FaUsers className="text-blue-500" /> },
                  { label: "AI Interviews", val: stats.metrics.totalInterviews, desc: "Total sessions generated", icon: <FaUserShield className="text-cyan-500" /> },
                  { label: "Total Sales", val: `Rs ${stats.metrics.totalRevenue}`, desc: "Processed payments", icon: <FaTicketAlt className="text-emerald-500" /> },
                  { label: "Interview Split", val: `${stats.metrics.techCount}/${stats.metrics.hrCount}`, desc: "Tech vs HR interviews", icon: <FaChartLine className="text-amber-500" /> },
                ].map((stat, i) => (
                  <div key={i} className={`p-6 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-sm flex items-start gap-4`}>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">{stat.label}</p>
                      <h3 className="text-2xl font-extrabold mt-1">{stat.val}</h3>
                      <p className="text-xs text-slate-400 mt-1 font-semibold">{stat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Analytics Graphs */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Sales Area Chart */}
                <div className={`p-6 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                  <h3 className="text-base font-bold font-display mb-6">Revenue Growth (Monthly)</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.revenueStats.length ? stats.revenueStats : [{ month: "2026-07", revenue: 0 }]}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#e2e8f0"} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* User Area Chart */}
                <div className={`p-6 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                  <h3 className="text-base font-bold font-display mb-6">User Registrations</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.userStats.length ? stats.userStats : [{ month: "2026-07", users: 0 }]}>
                        <defs>
                          <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#e2e8f0"} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip />
                        <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUser)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Audit / Activity Logs */}
              <div className={`p-6 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                <h3 className="text-base font-bold font-display mb-4">Admin Activity Logs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${darkMode ? "border-slate-800" : "border-slate-100"} text-slate-400 text-xs font-bold uppercase tracking-wider`}>
                        <th className="py-3 px-4">Operator</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Details</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold divide-y divide-slate-100 dark:divide-slate-850">
                      {stats.recentLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-cyan-100/70 transition-colors duration-150">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {log.userId?.name || "System"} ({log.userId?.role || "System"})
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded font-mono font-bold uppercase">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{log.details}</td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono">{log.ipAddress || "127.0.0.1"}</td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT (ADMIN ONLY) */}
          {activeTab === "users" && userData.role === "Admin" && (
            <div className="space-y-6">
              {/* User search controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 shrink-0">
                  <input
                    type="text"
                    placeholder="Search name, email..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm cursor-pointer focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                  >
                    <option value="">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Staff">Staff</option>
                    <option value="User">User</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setCurrentUserEdit(null);
                    setUserForm({ name: "", email: "", password: "", role: "User", credits: 200 });
                    setShowUserModal(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/10 transition"
                >
                  <FaPlus />
                  <span>Add User</span>
                </button>
              </div>

              {/* Users table */}
              <div className={`rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-sm overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${darkMode ? "border-slate-850" : "border-slate-100"} text-slate-400 text-xs font-bold uppercase tracking-wider`}>
                        <th className="py-3 px-6">Name</th>
                        <th className="py-3 px-6">Email</th>
                        <th className="py-3 px-6">Role</th>
                        <th className="py-3 px-6">Credits</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold divide-y divide-slate-100 dark:divide-slate-850">
                      {usersData.map((user) => (
                        <tr
                          key={user._id}
                          className="transition-colors duration-150 hover:bg-cyan-100/70"
                        >
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{user.name}</td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{user.email}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded font-bold uppercase ${user.role === "Admin"
                                ? "bg-red-100 text-red-700"
                                : user.role === "Editor"
                                  ? "bg-purple-100 text-purple-700"
                                  : user.role === "Staff"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-700"
                                }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-cyan-600 dark:text-cyan-400">{user.credits}</td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentUserEdit(user);
                                setUserForm({ name: user.name, email: user.email, password: "", role: user.role, credits: user.credits });
                                setShowUserModal(true);
                              }}
                              className="text-cyan-600 hover:text-cyan-700 bg-cyan-50 dark:bg-cyan-950/30 p-2.5 rounded-lg cursor-pointer hover:scale-105 transition"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user._id);
                              }}
                              className="text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg cursor-pointer hover:scale-105 transition"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className={`px-6 py-4 flex items-center justify-between border-t ${darkMode ? "border-slate-850" : "border-slate-100"}`}>
                  <p className="text-slate-400 text-[11px] font-bold">
                    Showing Page {usersPagination.page} of {usersPagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={userPage === 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-xs font-bold rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      disabled={userPage === usersPagination.pages}
                      onClick={() => setUserPage((p) => Math.min(usersPagination.pages, p + 1))}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-xs font-bold rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLAN PRICING (ADMIN ONLY) */}
          {activeTab === "plans" && userData.role === "Admin" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Manage Pricing Tiers</p>
                <button
                  onClick={() => {
                    setCurrentPlanEdit(null);
                    setPlanForm({ name: "", amount: 0, credits: 100, description: "", features: "", badge: "", isActive: true });
                    setShowPlanModal(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/10 transition"
                >
                  <FaPlus />
                  <span>Create Plan</span>
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan._id} className={`rounded-2xl p-6 border ${plan.isActive ? "border-slate-200 dark:border-slate-800" : "border-red-200 dark:border-red-950 opacity-70"} bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-base font-display">{plan.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${plan.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-150 text-red-700"}`}>
                          {plan.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <h4 className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-3">Rs {plan.amount}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{plan.credits} Credits</p>
                      <p className="text-slate-500 text-xs mt-3 leading-relaxed font-semibold">{plan.description}</p>

                      <ul className="mt-5 space-y-2 text-xs border-t border-slate-100 dark:border-slate-850 pt-4">
                        {plan.features.map((f, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-650 dark:text-slate-400 font-semibold">
                            <span className="text-cyan-500">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={() => {
                          setCurrentPlanEdit(plan);
                          setPlanForm({
                            name: plan.name,
                            amount: plan.amount,
                            credits: plan.credits,
                            description: plan.description,
                            features: plan.features.join("\n"),
                            badge: plan.badge || "",
                            isActive: plan.isActive,
                          });
                          setShowPlanModal(true);
                        }}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-bold rounded-lg cursor-pointer text-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan._id)}
                        className="py-2 px-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COUPON CODE PANEL */}
          {activeTab === "coupons" && userData.role === "Admin" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Coupon & Discount Management</p>
                <button
                  onClick={() => {
                    setCurrentCouponEdit(null);
                    setCouponForm({ code: "", discountPercent: 10, expiresAt: "", isActive: true });
                    setShowCouponModal(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/10 transition"
                >
                  <FaPlus />
                  <span>Create Coupon</span>
                </button>
              </div>

              {/* Coupons List */}
              <div className={`rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-sm overflow-hidden`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? "border-slate-850" : "border-slate-100"} text-slate-400 text-xs font-bold uppercase tracking-wider`}>
                      <th className="py-3 px-6">Code</th>
                      <th className="py-3 px-6">Discount Percent</th>
                      <th className="py-3 px-6">Expires At</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold divide-y divide-slate-100 dark:divide-slate-850">
                    {coupons.map((coupon) => {
                      const isExpired = new Date(coupon.expiresAt) < new Date();
                      return (
                        <tr key={coupon._id} className="hover:bg-cyan-100/70 transition-colors duration-150">
                          <td className="py-4 px-6 font-mono font-bold text-slate-950 dark:text-white uppercase tracking-wide">
                            {coupon.code}
                          </td>
                          <td className="py-4 px-6 font-bold text-cyan-600">{coupon.discountPercent}% OFF</td>
                          <td className="py-4 px-6 text-slate-500">{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${coupon.isActive && !isExpired
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-150 text-red-700"
                              }`}>
                              {isExpired ? "Expired" : coupon.isActive ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setCurrentCouponEdit(coupon);
                                  setCouponForm({
                                    code: coupon.code,
                                    discountPercent: coupon.discountPercent,
                                    expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : "",
                                    isActive: coupon.isActive ?? true,
                                  });
                                  setShowCouponModal(true);
                                }}
                                className="text-cyan-600 hover:text-cyan-700 bg-cyan-50 dark:bg-cyan-950/30 dark:text-cyan-400 p-2.5 rounded-lg cursor-pointer"
                                title="Edit Coupon"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(coupon._id)}
                                className="text-red-650 hover:text-red-700 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg cursor-pointer"
                                title="Delete Coupon"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CONTENT CONTROL (PAGES/POSTS/CATEGORIES/TAGS) */}
          {activeTab === "content" && (
            <div className="space-y-8">
              {/* Categories & Tags Management */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className={`p-6 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                  <h3 className="text-sm font-bold font-display mb-4">Categories</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map((c) => (
                      <span key={c._id} className="bg-slate-100 dark:bg-slate-850 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">({c.slug})</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                  <h3 className="text-sm font-bold font-display mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((t) => (
                      <span key={t._id} className="bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900/50 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
                        #{t.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Pages */}
              <div className={`p-6 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold font-display">Website Pages</h3>
                  <button
                    onClick={() => {
                      setCurrentPageEdit(null);
                      setPageForm({ title: "", content: "", status: "draft" });
                      setShowPageModal(true);
                    }}
                    className="bg-cyan-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-cyan-500 cursor-pointer shadow-sm"
                  >
                    Add Page
                  </button>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b ${darkMode ? "border-slate-850" : "border-slate-100"} text-slate-450 font-bold uppercase`}>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold divide-y divide-slate-100 dark:divide-slate-850">
                    {pages.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{p.title}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">/{p.slug}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                            }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setCurrentPageEdit(p);
                              setPageForm({ title: p.title, content: p.content, status: p.status });
                              setShowPageModal(true);
                            }}
                            className="text-cyan-650 hover:text-cyan-700"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeletePage(p._id)} className="text-red-650 hover:text-red-700">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Posts / Blog */}
              <div className={`p-6 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-sm`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold font-display">Blog Posts</h3>
                  <button
                    onClick={() => {
                      setCurrentPostEdit(null);
                      setPostForm({ title: "", content: "", categoryId: categories[0]?._id || "", tags: [], status: "draft" });
                      setShowPostModal(true);
                    }}
                    className="bg-cyan-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-cyan-500 cursor-pointer shadow-sm"
                  >
                    Create Post
                  </button>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b ${darkMode ? "border-slate-850" : "border-slate-100"} text-slate-450 font-bold uppercase`}>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold divide-y divide-slate-100 dark:divide-slate-850">
                    {posts.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.title}</td>
                        <td className="py-3.5 px-4 text-slate-500">{p.categoryId?.name || "General"}</td>
                        <td className="py-3.5 px-4 text-slate-400">{p.authorId?.name || "Admin"}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                            }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setCurrentPostEdit(p);
                              setPostForm({ title: p.title, content: p.content, categoryId: p.categoryId?._id || "", tags: p.tags?.map((t) => t._id) || [], status: p.status });
                              setShowPostModal(true);
                            }}
                            className="text-cyan-650 hover:text-cyan-700"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeletePost(p._id)} className="text-red-650 hover:text-red-700">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: GLOBAL SETTINGS PANEL (ADMIN ONLY) */}
          {activeTab === "settings" && userData.role === "Admin" && (
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)] w-full py-4">
              <div className={`p-8 bg-white dark:bg-slate-900 border ${darkMode ? "border-slate-800" : "border-slate-200"} rounded-2xl shadow-sm max-w-2xl w-full`}>
                <h3 className="text-base font-bold font-display mb-6">Website General Settings</h3>
                <form onSubmit={handleSettingsSubmit} className="space-y-5 text-sm">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-450 font-bold mb-1.5">Site Title</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border outline-none ${darkMode ? "bg-slate-850 border-slate-800 text-white focus:border-cyan-700" : "bg-slate-50 border-slate-200 focus:border-cyan-500"
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-450 font-bold mb-1.5">Currency Code</label>
                    <input
                      type="text"
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border outline-none ${darkMode ? "bg-slate-850 border-slate-800 text-white focus:border-cyan-700" : "bg-slate-50 border-slate-200 focus:border-cyan-500"
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-450 font-bold mb-1.5">Support Contact Email</label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border outline-none ${darkMode ? "bg-slate-850 border-slate-800 text-white focus:border-cyan-700" : "bg-slate-50 border-slate-200 focus:border-cyan-500"
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-450 font-bold mb-1.5">Support Contact Phone</label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border outline-none ${darkMode ? "bg-slate-850 border-slate-800 text-white focus:border-cyan-700" : "bg-slate-50 border-slate-200 focus:border-cyan-500"
                        }`}
                    />
                  </div>

                  {/* Logo Image Upload */}
                  <div>
                    <label className="block text-slate-500 dark:text-slate-450 font-bold mb-1.5">Logo Image</label>
                    <div className="flex items-center gap-4">
                      {settings.logoUrl && (
                        <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded border p-1" />
                      )}
                      <input
                        type="text"
                        placeholder="Logo URL path"
                        value={settings.logoUrl}
                        onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                        className={`flex-1 px-4 py-2.5 rounded-xl border outline-none ${darkMode ? "bg-slate-850 border-slate-800 text-white" : "bg-slate-50 border-slate-200"
                          }`}
                      />
                      <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-650 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2">
                        <FaUpload />
                        <span>Upload Logo</span>
                        <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-850 pt-5">
                    <h4 className="font-bold text-sm mb-4">Social Media Links</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {["facebook", "twitter", "linkedin", "github"].map((network) => (
                        <div key={network}>
                          <label className="block text-slate-400 text-xs font-bold mb-1.5 capitalize">{network}</label>
                          <input
                            type="text"
                            value={settings.socialLinks[network] || ""}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                socialLinks: { ...settings.socialLinks, [network]: e.target.value },
                              })
                            }
                            className={`w-full px-4 py-2.5 rounded-xl border outline-none ${darkMode ? "bg-slate-855 border-slate-800 text-white" : "bg-slate-50 border-slate-200"
                              }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-md cursor-pointer hover:opacity-95"
                  >
                    Save Settings
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 9. MODALS GATES */}
      {/* ========================================================================= */}

      {/* MODAL: ADD/EDIT USER */}
       {/* MODAL: ADD/EDIT USER */}
       {showUserModal && (
         <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 text-slate-800">
           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full relative text-slate-800">
             <button onClick={() => setShowUserModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 cursor-pointer">
               <FaTimes />
             </button>
             <h3 className="text-xl font-bold font-display mb-6 text-slate-800">{currentUserEdit ? "Edit User Properties" : "Create New User Account"}</h3>
             <form onSubmit={handleUserSubmit} className="space-y-4 text-sm">
               <div>
                 <label className="block text-slate-500 font-bold mb-1">Name</label>
                 <input
                   type="text"
                   required
                   value={userForm.name}
                   onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                   className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-800 transition"
                 />
               </div>
               <div>
                 <label className="block text-slate-500 font-bold mb-1">Email</label>
                 <input
                   type="email"
                   required
                   value={userForm.email}
                   onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                   className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-800 transition"
                 />
               </div>
               {!currentUserEdit && (
                 <div>
                   <label className="block text-slate-500 font-bold mb-1">Password</label>
                   <input
                     type="password"
                     required
                     value={userForm.password}
                     onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                     className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-800 transition"
                   />
                 </div>
               )}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-slate-500 font-bold mb-1">User Role</label>
                   <select
                     value={userForm.role}
                     onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                     className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer outline-none text-slate-800 transition"
                   >
                     <option value="User">User</option>
                     <option value="Staff">Staff</option>
                     <option value="Editor">Editor</option>
                     <option value="Admin">Admin</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-slate-500 font-bold mb-1">Credits Balance</label>
                   <input
                     type="number"
                     value={userForm.credits}
                     onChange={(e) => setUserForm({ ...userForm, credits: e.target.value })}
                     className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-800 transition"
                   />
                 </div>
               </div>
               <button type="submit" className="w-full mt-6 bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-500 shadow-md">
                 Save User
               </button>
             </form>
           </motion.div>
         </div>
       )}

      {/* MODAL: ADD/EDIT PRICING PLAN */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 text-slate-800">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full relative text-slate-800 dark:text-slate-100">
            <button onClick={() => setShowPlanModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 cursor-pointer">
              <FaTimes />
            </button>
            <h3 className="text-xl font-bold font-display mb-6 text-slate-800 dark:text-white">{currentPlanEdit ? "Edit Pricing Tier" : "Create Pricing Tier"}</h3>
            <form onSubmit={handlePlanSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Amount (Rs)</label>
                  <input
                    type="number"
                    required
                    value={planForm.amount}
                    onChange={(e) => setPlanForm({ ...planForm, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Credits Reward</label>
                  <input
                    type="number"
                    required
                    value={planForm.credits}
                    onChange={(e) => setPlanForm({ ...planForm, credits: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Badge (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Popular, Best Value"
                  value={planForm.badge}
                  onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Description</label>
                <textarea
                  required
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none h-16 resize-none text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Features (One per line)</label>
                <textarea
                  required
                  value={planForm.features}
                  placeholder="e.g. 500 AI Credits&#10;Full History Tracking&#10;Priority Server Access"
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none h-24 resize-none font-mono text-xs text-slate-800 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="planActive"
                  checked={planForm.isActive}
                  onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-cyan-600 rounded cursor-pointer"
                />
                <label htmlFor="planActive" className="text-slate-650 dark:text-slate-300 font-bold text-xs select-none cursor-pointer">
                  Activate plan instantly for purchase
                </label>
              </div>
              <button type="submit" className="w-full mt-6 bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-500 shadow-md">
                Save Plan
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT DISCOUNT COUPON */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 text-slate-800 dark:text-slate-100">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-8 rounded-3xl border shadow-2xl max-w-md w-full relative ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
            <button onClick={() => setShowCouponModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 cursor-pointer">
              <FaTimes />
            </button>
            <h3 className="text-xl font-bold font-display mb-6">{currentCouponEdit ? "Edit Coupon Code" : "Create Coupon Code"}</h3>
            <form onSubmit={handleCouponSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Coupon Code (e.g. EXTRA50)</label>
                <input
                  type="text"
                  required
                  placeholder="CODE"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className={`w-full px-4 py-2 rounded-xl outline-none uppercase font-mono font-bold tracking-wider border ${darkMode ? "bg-slate-850 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Discount Percent</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={couponForm.discountPercent}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercent: Number(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-xl outline-none border ${darkMode ? "bg-slate-850 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-450 font-bold mb-1">Expires Date</label>
                  <input
                    type="date"
                    required
                    value={couponForm.expiresAt}
                    onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl outline-none text-xs border ${darkMode ? "bg-slate-850 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-cyan-600 rounded cursor-pointer accent-cyan-600"
                />
                <label htmlFor="couponActive" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Active / Enabled
                </label>
              </div>
              <button type="submit" className="w-full mt-6 bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-500 shadow-md cursor-pointer">
                {currentCouponEdit ? "Update Coupon" : "Generate Coupon"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: ADMIN PROFILE EDIT & PASSWORD */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 text-slate-800">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full relative">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 cursor-pointer">
              <FaTimes />
            </button>
            <h3 className="text-xl font-bold font-display mb-6">Profile Settings</h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-700"
                />
              </div>
              <div className="border-t border-slate-100 pt-4 mt-2">
                <p className="text-slate-400 text-xs font-bold mb-3 flex items-center gap-1.5">
                  <FaKey />
                  <span>Update Password (Optional)</span>
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-500 text-xs font-bold mb-1">New Password</label>
                    <input
                      type="password"
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-bold mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full mt-6 bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-500 shadow-md cursor-pointer">
                Save Profile
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: ADD/EDIT BLOG POST */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 text-slate-800">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full relative">
            <button onClick={() => setShowPostModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 cursor-pointer">
              <FaTimes />
            </button>
            <h3 className="text-xl font-bold font-display mb-6">{currentPostEdit ? "Edit Blog Post" : "Write Blog Post"}</h3>
            <form onSubmit={handlePostSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Category</label>
                  <select
                    value={postForm.categoryId}
                    onChange={(e) => setPostForm({ ...postForm, categoryId: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Status</label>
                  <select
                    value={postForm.status}
                    onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Post Content</label>
                <textarea
                  required
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none h-48 resize-none font-semibold text-slate-650"
                />
              </div>
              <button type="submit" className="w-full mt-6 bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-500 shadow-md">
                Publish Post
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: ADD/EDIT STATIC PAGE */}
      {showPageModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 text-slate-800">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full relative">
            <button onClick={() => setShowPageModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 cursor-pointer">
              <FaTimes />
            </button>
            <h3 className="text-xl font-bold font-display mb-6">{currentPageEdit ? "Edit Custom Page" : "Create Custom Page"}</h3>
            <form onSubmit={handlePageSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  value={pageForm.title}
                  onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Status</label>
                <select
                  value={pageForm.status}
                  onChange={(e) => setPageForm({ ...pageForm, status: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">HTML/Markdown Content</label>
                <textarea
                  required
                  value={pageForm.content}
                  onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none h-48 resize-none font-semibold text-slate-650"
                />
              </div>
              <button type="submit" className="w-full mt-6 bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-500 shadow-md">
                Save Page
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
