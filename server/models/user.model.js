import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    credits: {
      type: Number,
      default: 200,
    },
    role: {
      type: String,
      enum: ["Admin", "Editor", "Staff", "User"],
      default: "User",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
