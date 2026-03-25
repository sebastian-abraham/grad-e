# AI Grading Engine Integration

## Overview

The Grad-E platform integrates with a FastAPI-based AI grading engine that uses Google Gemini (cloud) with local RTX failover for automated exam grading. The Node.js backend acts as a proxy — the frontend never communicates directly with the AI engine.

## Architecture

```
Frontend (React) → Node.js Backend (Express) → FastAPI AI Engine (Python)
                                                      ↕
                                              Gemini Cloud Agents
                                                      ↕
                                              Local RTX Fallback
```

## Data Flow

### 1. Exam Setup (CreateExam Step 2)

When a teacher uploads QP + Answer Key:
1. Node.js generates grading **criteria** via direct Gemini API call
2. **Also** forwards the PDFs to FastAPI `POST /api/v1/exam/setup`
3. FastAPI returns an `exam_id` (e.g. `exam_a1b2c3d4`) → saved as `Exam.aiExamId` in MongoDB

### 2. Grading (ExamDetail → "Process Papers")

1. Node.js reads ungraded submissions from MongoDB (base64 PDF data)
2. Writes each to a temp file, sends as multipart to FastAPI `POST /api/v1/exam/{aiExamId}/grade`
3. FastAPI runs a multi-agent grading pipeline:
   - **Layout Manager** → segments questions, classifies types, extracts handwriting via OCR
   - **Specialist Agents** (Text/Math/Diagram) → grade each question
   - **Auto-Failover** → if cloud API limits hit, falls back to local RTX pipeline
4. Reports are saved as JSON files on the FastAPI server

### 3. Polling (Frontend polls `/grade-status`)

1. Frontend polls `GET /api/exams/:id/grade-status` every 8 seconds
2. Node.js calls FastAPI `GET /api/v1/exam/{aiExamId}/reports`
3. Maps each AI report back to its MongoDB Submission by filename
4. Updates `score`, `feedback[]`, and `status` on matching Submissions
5. When all graded → sets `Exam.status = "Graded"`

## Report Mapping

AI engine report format:
```json
{
  "student_id": "filename_without_ext",
  "score": 42.5,
  "total": 50,
  "questions": [{
    "id": "Q1",
    "points": 5,
    "status": "correct",
    "feedback": "...",
    "correctAnswer": "...",
    "studentAnswer": "..."
  }]
}
```

Maps to Submission model's `feedback` array:
```json
{
  "questionNumber": "Q1",
  "pointsAwarded": 5,
  "maxPoints": 5,
  "studentAnswer": "...",
  "correctAnswer": "...",
  "teacherFeedback": "...",
  "status": "correct"
}
```

## Environment Variables

| Variable | Location | Value |
|---|---|---|
| `AI_ENGINE_URL` | `backend/.env` | `http://localhost:8000` |

## Running Locally

1. Start the FastAPI AI engine: `uvicorn main:app --reload` (port 8000)
2. Start the Node.js backend: `nodemon server.js` (port 5000)
3. Start the frontend: `npm run dev` (Vite)

## Files Modified

| File | Change |
|---|---|
| `backend/models/Exam.js` | Added `aiExamId` field |
| `backend/routes/examRoutes.js` | AI engine proxy routes |
| `backend/.env` | Added `AI_ENGINE_URL` |
| `frontend/src/pages/ExamDetail.jsx` | Real grading + polling UI |
