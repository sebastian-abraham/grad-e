const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const User = require("../models/User");

// GET /api/classes - List all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("students", "displayName email role")
      .sort({ createdAt: -1 });
    return res.json(classes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/classes - Create a new class
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Class name is required." });

    const existing = await Class.findOne({ name });
    if (existing) return res.status(409).json({ error: "Class already exists." });

    const newClass = await Class.create({ name, students: [] });
    return res.status(201).json(newClass);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/classes/:id - Get a single class
router.get("/:id", async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate("students", "displayName email role");
    if (!cls) return res.status(404).json({ error: "Class not found." });
    
    return res.json(cls);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/classes/:id - Edit class name
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { name },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedClass) return res.status(404).json({ error: "Class not found." });
    
    return res.json(updatedClass);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/classes/:id - Delete class
router.delete("/:id", async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) return res.status(404).json({ error: "Class not found." });
    
    return res.json({ message: "Class deleted." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/classes/:id/students - Add students to a class (bulk or single)
router.post("/:id/students", async (req, res) => {
  try {
    // studentIds can be a single ID or an array of IDs
    const { studentIds } = req.body;
    if (!studentIds) return res.status(400).json({ error: "studentIds required." });

    const idsToAdd = Array.isArray(studentIds) ? studentIds : [studentIds];

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: { $each: idsToAdd } } },
      { returnDocument: 'after' }
    ).populate("students", "displayName email role");
    
    if (!updatedClass) return res.status(404).json({ error: "Class not found." });

    return res.json(updatedClass);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/classes/:id/students/:studentId - Remove a student from class
router.delete("/:id/students/:studentId", async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { $pull: { students: req.params.studentId } },
      { returnDocument: 'after' }
    ).populate("students", "displayName email role");

    if (!updatedClass) return res.status(404).json({ error: "Class not found." });

    return res.json(updatedClass);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
