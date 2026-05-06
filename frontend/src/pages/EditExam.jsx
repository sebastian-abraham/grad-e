import { apiFetch } from "../utils/apiFetch";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowLeft,
  Bot,
  Save,
  Upload,
  X,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

const panel = {
  backgroundColor: "#fff",
  border: "1px solid var(--line)",
  borderRadius: "16px",
  boxShadow: "var(--shadow-soft)",
  padding: 24,
};

export default function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingSchema, setGeneratingSchema] = useState(false);
  
  const [assignments, setAssignments] = useState({ classes: [], subjects: [] });
  
  const [formData, setFormData] = useState({
    name: "",
    subjectId: "",
    classId: "",
    date: "",
    totalMarks: 0,
  });
  
  const [editedCriteria, setEditedCriteria] = useState([]);
  const [schemaFiles, setSchemaFiles] = useState({ questionPaper: null, answerKey: null });

  useEffect(() => {
    if (currentUser) {
      fetchAssignments();
      fetchExam();
    }
  }, [id, currentUser]);

  const fetchAssignments = async () => {
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/teacher/assignments/${currentUser._id}`);
      const data = await res.json();
      setAssignments({ classes: data.classes, subjects: data.subjects });
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };

  const fetchExam = async () => {
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/exams/${id}`);
      const data = await res.json();
      setFormData({
        name: data.name || "",
        subjectId: data.subjectId?._id || data.subjectId || "",
        classId: data.classId?._id || data.classId || "",
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : "",
        totalMarks: data.totalMarks || 0,
      });
      setEditedCriteria(data.criteria || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load exam details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-resize textareas when criteria loads
    const textareas = document.querySelectorAll("textarea.auto-resize");
    textareas.forEach(t => {
      t.style.height = "auto";
      t.style.height = t.scrollHeight + "px";
    });
  }, [editedCriteria]);

  const handleGenerateSchema = async (e) => {
    e.preventDefault();
    if (!schemaFiles.questionPaper || !schemaFiles.answerKey) {
      toast.error("Please select both PDFs.");
      return;
    }
    setGeneratingSchema(true);
    const fd = new FormData();
    fd.append("questionPaper", schemaFiles.questionPaper);
    fd.append("answerKey", schemaFiles.answerKey);

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/exams/${id}/generate-criteria`, {
        method: "POST",
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        setEditedCriteria(data);
        toast.success("Schema generated! Please review and save.");
      } else {
        const err = await res.json();
        toast.error(err.error || "Generation failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Generation failed.");
    } finally {
      setGeneratingSchema(false);
    }
  };

  const handleSave = async () => {
    const totalMarks = editedCriteria.reduce((sum, c) => sum + (c.marks || 0), 0);
    if (totalMarks > formData.totalMarks) {
      toast.error(`Total question marks (${totalMarks}) cannot exceed exam limit (${formData.totalMarks}).`);
      return;
    }
    
    if (!formData.name || !formData.subjectId || !formData.classId || !formData.date || !formData.totalMarks) {
      toast.error("Please fill in all exam details.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        criteria: editedCriteria,
        status: editedCriteria.length > 0 ? "Setup Complete" : "Draft"
      };

      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/exams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success("Exam updated successfully!");
        navigate(`/teacher/exams/${id}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update exam");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleTextareaResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Link
            to={`/teacher/exams/${id}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted)", textDecoration: "none", fontSize: 13, marginBottom: 8 }}
          >
            <ArrowLeft size={14} /> Back to Exam
          </Link>
          <h1 style={{ margin: 0, fontSize: 32 }}>Edit Exam</h1>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--accent-strong)", color: "#fff", border: "none", borderRadius: 999, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 8px 18px rgba(46, 86, 190, 0.26)" }}
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={panel}>
        <h2 style={{ margin: "0 0 20px", fontSize: 20 }}>Exam Details</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Exam Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 8 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Total Marks</label>
            <input
              type="number"
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 0 })}
              style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 8 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Subject</label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 8, backgroundColor: "#fff" }}
            >
              <option value="">Select Subject</option>
              {assignments.subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Class / Section</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 8, backgroundColor: "#fff" }}
            >
              <option value="">Select Class</option>
              {assignments.classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Exam Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 8 }}
            />
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }} style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Grading Schema</h2>
          {editedCriteria.length > 0 && (
             <button onClick={() => setEditedCriteria([])} style={{ padding: "8px 14px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
               Reset Schema
             </button>
          )}
        </div>

        {editedCriteria.length === 0 ? (
          <form onSubmit={handleGenerateSchema} style={{ display: "grid", gap: 20 }}>
            <div style={{ padding: 24, background: "#f9fafb", borderRadius: 12, border: "1px solid var(--line)", textAlign: "center" }}>
               <FileText size={40} color="var(--muted)" style={{ marginBottom: 12 }} />
               <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Generate via AI</h3>
               <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>Upload the question paper and answer key PDFs to let our AI automatically extract the grading schema.</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
               <label style={{ padding: 24, border: "2px dashed var(--line)", borderRadius: 12, textAlign: "center", cursor: "pointer", background: schemaFiles.questionPaper ? "rgba(62, 101, 204, 0.04)" : "transparent", borderColor: schemaFiles.questionPaper ? "var(--accent)" : "var(--line)", transition: "all 0.2s" }}>
                  <Upload size={28} style={{ marginBottom: 12, color: schemaFiles.questionPaper ? "var(--accent-strong)" : "var(--muted)" }} />
                  <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 15 }}>Question Paper</div>
                  <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => setSchemaFiles(p => ({...p, questionPaper: e.target.files[0]}))} />
                  <div style={{ fontSize: 13, color: schemaFiles.questionPaper ? "var(--accent-strong)" : "var(--muted)", marginTop: 6, fontWeight: schemaFiles.questionPaper ? 600 : 400 }}>{schemaFiles.questionPaper?.name || "Click to browse"}</div>
               </label>
               <label style={{ padding: 24, border: "2px dashed var(--line)", borderRadius: 12, textAlign: "center", cursor: "pointer", background: schemaFiles.answerKey ? "rgba(62, 101, 204, 0.04)" : "transparent", borderColor: schemaFiles.answerKey ? "var(--accent)" : "var(--line)", transition: "all 0.2s" }}>
                  <Upload size={28} style={{ marginBottom: 12, color: schemaFiles.answerKey ? "var(--accent-strong)" : "var(--muted)" }} />
                  <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 15 }}>Answer Key</div>
                  <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => setSchemaFiles(p => ({...p, answerKey: e.target.files[0]}))} />
                  <div style={{ fontSize: 13, color: schemaFiles.answerKey ? "var(--accent-strong)" : "var(--muted)", marginTop: 6, fontWeight: schemaFiles.answerKey ? 600 : 400 }}>{schemaFiles.answerKey?.name || "Click to browse"}</div>
               </label>
            </div>
            <button type="submit" disabled={generatingSchema} style={{ padding: "14px", background: "var(--accent-strong)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: generatingSchema ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 6px 12px rgba(46, 86, 190, 0.15)" }}>
              {generatingSchema ? <><span className="spinner" style={{width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite"}} /> Analyzing PDFs...</> : <><Bot size={18} /> Generate Schema with AI</>}
            </button>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {editedCriteria.map((c, idx) => (
              <div key={idx} style={{ padding: 24, border: "1px solid var(--line)", borderRadius: 16, display: "grid", gap: 16, background: "#fcfcfd" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div style={{ display: "flex", gap: 16 }}>
                     <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 120 }}>
                       <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Q. Number</label>
                       <input type="text" value={c.questionNumber} onChange={e => { const newC = [...editedCriteria]; newC[idx].questionNumber = e.target.value; setEditedCriteria(newC); }} style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8, boxSizing: "border-box", fontWeight: 600 }} />
                     </div>
                     <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 100 }}>
                       <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Marks</label>
                       <input type="number" value={c.marks} onChange={e => { const newC = [...editedCriteria]; newC[idx].marks = parseInt(e.target.value) || 0; setEditedCriteria(newC); }} style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8, boxSizing: "border-box", fontWeight: 600, color: "var(--accent-strong)" }} />
                     </div>
                   </div>
                   <button onClick={() => { const newC = editedCriteria.filter((_, i) => i !== idx); setEditedCriteria(newC); }} style={{ background: "#fef2f2", border: "1px solid #fee2e2", color: "#dc2626", borderRadius: 8, padding: 8, cursor: "pointer" }} title="Remove Question">
                      <X size={16} />
                   </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                   <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Question Prompt</label>
                   <textarea 
                     className="auto-resize"
                     value={c.prompt} 
                     onChange={e => { handleTextareaResize(e); const newC = [...editedCriteria]; newC[idx].prompt = e.target.value; setEditedCriteria(newC); }} 
                     style={{ width: "100%", padding: "12px", border: "1px solid var(--line)", borderRadius: 8, minHeight: 60, boxSizing: "border-box", resize: "none", overflow: "hidden", lineHeight: 1.5, fontFamily: "inherit" }} 
                     onFocus={handleTextareaResize}
                   />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                   <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Valuation Notes / Keywords</label>
                   <textarea 
                     className="auto-resize"
                     value={c.valuationNotes} 
                     onChange={e => { handleTextareaResize(e); const newC = [...editedCriteria]; newC[idx].valuationNotes = e.target.value; setEditedCriteria(newC); }} 
                     style={{ width: "100%", padding: "12px", border: "1px solid var(--line)", borderRadius: 8, minHeight: 60, boxSizing: "border-box", resize: "none", overflow: "hidden", lineHeight: 1.5, fontFamily: "inherit" }} 
                     onFocus={handleTextareaResize}
                   />
                </div>
              </div>
            ))}
            
            <button onClick={() => setEditedCriteria([...editedCriteria, { questionNumber: "", marks: 0, prompt: "", valuationNotes: "" }])} style={{ padding: "14px", background: "transparent", border: "2px dashed var(--accent)", color: "var(--accent-strong)", borderRadius: 12, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
              Add Question Manually
            </button>
          </div>
        )}
      </motion.section>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
