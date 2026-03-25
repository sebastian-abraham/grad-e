const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const ScanSession = require("../models/ScanSession");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 1️⃣ Create session
router.post("/session", async (req, res) => {
  const session = await ScanSession.create({
    assignmentId: req.body.assignmentId,
    pages: [],
  });

  res.json({ sessionId: session._id });
});

// 2️⃣ Send frame to scanner
router.post("/session/:id/frame", upload.single("file"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("session_id", req.params.id);
    form.append("file", fs.createReadStream(req.file.path));

    const response = await axios.post(
      "http://localhost:8002/process-frame",
      form,
      { headers: form.getHeaders() },
    );

    if (response.data.accepted) {
      await ScanSession.findByIdAndUpdate(req.params.id, {
        $push: { pages: response.data.page_path },
      });
    }

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scanner failed" });
  }
});

// 3️⃣ Finalize
router.post("/session/:id/finalize", async (req, res) => {
  try {
    const scanRes = await axios.post("http://localhost:8002/finalize", {
      session_id: req.params.id,
    });

    const pdfPath = scanRes.data.pdf_path;

    // 🔥 later: send to engine
    // await axios.post("http://engine/grade", { pdfPath })

    res.json({
      pdfPath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Finalize failed" });
  }
});

module.exports = router;
