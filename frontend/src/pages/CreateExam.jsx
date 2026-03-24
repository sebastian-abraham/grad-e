import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Upload, CheckCircle2, FileText, Bot } from "lucide-react";

export default function CreateExam() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
        setStep(2);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create exam");
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
      alert("Please select both question paper and answer key PDFs.");
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
        alert(err.error || "Generation failed.");
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
    <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
      <h1 style={{ fontSize: "28px", color: "#1e293b", marginBottom: "32px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
        Create New Exam - Step {step} of 2
      </h1>

      {step === 1 && (
        <form onSubmit={handleStep1Submit} style={{ display: "flex", flexDirection: "column", gap: "24px", backgroundColor: "#fff", padding: "32px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "500", color: "#475569" }}>Exam Name</label>
            <input 
              required type="text" placeholder="e.g., Midterm Physics 101" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            />
          </div>

          <div style={{ display: "flex", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              <label style={{ fontWeight: "500", color: "#475569" }}>Subject</label>
              <select required value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
                <option value="">Select Subject</option>
                {assignments.subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              <label style={{ fontWeight: "500", color: "#475569" }}>Class</label>
              <select required value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
                <option value="">Select Class</option>
                {assignments.classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              <label style={{ fontWeight: "500", color: "#475569" }}>Exam Date</label>
              <input 
                required type="date"
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              <label style={{ fontWeight: "500", color: "#475569" }}>Total Marks</label>
              <input 
                required type="number" min="1"
                value={formData.totalMarks} onChange={e => setFormData({...formData, totalMarks: parseInt(e.target.value)})}
                style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>
          </div>

          <button disabled={loading} type="submit" style={{ marginTop: "16px", padding: "14px", backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating..." : "Continue to Documents"}
          </button>
        </form>
      )}

      {step === 2 && criteria.length === 0 && (
        <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 24px 0", fontSize: "20px" }}><FileText size={24} color="#3b82f6"/> Upload Exam Documents</h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>Upload the question paper and answer key PDFs. Our AI will automatically scan them and generate grading criteria for each question.</p>
          
          <form onSubmit={handleDocumentUpload} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ padding: "20px", border: "2px dashed #cbd5e1", borderRadius: "8px", textAlign: "center", backgroundColor: "#f8fafc" }}>
              <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Upload size={32} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569" }}>Select Question Paper (PDF)</span>
                <input type="file" accept="application/pdf" onChange={e => setFiles({...files, questionPaper: e.target.files[0]})} style={{ display: "none" }} />
                {files.questionPaper && <span style={{ color: "#10b981", fontSize: "14px" }}>✓ {files.questionPaper.name}</span>}
              </label>
            </div>

            <div style={{ padding: "20px", border: "2px dashed #cbd5e1", borderRadius: "8px", textAlign: "center", backgroundColor: "#f8fafc" }}>
              <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Upload size={32} color="#94a3b8" />
                <span style={{ fontWeight: "600", color: "#475569" }}>Select Answer Key (PDF)</span>
                <input type="file" accept="application/pdf" onChange={e => setFiles({...files, answerKey: e.target.files[0]})} style={{ display: "none" }} />
                {files.answerKey && <span style={{ color: "#10b981", fontSize: "14px" }}>✓ {files.answerKey.name}</span>}
              </label>
            </div>

            <button disabled={loading} type="submit" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "14px", backgroundColor: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}>
               <Bot size={20} /> {loading ? "Analyzing Documents..." : "Generate AI Criteria"}
            </button>
          </form>
        </div>
      )}

      {step === 2 && criteria.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ backgroundColor: "#ecfdf5", padding: "16px 20px", borderRadius: "8px", border: "1px solid #10b981", display: "flex", alignItems: "center", gap: "12px", color: "#065f46" }}>
            <CheckCircle2 size={24} />
            <span style={{ fontWeight: "500" }}>AI Successfully extracted {criteria.length} criteria rules! Review and edit below before confirming.</span>
          </div>

          {criteria.map((c, idx) => (
            <div key={idx} style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Q. NUMBER</label>
                  <input type="text" value={c.questionNumber} onChange={e => updateCriteria(idx, "questionNumber", e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>MAX MARKS</label>
                  <input type="number" value={c.marks} onChange={e => updateCriteria(idx, "marks", parseInt(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>QUESTION / PROMPT</label>
                <textarea value={c.prompt} onChange={e => updateCriteria(idx, "prompt", e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "60px", resize: "vertical" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>VALUATION NOTES / REQUIRED STEPS</label>
                <textarea value={c.valuationNotes} onChange={e => updateCriteria(idx, "valuationNotes", e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "80px", resize: "vertical" }} />
              </div>
            </div>
          ))}

          <button disabled={loading} onClick={confirmCriteria} style={{ padding: "16px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", marginTop: "16px" }}>
            {loading ? "Saving..." : "Confirm & Complete Setup"}
          </button>
        </div>
      )}
    </div>
  );
}
