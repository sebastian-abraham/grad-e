const express = require("express");
const router = express.Router();
const multer = require("multer");
const Exam = require("../models/Exam");
const Submission = require("../models/Submission");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Helper for Google Gemini JSON extraction
const extractJson = (text) => {
  if (!text) return null;
  const start = text.indexOf("["); // We expect an array for criteria
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch (error) {
    return null;
  }
};

// GET /api/exams
router.get("/", async (req, res) => {
  try {
    const { teacherId } = req.query;
    let query = {};
    if (teacherId) query.teacherId = teacherId;

    const exams = await Exam.find(query)
      .populate("subjectId", "name")
      .populate("classId", "name")
      .sort({ createdAt: -1 });
    return res.json(exams);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/exams/:id
router.get("/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("subjectId", "name")
      .populate("classId", "name")
      .populate("teacherId", "displayName email")
      .populate({
        path: "seatingArrangement.assignments.studentId",
        select: "displayName email"
      });
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    return res.json(exam);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/exams (Step 1 Basic creation)
router.post("/", async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    return res.status(201).json(exam);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/exams/:id
router.put("/:id", async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(exam);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/exams/:id/generate-criteria (Step 2 Gemini AI parsing)
router.post(
  "/:id/generate-criteria",
  upload.fields([{ name: "questionPaper", maxCount: 1 }, { name: "answerKey", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { questionPaper, answerKey } = req.files;
      if (!questionPaper || !answerKey) {
        return res.status(400).json({ error: "questionPaper and answerKey are required PDFs" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing GEMINI API KEY" });

      const qpBase64 = questionPaper[0].buffer.toString("base64");
      const akBase64 = answerKey[0].buffer.toString("base64");

      const prompt = `You are an expert curriculum designer. Analyze the provided Question Paper (first PDF) and Answer Key (second PDF).
Generate a strict JSON array of objects representing grading criteria for each question.
Array Schema:
[
  {
    "questionNumber": "String",
    "prompt": "String",
    "marks": Number,
    "valuationNotes": "String highlighting what to look for"
  }
]
Do not include backticks, markdown, or text outside the raw JSON array.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType: "application/pdf", data: qpBase64 } },
                  { inlineData: { mimeType: "application/pdf", data: akBase64 } }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
         let errorBody;
         try { errorBody = await response.text(); } catch(e) { errorBody = "Unknown API error"; }
         return res.status(500).json({ error: "Gemini API error", details: errorBody });
      }

      const responseJson = await response.json();
      const rawText = (responseJson.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
      const parsed = extractJson(rawText);

      if (!parsed) {
         // fallback mock in case of parsing failure to prevent blocking
         return res.json([
           { questionNumber: "1", prompt: "Fallback generation due to parsing err", marks: 5, valuationNotes: "Check steps" }
         ]);
      }

      // Automatically update the exam
      const exam = await Exam.findByIdAndUpdate(req.params.id, { criteria: parsed }, { new: true });
      return res.json(exam.criteria);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/exams/:id/submissions (Bulk PDF upload)
router.post("/:id/submissions", upload.array("sheets", 50), async (req, res) => {
  try {
    const examId = req.params.id;
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No files provided" });

    const submissions = req.files.map(file => ({
      examId,
      fileName: file.originalname,
      pdfData: file.buffer.toString("base64"),
      status: "Ungraded"
    }));

    await Submission.insertMany(submissions);
    await Exam.findByIdAndUpdate(examId, { status: "Sheets Uploaded" });
    
    return res.json({ message: "Submissions uploaded successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/exams/:id/submissions
router.get("/:id/submissions", async (req, res) => {
  try {
    const submissions = await Submission.find({ examId: req.params.id }).populate("studentId", "displayName email");
    // Strip heavy base64 strings so it doesn't crash the frontend on a bulk listing
    const lightSubmissions = submissions.map(s => {
       const obj = s.toObject();
       delete obj.pdfData;
       return obj;
    });
    return res.json(lightSubmissions);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/exams/:id/submissions/:subId (Full PDF retrival)
router.get("/:id/submissions/:subId", async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.subId).populate("studentId", "displayName email");
    return res.json(sub);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT assign student manual
router.put("/:id/submissions/:subId/assign", async (req, res) => {
  try {
    const { studentId } = req.body;
    const sub = await Submission.findByIdAndUpdate(req.params.subId, { studentId }, { new: true }).populate("studentId", "displayName email");
    const safeSub = sub.toObject();
    delete safeSub.pdfData;
    return res.json(safeSub);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST grade all (DUMMY placeholder instead of Gemini)
router.post("/:id/grade-all", async (req, res) => {
  try {
    const examId = req.params.id;
    await Exam.findByIdAndUpdate(examId, { status: "Processing" });

    // Mock processing loop
    setTimeout(async () => {
      const submissions = await Submission.find({ examId, status: "Ungraded" });
      for (const sub of submissions) {
        // Just mock some arbitrary scores and feedback based on the filename/student name
        const randomScore = Math.floor(Math.random() * 80) + 20; // 20 - 100
        
        await Submission.findByIdAndUpdate(sub._id, {
          score: randomScore,
          status: "Graded",
          feedback: [
            {
              questionNumber: "1",
              pointsAwarded: Math.floor(randomScore/2),
              maxPoints: 50,
              studentAnswer: "Mocked Answer Extracted",
              correctAnswer: "Key Answer",
              teacherFeedback: "Good attempt but missed logic",
              status: "partial"
            }
          ]
        });
      }
      await Exam.findByIdAndUpdate(examId, { status: "Graded" });
    }, 3000); // simulate 3 sec async job
    
    return res.json({ message: "Grading process started." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/exams/:id/submissions/:subId/grade (Manual Override)
router.put("/:id/submissions/:subId/grade", async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const sub = await Submission.findByIdAndUpdate(req.params.subId, { score, feedback }, { new: true });
    
    // safe object
    const safeSub = sub.toObject();
    delete safeSub.pdfData;
    return res.json(safeSub);
  } catch(error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
