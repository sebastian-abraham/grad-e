const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // assigned later via manual string matching
    },
    fileName: {
      type: String,
      required: true
    },
    pdfData: {
      type: String, // Base64 representation of the uploaded file
      required: true
    },
    score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Ungraded", "Graded"],
      default: "Ungraded",
    },
    // Detailed feedback mimicking Gemini's output
    feedback: [
      {
        questionNumber: String,
        questionPrompt: String, // Question text from exam criteria
        pointsAwarded: Number,
        maxPoints: Number,
        studentAnswer: String,
        correctAnswer: String,
        teacherFeedback: String, // from AI initially, editable by teacher
        status: { type: String, enum: ["correct", "partial", "incorrect", "ungraded"] },
        flags: [String] // Plagiarism or missing steps flags
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
