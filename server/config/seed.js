import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import User from "../models/user.model.js";
import Plan from "../models/plan.model.js";
import Setting from "../models/setting.model.js";
import { Category, Tag } from "../models/content.model.js";
import dns from "dns";

dotenv.config();

const seedDb = async () => {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected.");

    // 1. Seed Admin User
    const adminEmail = "admin@prepnest.ai";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      console.log("Seeding Admin User...");
      const hashedPassword = crypto.createHash("sha256").update("Admin@PrepNest123").digest("hex");

      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "Admin",
        credits: 999999,
      });
      console.log("Admin User seeded: email = admin@prepnest.ai, password = Admin@PrepNest123");
    } else {
      console.log("Admin User already exists.");
      // Ensure the existing admin has Admin role
      existingAdmin.role = "Admin";
      await existingAdmin.save();
    }

    // Promote the user sabujbanerjee420 to Admin if exists
    const candidateUser = await User.findOne({ email: "sabujbanerjee420@gmail.com" });
    if (candidateUser) {
      candidateUser.role = "Admin";
      await candidateUser.save();
      console.log("Promoted sabujbanerjee420@gmail.com to Admin.");
    }

    // 2. Seed Pricing Plans
    const plansCount = await Plan.countDocuments();
    if (plansCount === 0) {
      console.log("Seeding Default Plans...");
      await Plan.create([
        {
          name: "Starter Pack",
          amount: 300,
          credits: 500,
          description: "Great for focused practice and skill improvement.",
          features: [
            "500 AI Interview Credits",
            "Detailed Feedback",
            "Performance Analytics",
            "Full Interview History",
          ],
          badge: "",
          isActive: true,
        },
        {
          name: "Pro Pack",
          amount: 600,
          credits: 1000,
          description: "Best value for serious job preparation.",
          features: [
            "1000 AI Interview Credits",
            "Advanced AI Feedback",
            "Skill Trend Analysis",
            "Priority AI Processing",
          ],
          badge: "Best Value",
          isActive: true,
        },
      ]);
      console.log("Default Plans seeded.");
    } else {
      console.log("Pricing Plans already exist.");
    }

    // 3. Seed Settings
    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0) {
      console.log("Seeding Website Settings...");
      await Setting.create({
        siteName: "PrepNest AI",
        contactEmail: "support@prepnest.ai",
        contactPhone: "+1-555-0199",
        socialLinks: {
          facebook: "https://facebook.com/prepnest",
          twitter: "https://twitter.com/prepnest",
          linkedin: "https://linkedin.com/company/prepnest",
          github: "https://github.com/prepnest",
        },
        currency: "INR",
      });
      console.log("Website Settings seeded.");
    }

    // 4. Seed Content Categories & Tags
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      console.log("Seeding Categories & Tags...");
      await Category.create([
        { name: "Interview Tips", slug: "interview-tips", type: "post" },
        { name: "Technical Guides", slug: "technical-guides", type: "post" },
        { name: "Career Growth", slug: "career-growth", type: "post" },
      ]);
      await Tag.create([
        { name: "React", slug: "react" },
        { name: "AI", slug: "ai" },
        { name: "Mock Interviews", slug: "mock-interviews" },
      ]);
      console.log("Categories and Tags seeded.");
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from Database.");
  }
};

seedDb();
