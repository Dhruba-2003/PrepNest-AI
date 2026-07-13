import CodingTest from "../models/codingTest.model.js";
import User from "../models/user.model.js";
import { askAi } from "../services/openRouter.service.js";

export const generateCodingChallenge = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      companyName = "Amazon",
      difficulty = "Medium",
      language = "python",
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.credits < 20) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough credits! You need at least 20 credits to generate an AI company coding assessment.",
      });
    }

    // Construct AI prompt for problem generation
    const systemPrompt = `You are a Principal Software Engineer and Technical Interviewer at ${companyName}.
Your task is to generate an authentic, high-quality coding assessment challenge suitable for a ${difficulty} difficulty coding round at ${companyName}.

You MUST output ONLY a valid JSON object without any markdown formatting, backticks, or conversational text. The JSON structure MUST exactly match:
{
  "title": "String - Concise problem title (e.g., 'Amazon Logistics Route Optimizer')",
  "description": "String - Detailed problem statement with clear background story and requirements.",
  "inputFormat": "String - Explanation of input parameters and structure.",
  "outputFormat": "String - Explanation of expected output structure.",
  "constraints": "String - Precise numerical constraints (e.g., '1 <= N <= 10^5')",
  "sampleInput": "String - A clear sample input",
  "sampleOutput": "String - The exact output corresponding to sampleInput",
  "starterCode": {
    "python": "def solve():\\n    # Write code here\\n    pass",
    "javascript": "function solve() {\\n    // Write code here\\n}",
    "cpp": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    // Write code here\\n    return 0;\\n}",
    "java": "public class Solution {\\n    public static void main(String[] args) {\\n        // Write code here\\n    }\\n}",
    "c": "#include <stdio.h>\\n\\nint main() {\\n    // Write code here\\n    return 0;\\n}"
  },
  "testCases": [
    { "id": 1, "input": "...", "expectedOutput": "...", "isHidden": false },
    { "id": 2, "input": "...", "expectedOutput": "...", "isHidden": false },
    { "id": 3, "input": "...", "expectedOutput": "...", "isHidden": true },
    { "id": 4, "input": "...", "expectedOutput": "...", "isHidden": true },
    { "id": 5, "input": "...", "expectedOutput": "...", "isHidden": true }
  ]
}

Ensure the problem involves realistic algorithmic thinking (Data Structures, Dynamic Programming, Greedy, Pointers, Graph, or Math) reflecting actual ${companyName} interviews.`;

    const rawAiResponse = await askAi([
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate a ${difficulty} coding challenge for ${companyName} in ${language}.`,
      },
    ]);

    let parsedProblem;
    try {
      const cleanJson = rawAiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedProblem = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("AI JSON parse error in coding challenge:", parseError);
      return res
        .status(500)
        .json({
          success: false,
          message: "AI generated invalid challenge format. Please try again.",
        });
    }

    // Deduct 20 credits
    user.credits -= 20;
    await user.save();

    const newCodingTest = await CodingTest.create({
      userId,
      companyName,
      difficulty,
      language,
      problem: {
        title: parsedProblem.title,
        description: parsedProblem.description,
        inputFormat: parsedProblem.inputFormat,
        outputFormat: parsedProblem.outputFormat,
        constraints: parsedProblem.constraints,
        sampleInput: parsedProblem.sampleInput,
        sampleOutput: parsedProblem.sampleOutput,
        starterCode: parsedProblem.starterCode,
      },
      testCases: parsedProblem.testCases || [],
    });

    return res.status(201).json({
      success: true,
      message: "Coding challenge generated successfully!",
      codingTest: newCodingTest,
      userCredits: user.credits,
    });
  } catch (error) {
    console.error("Error generating coding challenge:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error generating challenge." });
  }
};

export const executeCode = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      codingTestId,
      code,
      language = "python",
      isSubmission = false,
    } = req.body;

    if (!code || !code.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide valid code to run." });
    }

    const codingTest = await CodingTest.findOne({ _id: codingTestId, userId });
    if (!codingTest) {
      return res
        .status(404)
        .json({ success: false, message: "Coding test not found" });
    }

    // Select test cases to evaluate against
    const testCasesToRun = isSubmission
      ? codingTest.testCases
      : codingTest.testCases.filter((tc) => !tc.isHidden);

    const evalPrompt = `You are an expert deterministic Virtual Code Execution Sandbox and Senior Algorithm Evaluator.
You must accurately evaluate the following candidate code written in "${language}" against the provided test cases.

Problem Title: ${codingTest.problem.title}
Problem Constraints: ${codingTest.problem.constraints}
Candidate Code:
\`\`\`${language}
${code}
\`\`\`

Test Cases to Evaluate:
${JSON.stringify(testCasesToRun, null, 2)}

You MUST output ONLY a valid JSON object without markdown formatting, backticks, or conversational commentary. The exact JSON schema must be:
{
  "status": "String ('Passed' if all test cases pass cleanly, 'Failed' if wrong answers occur, 'Compile Error' if syntax/compilation fails, 'Time Limit Exceeded' if infinite loop/inefficient, 'Runtime Error' if exceptions occur)",
  "score": "Number between 0 and 100 representing percentage of test cases passed",
  "accuracy": "Number representing percentage accuracy",
  "executionTimeMs": "Number - Realistic estimated execution time across test cases in milliseconds (e.g. 14.2)",
  "memoryKB": "Number - Realistic estimated peak memory consumption in KB (e.g. 14200)",
  "timeComplexity": "String - Big-O time complexity of the candidate's code (e.g., 'O(N log N)')",
  "spaceComplexity": "String - Big-O space complexity (e.g., 'O(N)')",
  "cleanCodeScore": "Number between 0 and 100 rating code readability, variable naming, and efficiency",
  "feedback": "String - Detailed, encouraging code review explaining what worked well, edge cases, and exactly how to optimize the algorithm further.",
  "testCaseResults": [
    {
      "testCaseId": "Number",
      "input": "String",
      "expectedOutput": "String",
      "actualOutput": "String - The actual output produced by candidate code or exact error trace",
      "passed": "Boolean - true if actualOutput matches expectedOutput",
      "executionTimeMs": "Number - e.g. 2.5",
      "memoryKB": "Number - e.g. 13800"
    }
  ]
}`;

    const rawEvalResponse = await askAi([
      { role: "system", content: evalPrompt },
      {
        role: "user",
        content:
          "Execute and evaluate the code now and return strictly formatted JSON.",
      },
    ]);

    let parsedResult;
    try {
      const cleanEvalJson = rawEvalResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedResult = JSON.parse(cleanEvalJson);
    } catch (parseError) {
      console.error("AI JSON parse error during code execution:", parseError);
      return res
        .status(500)
        .json({
          success: false,
          message:
            "Virtual execution engine encountered a parsing issue. Please try running again.",
        });
    }

    if (isSubmission) {
      codingTest.submission = {
        code: code,
        submittedAt: new Date(),
        status: parsedResult.status || "Failed",
        score: parsedResult.score || 0,
        accuracy: parsedResult.accuracy || 0,
        executionTimeMs: parsedResult.executionTimeMs || 0,
        memoryKB: parsedResult.memoryKB || 0,
        timeComplexity: parsedResult.timeComplexity || "Unknown",
        spaceComplexity: parsedResult.spaceComplexity || "Unknown",
        feedback: parsedResult.feedback || "",
        cleanCodeScore: parsedResult.cleanCodeScore || 0,
        testCaseResults: parsedResult.testCaseResults || [],
      };
      await codingTest.save();
    }

    return res.status(200).json({
      success: true,
      result: parsedResult,
      isSubmission: isSubmission,
      codingTest: isSubmission ? codingTest : undefined,
    });
  } catch (error) {
    console.error("Error executing code:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during code execution." });
  }
};

export const getUserCodingTests = async (req, res) => {
  try {
    const userId = req.userId;
    const codingTests = await CodingTest.find({ userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, codingTests });
  } catch (error) {
    console.error("Error fetching coding tests history:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch coding test history.",
      });
  }
};

export const getCodingTestById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const codingTest = await CodingTest.findOne({ _id: id, userId });
    if (!codingTest) {
      return res
        .status(404)
        .json({ success: false, message: "Coding test not found" });
    }
    return res.status(200).json({ success: true, codingTest });
  } catch (error) {
    console.error("Error fetching coding test by ID:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch coding test details.",
      });
  }
};

export const deleteCodingTest = async (req, res) => {
  try {
    const codingTest = await CodingTest.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!codingTest) {
      return res.status(404).json({ success: false, message: "Coding test not found" });
    }

    return res.status(200).json({ success: true, message: "Coding test deleted successfully." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ success: false, message: "Coding test not found" });
    }
    console.error("Error deleting coding test:", error);
    return res.status(500).json({ success: false, message: "Failed to delete coding test." });
  }
};