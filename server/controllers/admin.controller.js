import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import Payment from "../models/payment.model.js";
import Plan from "../models/plan.model.js";
import Coupon from "../models/coupon.model.js";
import ContactMessage from "../models/contactMessage.model.js";
import Setting from "../models/setting.model.js";
import ActivityLog from "../models/activityLog.model.js";
import { Category, Tag, Post, Page } from "../models/content.model.js";
import crypto from "crypto";

// Helper to log administrative activity
const logActivity = async (userId, action, details, req) => {
  try {
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    await ActivityLog.create({
      userId,
      action,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

// 1. Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await Interview.countDocuments();

    // Sum paid payments
    const payments = await Payment.find({ status: "paid" });
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Dynamic charts data (User registrations by month/day)
    const userStats = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const revenueStats = await Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Mode distribution (HR vs Technical)
    const hrCount = await Interview.countDocuments({ mode: "HR" });
    const techCount = await Interview.countDocuments({ mode: "Technical" });

    // Recent activity logs
    const recentLogs = await ActivityLog.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      metrics: {
        totalUsers,
        totalInterviews,
        totalRevenue,
        hrCount,
        techCount,
      },
      userStats: userStats.map((item) => ({ month: item._id, users: item.count })),
      revenueStats: revenueStats.map((item) => ({ month: item._id, revenue: item.total })),
      recentLogs,
    });
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch stats: ${error.message}` });
  }
};

// 2. Users Management
export const getUsers = async (req, res) => {
  try {
    const { search = "", role = "", page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 });

    res.json({
      users,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch users: ${error.message}` });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "User", credits = 200 } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      credits,
    });

    await logActivity(req.userId, "USER_CREATE", `Created user ${email} with role ${role}`, req);

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: `Failed to create user: ${error.message}` });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role, credits } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (credits !== undefined) user.credits = Number(credits);

    await user.save();
    await logActivity(req.userId, "USER_UPDATE", `Updated user ${user.email} configurations`, req);

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: `Failed to update user: ${error.message}` });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await logActivity(req.userId, "USER_DELETE", `Deleted user ${user.email}`, req);
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: `Failed to delete user: ${error.message}` });
  }
};

// 3. Plans CRUD
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ amount: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch plans: ${error.message}` });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { name, amount, credits, description, features, badge, isActive } = req.body;

    const newPlan = await Plan.create({
      name,
      amount,
      credits,
      description,
      features,
      badge,
      isActive,
    });

    await logActivity(req.userId, "PLAN_CREATE", `Created pricing plan: ${name}`, req);
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ message: `Failed to create plan: ${error.message}` });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Plan.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Plan not found." });
    }

    await logActivity(req.userId, "PLAN_UPDATE", `Updated pricing plan: ${updated.name}`, req);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: `Failed to update plan: ${error.message}` });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    await logActivity(req.userId, "PLAN_DELETE", `Deleted pricing plan: ${plan.name}`, req);
    res.json({ message: "Plan deleted." });
  } catch (error) {
    res.status(500).json({ message: `Failed to delete plan: ${error.message}` });
  }
};

// 4. Coupons CRUD
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch coupons: ${error.message}` });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, expiresAt, isActive } = req.body;

    const newCoupon = await Coupon.create({
      code,
      discountPercent,
      expiresAt,
      isActive,
    });

    await logActivity(req.userId, "COUPON_CREATE", `Created coupon code: ${code}`, req);
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: `Failed to create coupon: ${error.message}` });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    await logActivity(req.userId, "COUPON_UPDATE", `Updated coupon: ${updated.code}`, req);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: `Failed to update coupon: ${error.message}` });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    await logActivity(req.userId, "COUPON_DELETE", `Deleted coupon: ${coupon.code}`, req);
    res.json({ message: "Coupon deleted." });
  } catch (error) {
    res.status(500).json({ message: `Failed to delete coupon: ${error.message}` });
  }
};

// 5. Contact Form Messages
export const getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch messages: ${error.message}` });
  }
};

export const markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: `Failed to mark message read: ${error.message}` });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }
    res.json({ message: "Message deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: `Failed to delete message: ${error.message}` });
  }
};

// Public helper to submit contact messages from front-end
export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: `Failed to send message: ${error.message}` });
  }
};

// 6. Website Settings Management
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: `Failed to fetch settings: ${error.message}` });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({});
    }

    const { logoUrl, siteName, contactEmail, contactPhone, socialLinks, currency } = req.body;

    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (siteName !== undefined) settings.siteName = siteName;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (contactPhone !== undefined) settings.contactPhone = contactPhone;
    if (socialLinks !== undefined) settings.socialLinks = socialLinks;
    if (currency !== undefined) settings.currency = currency;

    await settings.save();
    await logActivity(req.userId, "SETTINGS_UPDATE", "Updated website general settings", req);

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: `Failed to update settings: ${error.message}` });
  }
};

// 7. Content Management (Category, Tag, Post, Page CRUDs)
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTag = async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTag = async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.json({ message: "Tag deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("categoryId", "name slug")
      .populate("tags", "name slug")
      .populate("authorId", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const post = await Post.create({
      ...req.body,
      authorId: req.userId,
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ title: 1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPage = async (req, res) => {
  try {
    const page = await Page.create(req.body);
    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePage = async (req, res) => {
  try {
    await Page.findByIdAndDelete(req.params.id);
    res.json({ message: "Page deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Upload File
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    // Return path to file
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ fileUrl });
  } catch (error) {
    res.status(500).json({ message: `Upload failed: ${error.message}` });
  }
};
