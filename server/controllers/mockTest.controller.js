import MockTest from "../models/mockTest.model.js";
import User from "../models/user.model.js";
import { askAi } from "../services/openRouter.service.js";

export const generateMockTest = async (req, res) => {
  try {
    const {
      companyName,
      testCategory,
      questionCount = 10,
      difficulty = "Standard",
    } = req.body;

    if (!companyName || !testCategory) {
      return res
        .status(400)
        .json({ message: "Company Name and Test Category are required." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.credits < 15) {
      return res
        .status(400)
        .json({
          message:
            "Not enough credits. Minimum 15 required to generate a custom company mock test.",
        });
    }

    const count = Number(questionCount) || 10;
    const duration = Math.round(count * 1.5); // e.g. 15 mins for 10 questions

    const systemPrompt = `You are an expert AI Recruitment Exam Designer and Technical Architect with comprehensive knowledge of global corporate recruitment patterns.
Your task is to conduct deep internal pattern retrieval on the recruitment exam and interview syllabus of: "${companyName}".

Target Test Category: "${testCategory}"
Target Question Count: exactly ${count} questions.
Target Difficulty Level: "${difficulty}"

Strict Rules:
1. Research and incorporate the exact question styles, time constraints, signature topics, and difficulty distribution typical for ${companyName} (${testCategory}).
2. If Test Category is "Quantitative Aptitude", focus on calculation speed, numerical reasoning, algebra, geometry, probability, time-work, number systems, etc., exactly as tested by ${companyName}.
3. If Test Category is "Verbal Ability", focus on reading comprehension, vocabulary, grammar correction, sentence completion, and business English.
4. If Test Category is "Logical Reasoning", focus on puzzles, syllogisms, data sufficiency, coding-decoding, blood relations, and seating arrangements.
5. If Test Category is "Company-Specific Technical", focus on core domain concepts, coding logic, data structures, algorithms, SQL/DBs, architecture, or specific tools/technologies emphasized by ${companyName}.
6. For every question, provide exactly 4 distinct multiple choice options ("A. ...", "B. ...", "C. ...", "D. ...") and specify the correctOptionIndex (0 for A, 1 for B, 2 for C, 3 for D).
7. For every question, provide a detailed step-by-step "explanation" explaining clearly why the correct option is right and shortcut techniques for solving it efficiently.
8. Output MUST strictly be valid JSON without any markdown formatting, backticks, or extra commentary.

Return JSON in exactly this structure:
{
  "companyName": "${companyName}",
  "testCategory": "${testCategory}",
  "testSummary": "Detailed summary of what ${companyName} assesses in this round and tips to succeed.",
  "durationMinutes": ${duration},
  "questions": [
    {
      "id": 1,
      "topic": "Topic Name",
      "difficulty": "Medium",
      "questionText": "Clear question scenario or problem statement",
      "options": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
      "correctOptionIndex": 0,
      "explanation": "Detailed step by step solution"
    }
  ]
}`;

    const userPrompt = `Generate the ${count}-question ${companyName} ${testCategory} mock test right now in pure JSON format.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const aiResponse = await askAi(messages);

    let cleanJson = aiResponse.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(cleanJson);

    if (
      !parsed.questions ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0
    ) {
      return res
        .status(500)
        .json({
          message: "AI failed to generate valid questions. Please try again.",
        });
    }

    // Deduct credits
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $inc: { credits: -15 },
      },
      { new: true },
    );

    // Create record in DB
    const newMockTest = await MockTest.create({
      userId: req.userId,
      companyName: parsed.companyName || companyName,
      testCategory: parsed.testCategory || testCategory,
      testSummary:
        parsed.testSummary ||
        `Tailored ${testCategory} preparation test for ${companyName}.`,
      durationMinutes: parsed.durationMinutes || duration,
      questions: parsed.questions,
      totalQuestions: parsed.questions.length,
      status: "InProgress",
    });

    // Create sanitized questions without answers/explanations for active exam
    const sanitizedQuestions = parsed.questions.map((q) => ({
      id: q.id,
      topic: q.topic,
      difficulty: q.difficulty,
      questionText: q.questionText,
      options: q.options,
    }));

    return res.json({
      success: true,
      mockTestId: newMockTest._id,
      companyName: newMockTest.companyName,
      testCategory: newMockTest.testCategory,
      testSummary: newMockTest.testSummary,
      durationMinutes: newMockTest.durationMinutes,
      totalQuestions: newMockTest.totalQuestions,
      questions: sanitizedQuestions,
      userCredits: updatedUser.credits,
    });
  } catch (error) {
    console.error("Generate Mock Test Error:", error);
    return res
      .status(500)
      .json({
        message: error.message || "Failed to generate company mock test.",
      });
  }
};

export const submitMockTest = async (req, res) => {
  try {
    const { mockTestId, userAnswers = {} } = req.body;

    if (!mockTestId) {
      return res.status(400).json({ message: "Mock Test ID is required." });
    }

    const mockTest = await MockTest.findOne({
      _id: mockTestId,
      userId: req.userId,
    });
    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found." });
    }

    let correctCount = 0;
    mockTest.questions.forEach((q) => {
      const selected = userAnswers[q.id];
      if (
        selected !== undefined &&
        Number(selected) === Number(q.correctOptionIndex)
      ) {
        correctCount += 1;
      }
    });

    const total = mockTest.questions.length || 1;
    const accuracy = Math.round((correctCount / total) * 100);

    mockTest.userAnswers = userAnswers;
    mockTest.score = correctCount;
    mockTest.accuracy = accuracy;
    mockTest.status = "Completed";

    await mockTest.save();

    return res.json({
      success: true,
      mockTest,
    });
  } catch (error) {
    console.error("Submit Mock Test Error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to submit mock test." });
  }
};

export const getUserMockTests = async (req, res) => {
  try {
    const mockTests = await MockTest.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, mockTests });
  } catch (error) {
    console.error("Get User Mock Tests Error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch mock test history." });
  }
};

export const getMockTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const mockTest = await MockTest.findOne({ _id: id, userId: req.userId });
    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found." });
    }
    return res.json({ success: true, mockTest });
  } catch (error) {
    console.error("Get Mock Test By ID Error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch mock test details." });
  }
};

export const deleteMockTest = async (req, res) => {
  try {
    const mockTest = await MockTest.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found." });
    }

    return res.json({ success: true, message: "Mock test deleted successfully." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Mock test not found." });
    }
    console.error("Delete Mock Test Error:", error);
    return res.status(500).json({ message: "Failed to delete mock test." });
  }
};