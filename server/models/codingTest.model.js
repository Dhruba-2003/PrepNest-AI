import mongoose from "mongoose";

const codingTestSchema = new mongoose.Schema(
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
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    language: {
      type: String,
      enum: ["python", "javascript", "cpp", "java", "c"],
      default: "python",
    },
    problem: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      inputFormat: { type: String, required: true },
      outputFormat: { type: String, required: true },
      constraints: { type: String, required: true },
      sampleInput: { type: String, required: true },
      sampleOutput: { type: String, required: true },
      starterCode: {
        python: { type: String, default: "" },
        javascript: { type: String, default: "" },
        cpp: { type: String, default: "" },
        java: { type: String, default: "" },
        c: { type: String, default: "" },
      },
    },
    testCases: [
      {
        id: { type: Number },
        input: { type: String },
        expectedOutput: { type: String },
        isHidden: { type: Boolean, default: false },
      },
    ],
    submission: {
      code: { type: String, default: "" },
      submittedAt: { type: Date },
      status: {
        type: String,
        enum: [
          "Not Submitted",
          "Passed",
          "Failed",
          "Compile Error",
          "Time Limit Exceeded",
          "Runtime Error",
        ],
        default: "Not Submitted",
      },
      score: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      executionTimeMs: { type: Number, default: 0 },
      memoryKB: { type: Number, default: 0 },
      timeComplexity: { type: String, default: "" },
      spaceComplexity: { type: String, default: "" },
      feedback: { type: String, default: "" },
      cleanCodeScore: { type: Number, default: 0 },
      testCaseResults: [
        {
          testCaseId: { type: Number },
          input: { type: String },
          expectedOutput: { type: String },
          actualOutput: { type: String },
          passed: { type: Boolean },
          executionTimeMs: { type: Number },
          memoryKB: { type: Number },
        },
      ],
    },
  },
  { timestamps: true },
);

const CodingTest = mongoose.model("CodingTest", codingTestSchema);
export default CodingTest;
