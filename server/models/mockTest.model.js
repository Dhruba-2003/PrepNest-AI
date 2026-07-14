import mongoose from "mongoose";

const mockQuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  topic: { type: String, default: "General" },
  difficulty: { type: String, default: "Medium" },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const mockTestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    testCategory: {
      type: String,
      required: true,
    },
    testSummary: {
      type: String,
    },
    durationMinutes: {
      type: Number,
      default: 15,
    },
    questions: [mockQuestionSchema],
    userAnswers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    score: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["InProgress", "Completed"],
      default: "InProgress",
    },
  },
  { timestamps: true },
);

const MockTest = mongoose.model("MockTest", mockTestSchema);

export default MockTest;
