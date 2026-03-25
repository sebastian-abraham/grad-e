const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");
const FormData = require("form-data");
const Exam = require("../models/Exam");
const Submission = require("../models/Submission");

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Helper: submit form-data to FastAPI with correct multipart boundaries
const submitFormData = (url, fd) => {
  return new Promise((resolve, reject) => {
    fd.submit(url, (err, res) => {
      if (err) return reject(err);
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: body });
        }
      });
      res.on("error", reject);
    });
  });
};

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

// POST /api/exams/:id/generate-criteria (Step 2 Gemini AI parsing + AI Engine Setup)
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
         return res.json([
           { questionNumber: "1", prompt: "Fallback generation due to parsing err", marks: 5, valuationNotes: "Check steps" }
         ]);
      }

      // Update exam with criteria
      await Exam.findByIdAndUpdate(req.params.id, { criteria: parsed });

      // ── AI Engine Setup ──
      // Forward QP and AK to FastAPI so it's ready for grading
      try {
        // Write buffers to temp files so form-data can stream them properly
        const tmpSetup = path.join(os.tmpdir(), `setup_${req.params.id}`);
        fs.mkdirSync(tmpSetup, { recursive: true });

        const qpTmp = path.join(tmpSetup, questionPaper[0].originalname || "question_paper.pdf");
        const akTmp = path.join(tmpSetup, answerKey[0].originalname || "answer_key.pdf");
        fs.writeFileSync(qpTmp, questionPaper[0].buffer);
        fs.writeFileSync(akTmp, answerKey[0].buffer);

        const fd = new FormData();
        fd.append("question_paper", fs.createReadStream(qpTmp));
        fd.append("answer_key", fs.createReadStream(akTmp));

        const aiRes = await submitFormData(`${AI_ENGINE_URL}/api/v1/exam/setup`, fd);

        // Cleanup temp files
        try { fs.rmSync(tmpSetup, { recursive: true, force: true }); } catch(e) {}

        if (aiRes.ok && aiRes.data?.status === "success" && aiRes.data?.exam_id) {
          await Exam.findByIdAndUpdate(req.params.id, { aiExamId: aiRes.data.exam_id });
          console.log(`[AI Engine] Exam registered: ${aiRes.data.exam_id}`);
        } else {
          console.warn("[AI Engine] Setup response:", aiRes.data);
        }
      } catch (aiErr) {
        console.warn("[AI Engine] Setup unreachable, continuing without AI setup:", aiErr.message);
      }

      const exam = await Exam.findById(req.params.id);
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

// GET /api/exams/:id/submissions/:subId (Full PDF retrieval)
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

// POST /api/exams/:id/grade-all — Real AI Engine Integration
router.post("/:id/grade-all", async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    if (!exam.aiExamId) {
      return res.status(400).json({ error: "AI Engine not set up for this exam. Please re-upload question paper and answer key." });
    }

    const submissions = await Submission.find({ examId, status: "Ungraded" });
    if (submissions.length === 0) {
      return res.status(400).json({ error: "No ungraded submissions found." });
    }

    // Write each submission PDF to a temp file and collect paths
    const tmpDir = path.join(os.tmpdir(), `grade_${examId}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    const fd = new FormData();
    for (const sub of submissions) {
      const safeName = (sub.fileName || `submission_${sub._id}`).replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = path.join(tmpDir, safeName);
      fs.writeFileSync(filePath, Buffer.from(sub.pdfData, "base64"));
      fd.append("student_scripts", fs.createReadStream(filePath), {
        filename: safeName,
        contentType: "application/pdf",
      });
    }

    // Send to FastAPI grade endpoint using form-data's native submit
    const aiRes = await submitFormData(`${AI_ENGINE_URL}/api/v1/exam/${exam.aiExamId}/grade`, fd);

    // Clean up temp files
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) { /* ignore cleanup errors */ }

    if (!aiRes.ok) {
      return res.status(500).json({ error: "AI Engine grading failed", details: aiRes.data });
    }

    await Exam.findByIdAndUpdate(examId, { status: "Processing" });
    return res.json({ message: "Grading dispatched to AI engine. Poll /grade-status for progress." });
  } catch (error) {
    console.error("Grade-all error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/exams/:id/grade-status — Polls FastAPI for completed reports
router.get("/:id/grade-status", async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    if (!exam.aiExamId) {
      return res.json({ status: "no_ai", graded: 0, total: 0 });
    }

    // Fetch reports from FastAPI
    let aiData;
    try {
      const aiRes = await fetch(`${AI_ENGINE_URL}/api/v1/exam/${exam.aiExamId}/reports`);
      aiData = await aiRes.json();
    } catch (err) {
      return res.json({ status: "engine_unreachable", graded: 0, total: 0 });
    }

    const submissions = await Submission.find({ examId });
    const totalSubs = submissions.length;

    if (!aiData.reports || aiData.reports.length === 0) {
      return res.json({ status: "processing", graded: 0, total: totalSubs });
    }

    // Map AI reports back to MongoDB Submissions
    let newlyGraded = 0;
    for (const report of aiData.reports) {
      // Match by student_id (which is the filename without .pdf extension)
      const reportFileName = report.student_id;

      // Find the matching submission
      const matchingSub = submissions.find(s => {
        const subName = (s.fileName || "").replace(/\.pdf$/i, "");
        return subName === reportFileName;
      });

      if (matchingSub && matchingSub.status !== "Graded") {
        // Map AI report questions to our feedback schema,
        // cross-referencing with exam criteria for maxPoints and question prompt
        const feedback = (report.questions || []).map(q => {
          const qId = q.id || "Unknown";
          // Find matching criteria by question number (try exact match, then normalized)
          const matchedCriteria = (exam.criteria || []).find(c =>
            c.questionNumber === qId ||
            c.questionNumber === qId.replace(/^Q/i, "") ||
            `Q${c.questionNumber}` === qId
          );

          return {
            questionNumber: qId,
            pointsAwarded: q.points || 0,
            maxPoints: matchedCriteria?.marks || q.max_points || 0,
            studentAnswer: q.studentAnswer || "",
            correctAnswer: q.correctAnswer || "",
            teacherFeedback: q.feedback || "",
            questionPrompt: matchedCriteria?.prompt || q.context || "",
            status: q.status || "ungraded",
          };
        });

        await Submission.findByIdAndUpdate(matchingSub._id, {
          score: report.score || 0,
          feedback,
          status: "Graded",
        });
        newlyGraded++;
      }
    }

    const gradedCount = await Submission.countDocuments({ examId, status: "Graded" });

    // If all submissions are graded, update exam status
    if (gradedCount >= totalSubs && totalSubs > 0) {
      await Exam.findByIdAndUpdate(examId, { status: "Graded" });
    }

    return res.json({
      status: gradedCount >= totalSubs ? "completed" : "processing",
      graded: gradedCount,
      total: totalSubs,
      newlyGraded,
    });
  } catch (error) {
    console.error("Grade-status error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/exams/:id/submissions/:subId/grade (Manual Override)
router.put("/:id/submissions/:subId/grade", async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const sub = await Submission.findByIdAndUpdate(req.params.subId, { score, feedback }, { new: true });
    
    const safeSub = sub.toObject();
    delete safeSub.pdfData;
    return res.json(safeSub);
  } catch(error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
