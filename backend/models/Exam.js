const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Setup Complete", "Sheets Uploaded", "Processing", "Graded"],
      default: "Draft",
    },
    // AI Engine exam identifier (from FastAPI)
    aiExamId: {
      type: String,
      default: null,
    },
    // The auto-generated or manually edited criteria
    criteria: [
      {
        questionNumber: String,
        prompt: String,
        marks: Number,
        valuationNotes: String, // what to look for when grading
      }
    ],
    // Seating grid info
    seatingArrangement: {
      rows: { type: Number, default: 0 },
      cols: { type: Number, default: 0 },
      // array of objects mapping row, col to studentId
      assignments: [
        {
          row: Number,
          col: Number,
          studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        }
      ]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
