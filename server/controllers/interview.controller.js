import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const filepath = req.file.path;

    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map((item) => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`,
      },
      {
        role: "user",
        content: resumeText,
      },
    ];

    const aiResponse = await askAi(messages);

    const parsed = JSON.parse(aiResponse);

    fs.unlinkSync(filepath);

    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText,
    });
  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ message: error.message });
  }
};

export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res
        .status(400)
        .json({ message: "Role, Experience and Mode are required." });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.credits < 10) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 10 required.",
      });
    }

    const projectText =
      Array.isArray(projects) && projects.length ? projects.join(", ") : "None";

    const skillsText =
      Array.isArray(skills) && skills.length ? skills.join(", ") : "None";

    const safeResume = resumeText?.trim() || "None";

    const normalizedRole = role.toLowerCase();
    const technicalFocus = normalizedRole.includes("frontend")
      ? "Frontend technologies: JavaScript or TypeScript, React or the stated framework, HTML, CSS, browser rendering, state management, API integration, accessibility, testing, performance, and frontend security."
      : normalizedRole.includes("data analyst") ||
          normalizedRole.includes("data analytics")
        ? "Data analytics technologies: SQL, spreadsheet or BI tools, data cleaning, statistics, dashboards, metrics, data modeling, and analytical methods."
        : `the technologies, tools, and core concepts directly used by a ${role}`;

    const interviewInstructions =
      mode === "Technical"
        ? `
This is a TECHNICAL interview. Generate exactly ten technical questions for the supplied role: ${role}.
Technical focus: ${technicalFocus}
- Every question must test role-specific technical knowledge; all ten questions must be technical.
- Ask about relevant concepts, implementation choices, debugging, architecture, trade-offs, and practical use of the role's technologies.
- Use the candidate's listed skills and projects only when relevant, and prefer them when they match the role.
- Do not ask behavioral, HR, teamwork, motivation, personality, conflict, strengths, weaknesses, or generic challenge questions.
`
        : `
This is an HR interview. Focus on communication, work experience, collaboration, motivation, ownership, and realistic workplace situations.
Do not turn the questions into a technical skills assessment.
`;

    const userPrompt = `
    Role: ${role}
    Experience: ${experience}
    Interview mode: ${mode}
    Projects: ${projectText}
    Skills: ${skillsText}
    Resume: ${safeResume}
    `;
    if (!userPrompt.trim()) {
      return res.status(400).json({
        message: "Prompt content is empty.",
      });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 10 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Questions 1-4: easy
Questions 5-8: medium
Questions 9-10: hard
${interviewInstructions}

Make questions based on the candidate's role, experience, projects, skills, and resume details. The selected interview mode takes priority over generic questions.`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const aiResponse = await askAi(messages);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({
        message: "AI returned empty response.",
      });
    }

    // Clean and parse questions, removing numbering, bullet points, and wrapper quotes
    let questionsArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => {
        if (!q) return false;
        if (q.startsWith("```")) return false;
        const lower = q.toLowerCase();
        if (
          lower.startsWith("here are") ||
          lower.startsWith("here is") ||
          lower.startsWith("sure, here") ||
          lower.includes("interview questions")
        ) {
          return false;
        }
        return true;
      })
      .map((q) => {
        // Strip leading numbers (e.g., "1. ", "10. ", "1) ", "Question 1: ", "- ")
        return q
          .replace(/^\s*(?:Question\s*\d+\s*:\s*|\d+[\s.)-]+\s*|[-*+]\s*)/i, "")
          .replace(/^["']|["']$/g, "") // Strip surrounding quotes
          .trim();
      })
      .filter((q) => q.length > 0);

    // If count is not 10, try to adjust or pad with fallbacks
    if (questionsArray.length < 10) {
      const fallbackQuestions =
        mode === "Technical"
          ? [
              `Can you describe the overall architecture of a recent technical project you worked on and the key decisions you made?`,
              `How do you approach debugging a complex, intermittent issue in production environments?`,
              `What strategies do you use to optimize the performance and load time of your applications?`,
              `How do you keep yourself updated with the latest tools, frameworks, and best practices in the industry?`,
              `Can you explain how you handle state management and data persistence in your applications?`,
              `What is your approach to writing clean, maintainable, and well-tested code?`,
              `How do you ensure security best practices are integrated into your development lifecycle?`,
              `Can you discuss a time you had to make a tough technical trade-off between speed of delivery and code quality?`,
              `How do you handle API integration, error handling, and data synchronization in a distributed setup?`,
              `What is your experience with version control, continuous integration, and automated deployment pipelines?`
            ]
          : [
              `Could you describe a challenging workplace situation you faced and how you resolved it?`,
              `How do you prioritize your tasks when handling multiple projects with tight deadlines?`,
              `Can you share an experience where you had a disagreement with a team member and how you handled it?`,
              `What motivates you in your career, and where do you see yourself professionally in the next few years?`,
              `How do you approach collaborating with cross-functional team members, such as designers or product owners?`,
              `Can you tell me about a time you made a mistake at work and what you learned from it?`,
              `Why are you interested in this specific role and what values do you hope to bring to the team?`,
              `How do you handle constructive criticism and feedback on your work?`,
              `Could you describe your ideal team environment and culture where you perform at your best?`,
              `What strategies do you use to maintain a healthy work-life balance and manage stress?`
            ];

      while (questionsArray.length < 10) {
        const nextFallback = fallbackQuestions[questionsArray.length % fallbackQuestions.length];
        questionsArray.push(nextFallback);
      }
    } else if (questionsArray.length > 10) {
      questionsArray = questionsArray.slice(0, 10);
    }

    user.credits -= 10;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: [
          "easy",
          "easy",
          "easy",
          "easy",
          "medium",
          "medium",
          "medium",
          "medium",
          "hard",
          "hard",
        ][index],
        timeLimit: [60, 60, 60, 60, 90, 90, 90, 90, 120, 120][index],
      })),
    });

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to create interview ${error}` });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);
    const question = interview.questions[questionIndex];

    // If no answer
    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`,
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`,
      },
    ];

    const aiResponse = await askAi(messages);

    let cleanedResponse = aiResponse.trim();
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();
    }

    const parsed = JSON.parse(cleanedResponse);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    await interview.save();

    return res.status(200).json({ feedback: parsed.feedback });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to submit answer ${error}` });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(400).json({ message: "failed to find Interview" });
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to finish Interview ${error}` });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to find currentUser Interview ${error}` });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.status(200).json({ message: "Interview deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to delete interview ${error}` });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: `failed to find currentUser Interview report ${error}`,
      });
  }
};

