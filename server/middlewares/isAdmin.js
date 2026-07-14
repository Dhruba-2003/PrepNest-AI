import User from "../models/user.model.js";

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: `isAdmin middleware error: ${error.message}` });
  }
};

export const isStaff = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !["Admin", "Editor", "Staff"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied. Administrative role required." });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: `isStaff middleware error: ${error.message}` });
  }
};
