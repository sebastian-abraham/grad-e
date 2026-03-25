import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, Briefcase, Plus, X } from "lucide-react";

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [formData, setFormData] = useState({ classId: "", subjectId: "", teacherId: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignRes, classRes, subRes, teacherRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/assignments`),
        fetch(`${import.meta.env.VITE_API_URL}/api/classes`),
        fetch(`${import.meta.env.VITE_API_URL}/api/subjects`),
        fetch(`${import.meta.env.VITE_API_URL}/api/users?role=teacher`)
      ]);

      setAssignments(await assignRes.json());
      setClasses(await classRes.json());
      setSubjects(await subRes.json());
      setTeachers(await teacherRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.classId || !formData.subjectId || !formData.teacherId) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ classId: "", subjectId: "", teacherId: "" });
        fetchData(); // reload
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create assignment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this assignment?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/assignments/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 style={{ margin: "0 0 24px 0", fontSize: "28px", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
        <ClipboardList size={28} /> Assignments
      </h1>

      <div style={{ padding: "24px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "32px", maxWidth: "800px" }}>
        <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#0f172a" }}>Assign Teacher to Class & Subject</h2>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "14px", color: "#475569", fontWeight: "500" }}>Class</label>
            <select required value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
              <option value="">Select a Class...</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "14px", color: "#475569", fontWeight: "500" }}>Subject</label>
            <select required value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
              <option value="">Select a Subject...</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "14px", color: "#475569", fontWeight: "500" }}>Teacher</label>
            <select required value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
              <option value="">Select a Teacher...</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.displayName || t.email}</option>)}
            </select>
          </div>

          <button type="submit" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#10b981", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", height: "40px" }}>
            <Plus size={18} /> Assign
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden", maxWidth: "900px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "#f8fafc", color: "#475569", fontSize: "14px", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              <th style={{ padding: "12px 16px", fontWeight: "600" }}>Class</th>
              <th style={{ padding: "12px 16px", fontWeight: "600" }}>Subject</th>
              <th style={{ padding: "12px 16px", fontWeight: "600" }}>Teacher</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: "16px", textAlign: "center" }}>Loading...</td></tr>
            ) : assignments.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: "16px", textAlign: "center", color: "#64748b" }}>No assignments found.</td></tr>
            ) : (
              assignments.map(assign => (
                <tr key={assign._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 16px" }}>{assign.classId?.name || "Deleted Class"}</td>
                  <td style={{ padding: "12px 16px", color: "#3b82f6", fontWeight: "500" }}>{assign.subjectId?.name || "Deleted Subject"}</td>
                  <td style={{ padding: "12px 16px" }}>{assign.teacherId?.displayName || assign.teacherId?.email || "Deleted Teacher"}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button onClick={() => handleDelete(assign._id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px" }}>Remove</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
