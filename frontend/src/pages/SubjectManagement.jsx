import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { BookOpen, Plus, FileEdit, Trash2, X } from "lucide-react";

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/subjects`);
      const data = await res.json();
      setSubjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        setName("");
        fetchSubjects();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save subject");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this subject?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/subjects/${id}`, { method: "DELETE" });
      if (res.ok) fetchSubjects();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 style={{ margin: "0 0 24px 0", fontSize: "28px", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
        <BookOpen size={28} /> Subject Management
      </h1>

      <form onSubmit={handleAddSubject} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input 
          type="text" 
          placeholder="New Subject Name (e.g., Mathematics)" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "300px", fontSize: "14px" }}
        />
        <button type="submit" style={{ backgroundColor: "#3b82f6", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
          Create Subject
        </button>
      </form>

      <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden", maxWidth: "600px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "#f8fafc", color: "#475569", fontSize: "14px", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              <th style={{ padding: "12px 16px", fontWeight: "600" }}>Subject Name</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", textAlign: "right", width: "100px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="2" style={{ padding: "16px", textAlign: "center" }}>Loading...</td></tr>
            ) : subjects.length === 0 ? (
              <tr><td colSpan="2" style={{ padding: "16px", textAlign: "center", color: "#64748b" }}>No subjects found.</td></tr>
            ) : (
              subjects.map(sub => (
                <tr key={sub._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "500", color: "#0f172a" }}>{sub.name}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button onClick={() => handleDelete(sub._id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px" }}>Delete</button>
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
