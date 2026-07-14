import User from "../models/user.model.js";
import crypto from "crypto";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user does not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to get currentUser ${error}` });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (name) user.name = name;
    if (password) {
      user.password = crypto.createHash("sha256").update(password).digest("hex");
    }

    await user.save();
    return res.status(200).json({ message: "Profile updated successfully.", user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to update profile: ${error.message}` });
  }
};
