const mongoose = require("mongoose");

const scanSessionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    pages: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("ScanSession", scanSessionSchema);
