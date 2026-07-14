import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { isAdmin, isStaff } from "../middlewares/isAdmin.js";
import { upload } from "../middlewares/multer.js";
import {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getMessages,
  markMessageRead,
  deleteMessage,
  submitContactMessage,
  getSettings,
  updateSettings,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getPages,
  createPage,
  updatePage,
  deletePage,
  uploadFile,
} from "../controllers/admin.controller.js";

const adminRouter = express.Router();

// 1. Public endpoints
adminRouter.get("/public/plans", async (req, res, next) => {
  req.query.activeOnly = "true";
  next();
}, getPlans);
adminRouter.get("/public/settings", getSettings);
adminRouter.post("/public/contact", submitContactMessage);

// 2. Dashboard Analytics (Staff & Admin)
adminRouter.get("/stats", isAuth, isStaff, getDashboardStats);

// 3. User Management (Admin only)
adminRouter.get("/users", isAuth, isAdmin, getUsers);
adminRouter.post("/users", isAuth, isAdmin, createUser);
adminRouter.put("/users/:id", isAuth, isAdmin, updateUser);
adminRouter.delete("/users/:id", isAuth, isAdmin, deleteUser);

// 4. Plan Management (Admin only)
adminRouter.get("/plans", isAuth, isAdmin, getPlans);
adminRouter.post("/plans", isAuth, isAdmin, createPlan);
adminRouter.put("/plans/:id", isAuth, isAdmin, updatePlan);
adminRouter.delete("/plans/:id", isAuth, isAdmin, deletePlan);

// 5. Coupon Management (Admin only)
adminRouter.get("/coupons", isAuth, isAdmin, getCoupons);
adminRouter.post("/coupons", isAuth, isAdmin, createCoupon);
adminRouter.put("/coupons/:id", isAuth, isAdmin, updateCoupon);
adminRouter.delete("/coupons/:id", isAuth, isAdmin, deleteCoupon);

// 6. Messages Management (Staff & Admin)
adminRouter.get("/messages", isAuth, isStaff, getMessages);
adminRouter.put("/messages/:id/read", isAuth, isStaff, markMessageRead);
adminRouter.delete("/messages/:id", isAuth, isStaff, deleteMessage);

// 7. Site Settings Management (Admin only)
adminRouter.get("/settings", isAuth, isAdmin, getSettings);
adminRouter.put("/settings", isAuth, isAdmin, updateSettings);

// 8. Content Management (Category, Tag, Post, Page - Staff & Admin)
adminRouter.get("/content/categories", isAuth, isStaff, getCategories);
adminRouter.post("/content/categories", isAuth, isStaff, createCategory);
adminRouter.put("/content/categories/:id", isAuth, isStaff, updateCategory);
adminRouter.delete("/content/categories/:id", isAuth, isStaff, deleteCategory);

adminRouter.get("/content/tags", isAuth, isStaff, getTags);
adminRouter.post("/content/tags", isAuth, isStaff, createTag);
adminRouter.put("/content/tags/:id", isAuth, isStaff, updateTag);
adminRouter.delete("/content/tags/:id", isAuth, isStaff, deleteTag);

adminRouter.get("/content/posts", isAuth, isStaff, getPosts);
adminRouter.post("/content/posts", isAuth, isStaff, createPost);
adminRouter.put("/content/posts/:id", isAuth, isStaff, updatePost);
adminRouter.delete("/content/posts/:id", isAuth, isStaff, deletePost);

adminRouter.get("/content/pages", isAuth, isStaff, getPages);
adminRouter.post("/content/pages", isAuth, isStaff, createPage);
adminRouter.put("/content/pages/:id", isAuth, isStaff, updatePage);
adminRouter.delete("/content/pages/:id", isAuth, isStaff, deletePage);

// 9. Upload manager (Staff & Admin)
adminRouter.post("/upload", isAuth, isStaff, upload.single("file"), uploadFile);

export default adminRouter;
