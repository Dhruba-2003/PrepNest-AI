import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    logoUrl: {
      type: String,
      default: "",
    },
    siteName: {
      type: String,
      default: "PrepNest AI",
    },
    contactEmail: {
      type: String,
      default: "support@prepnest.ai",
    },
    contactPhone: {
      type: String,
      default: "+1-555-0199",
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    currency: {
      type: String,
      default: "INR",
    },
  },
  { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);
export default Setting;
