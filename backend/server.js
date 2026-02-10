// Basic Express.js server boilerplate

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

const extractJson = (text) => {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch (error) {
    return null;
  }
};

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.post("/api/grade", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Missing GEMINI_API_KEY in environment." });
    }

    const prompt = `You are an expert exam grader. Analyze the uploaded answer sheet and return JSON only with this schema:
{
  "examTitle": "string",
  "studentName": "string",
  "score": number,
  "total": number,
  "gradeLetter": "string",
  "points": "string",
  "aiTimeSeconds": number,
  "confidence": number,
  "questions": [
    {
      "id": "Q1",
      "points": number,
      "status": "correct" | "partial" | "incorrect",
      "prompt": "string",
      "studentAnswer": "string",
      "correctAnswer": "string",
      "feedback": "string"
    }
  ]
}
Return strictly valid JSON with double quotes and no markdown or extra commentary.`;

    const base64Pdf = req.file.buffer.toString("base64");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: base64Pdf,
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return res
        .status(500)
        .json({ error: "Gemini API error", details: errorBody });
    }

    const responseJson = await response.json();
    const rawText = (responseJson.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || "")
      .join("");
    const parsed = extractJson(rawText);

    if (!parsed) {
      return res.json({
        examTitle: "Unknown Exam",
        studentName: "Student",
        score: 0,
        total: 100,
        gradeLetter: "N/A",
        points: "0/100",
        aiTimeSeconds: 0,
        confidence: 0,
        questions: [],
        rawText,
      });
    }

    return res.json(parsed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ error: error.message || "Upload failed." });
  }
  return next();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
