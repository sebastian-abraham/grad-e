import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Save, PlayCircle, Settings, X, Plus, Bot, CheckCircle2, Upload } from "lucide-react";

export default function CreateExam() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepTransitioning, setStepTransitioning] = useState(false);
  const [stepProgress, setStepProgress] = useState(50);
  const [examId, setExamId] = useState(null);

  // Step 1 Data
  const [assignments, setAssignments] = useState({ classes: [], subjects: [] });
  const [formData, setFormData] = useState({
    name: "",
    subjectId: "",
    classId: "",
    date: "",
    totalMarks: 0,
    teacherId: currentUser?._id
  });

  // Step 2 Data
  const [files, setFiles] = useState({ questionPaper: null, answerKey: null });
  const [criteria, setCriteria] = useState([]);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({ ...prev, teacherId: currentUser._id }));
      fetchAssignments();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!stepTransitioning) {
      setStepProgress(step === 1 ? 50 : 100);
    }
  }, [step, stepTransitioning]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/teacher/assignments/${currentUser._id}`);
      const data = await res.json();
      setAssignments({ classes: data.classes, subjects: data.subjects });
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setExamId(data._id);
        setStepTransitioning(true);
        setStepProgress(50);
        requestAnimationFrame(() => setStepProgress(100));
        setTimeout(() => {
          setStep(2);
          setStepTransitioning(false);
        }, 1150);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create exam");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!files.questionPaper || !files.answerKey) {
      toast.error("Please select both question paper and answer key PDFs.");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("questionPaper", files.questionPaper);
    fd.append("answerKey", files.answerKey);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${examId}/generate-criteria`, {
        method: "POST",
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        setCriteria(data);
      } else {
        const err = await res.json();
        toast.error(err.error || "Generation failed.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateCriteria = (idx, field, value) => {
    const updated = [...criteria];
    updated[idx][field] = value;
    setCriteria(updated);
  };

  const confirmCriteria = async () => {
    setLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria, status: "Setup Complete" })
      });
      navigate(`/teacher/exams/${examId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="create-exam-page">
      <motion.div
        key={`step-wrap-${step}-${stepTransitioning ? "transition" : "steady"}`}
        className="create-exam-wrap"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <header className="create-exam-head">
          <div>
            <p className="create-exam-eyebrow">New Assessment</p>
            <h1>{step === 1 ? "Exam Configuration" : "Setup Grading Criteria"}</h1>
          </div>
          <div className="create-exam-step-chip" aria-live="polite">
            <span>{stepTransitioning ? "Moving to Step 2" : `Step ${step} of 2`}</span>
            <div className={`create-exam-step-track ${stepTransitioning ? "transitioning" : ""}`}>
              <motion.i
                animate={{ width: `${stepProgress}%` }}
                transition={{
                  duration: stepTransitioning ? 1.05 : 0.35,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {stepTransitioning && (
            <motion.div
              key="step-transition-loader"
              className="create-exam-loader-shell"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="create-exam-loader-icon">
                <span />
                <span />
                <span />
              </div>
              <h3>Step 1 complete</h3>
              <p>Preparing grading criteria workspace...</p>
            </motion.div>
          )}

          {!stepTransitioning && step === 1 && (
              <form onSubmit={handleStep1Submit} className="create-exam-card create-exam-form-grid">
                <div className="create-exam-field create-exam-field-full">
                  <label>Exam Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Mid-term Calculus A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="create-exam-field">
                  <label>Subject</label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  >
                    <option value="">Select Subject</option>
                    {assignments.subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="create-exam-field">
                  <label>Class / Section</label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  >
                    <option value="">Select Class</option>
                    {assignments.classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="create-exam-field">
                  <label>Exam Date</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="create-exam-field">
                  <label>Total Marks</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.totalMarks || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalMarks: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>

                <div className="create-exam-actions create-exam-actions-step1">
                  <button
                    type="button"
                    className="create-exam-btn create-exam-btn-muted"
                    onClick={() => navigate("/teacher")}
                  >
                    Cancel
                  </button>
                  <button disabled={loading} type="submit" className="create-exam-btn create-exam-btn-primary">
                    {loading ? "Creating..." : "Upload Documents"}
                  </button>
                </div>
              </form>
            )}

          {!stepTransitioning && step === 2 && criteria.length === 0 && (
              <div className="create-exam-card create-exam-docs-card">
                <div className="create-exam-docs-head">
                  <h2>
                    <FileText size={20} /> Document Uploads
                  </h2>
                  <p>Drop or select PDFs to generate grading criteria automatically.</p>
                </div>

                <form onSubmit={handleDocumentUpload} className="create-exam-docs-grid">
                  <label className="create-exam-dropzone">
                    <Upload size={30} />
                    <strong>Question Paper (Required)</strong>
                    <small>Drop PDF or click to browse</small>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setFiles({ ...files, questionPaper: e.target.files[0] })}
                    />
                    {files.questionPaper && <em>{files.questionPaper.name}</em>}
                  </label>

                  <label className="create-exam-dropzone">
                    <Upload size={30} />
                    <strong>Answer Key (Required)</strong>
                    <small>Drop PDF or click to browse</small>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setFiles({ ...files, answerKey: e.target.files[0] })}
                    />
                    {files.answerKey && <em>{files.answerKey.name}</em>}
                  </label>

                  <div className="create-exam-actions create-exam-actions-step2">
                    <button
                      type="button"
                      className="create-exam-btn create-exam-btn-muted"
                      onClick={() => {
                        setStep(1);
                        setStepProgress(50);
                      }}
                    >
                      Back
                    </button>
                    <button disabled={loading} type="submit" className="create-exam-btn create-exam-btn-warm">
                      <Bot size={18} /> {loading ? "Analyzing..." : "Generate Criteria"}
                    </button>
                  </div>
                </form>
              </div>
            )}

          {!stepTransitioning && step === 2 && criteria.length > 0 && (
              <div className="create-exam-criteria-wrap">
                <div className="create-exam-success-banner">
                  <CheckCircle2 size={22} />
                  <span>
                    AI extracted {criteria.length} criteria rules. Review and adjust before confirming setup.
                  </span>
                </div>

                {criteria.map((c, idx) => (
                  <div key={idx} className="create-exam-criteria-card">
                    <div className="create-exam-criteria-grid-two">
                      <div className="create-exam-field">
                        <label>Question Number</label>
                        <input
                          type="text"
                          value={c.questionNumber}
                          onChange={(e) => updateCriteria(idx, "questionNumber", e.target.value)}
                        />
                      </div>
                      <div className="create-exam-field">
                        <label>Marks</label>
                        <input
                          type="number"
                          value={c.marks}
                          onChange={(e) => updateCriteria(idx, "marks", parseInt(e.target.value, 10) || 0)}
                        />
                      </div>
                    </div>

                    <div className="create-exam-field">
                      <label>Question Text</label>
                      <textarea
                        value={c.prompt}
                        onChange={(e) => updateCriteria(idx, "prompt", e.target.value)}
                      />
                    </div>

                    <div className="create-exam-field">
                      <label>Valuation Notes / Keywords</label>
                      <textarea
                        value={c.valuationNotes}
                        onChange={(e) => updateCriteria(idx, "valuationNotes", e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <div className="create-exam-actions create-exam-actions-step2">
                  <button
                    type="button"
                    className="create-exam-btn create-exam-btn-muted"
                    onClick={() => setCriteria([])}
                  >
                    Re-upload Documents
                  </button>
                  <button
                    disabled={loading}
                    onClick={confirmCriteria}
                    className="create-exam-btn create-exam-btn-warm"
                  >
                    {loading ? "Saving..." : "Confirm & Setup Exam"}
                  </button>
                </div>
              </div>
            )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
