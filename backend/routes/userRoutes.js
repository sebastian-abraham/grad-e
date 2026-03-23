const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/users/login
// Called after Firebase Google login.
// If email exists & no firebaseUid → links account.
// If already linked → returns user.
// If email not found → 403.
router.post("/login", async (req, res) => {
  try {
    const { firebaseUid, email, displayName } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: "firebaseUid and email are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(403).json({ error: "Access denied. Account not found." });
    }

    // Link Firebase UID on first login
    if (!user.firebaseUid) {
      user.firebaseUid = firebaseUid;
    }

    // Update display name if provided
    if (displayName) {
      user.displayName = displayName;
    }

    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ------- Admin routes (no auth middleware yet) -------

// POST /api/users — Create user with email + role
router.post("/", async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "User with this email already exists." });
    }

    const user = await User.create({ email, role });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/users — List all users with optional filtering
router.get("/", async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role && role !== "all") {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } }
      ];
    }
    const users = await User.find(query).sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id — Update user
router.put("/:id", async (req, res) => {
  try {
    const { role, displayName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role && { role }), ...(displayName && { displayName }) },
      { returnDocument: 'after', runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id — Remove user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({ message: "User deleted." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