export const checkAtsCompatibility = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume PDF required" });
    }
    const { jobRole, jobDescription } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.credits < 5) {
      return res
        .status(400)
        .json({
          message: "Insufficient credits. ATS resume check costs 5 credits.",
        });
    }

    const filepath = req.file.path;
    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let resumeText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    if (!resumeText) {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      return res
        .status(400)
        .json({
          message: "Could not extract text from the uploaded PDF resume.",
        });
    }

    const systemPrompt = `
You are an expert ATS (Applicant Tracking System) parser, hiring manager, and career coach.
Analyze the following resume text for ATS-friendliness.
Target Job Role: ${jobRole || "General"}
Target Job Description: ${jobDescription || "Not provided"}

Evaluate the resume on four core dimensions:
1. Formatting & Parsability (fonts, layouts, columns, tables, headers, footers, graphics, margins, file format compatibility)
2. Structure & Key Sections (presence of contact info, summary/profile, work experience, education, skills, projects)
3. Content Quality & Impact (action verbs, quantifiable achievements/metrics, grammar, clarity, readability)
4. Keyword Match (compare resume text with the target job role and description, identify matched and missing keywords)

Calculate:
- A total overall score (integer between 0 and 100)
- Individual scores for the four dimensions (integers between 0 and 10)

Strict Rules:
- Return ONLY valid JSON in the exact structure below. Do not wrap in markdown or add explanations.
- Ensure all fields are populated properly.

JSON Structure:
{
  "score": number,
  "summary": "high-level summary of the analysis",
  "dimensions": {
    "formatting": { "score": number, "feedback": "feedback about formatting parsability" },
    "structure": { "score": number, "feedback": "feedback about sections structure" },
    "content": { "score": number, "feedback": "feedback about content and metrics impact" },
    "keywordMatch": { "score": number, "feedback": "feedback about keyword matching" }
  },
  "keywords": {
    "matched": ["keyword1", "keyword2"],
    "missing": ["keyword1", "keyword2"]
  },
  "issues": [
    {
      "severity": "critical" | "warning",
      "section": "formatting" | "structure" | "content" | "keywordMatch",
      "message": "description of the issue",
      "fix": "actionable fix instruction"
    }
  ],
  "recommendations": [
    "actionable recommendation 1",
    "actionable recommendation 2"
  ]
}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Resume Text:\n${resumeText}` },
    ];

    const aiResponse = await askAi(messages);

    // Clean up temporary file
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Parse AI response (try to clean it up in case it wraps it in markdown ```json ... ```)
    let cleanedResponse = aiResponse.trim();
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();
    }

    const report = JSON.parse(cleanedResponse);

    // Deduct 5 credits
    user.credits = Math.max(0, user.credits - 5);
    await user.save();

    res.status(200).json({
      report,
      creditsLeft: user.credits,
    });
  } catch (error) {
    console.error("ATS Check Error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res
      .status(500)
      .json({ message: error.message || "Failed to analyze resume for ATS." });
  }
};
