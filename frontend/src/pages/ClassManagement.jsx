import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, FileEdit, Trash2, X, Plus } from "lucide-react";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classes`);
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        setName("");
        fetchClasses();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save class");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classes/${id}`, { method: "DELETE" });
      if (res.ok) fetchClasses();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 style={{ margin: "0 0 24px 0", fontSize: "28px", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
        <GraduationCap size={28} /> Class Management
      </h1>

      <form onSubmit={handleAddClass} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input 
          type="text" 
          placeholder="New Class Name (e.g., Grade 10 A)" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "300px", fontSize: "14px" }}
        />
        <button type="submit" style={{ backgroundColor: "#3b82f6", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
          Create Class
        </button>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {loading ? (
          <div>Loading classes...</div>
        ) : classes.length === 0 ? (
          <div style={{ color: "#64748b" }}>No classes found.</div>
        ) : (
          classes.map(cls => (
            <div key={cls._id} style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#0f172a" }}>{cls.name}</h3>
                  <div style={{ fontSize: "14px", color: "#64748b" }}>{cls.students.length} Students enrolled</div>
                </div>
                <button onClick={() => handleDelete(cls._id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}>Delete</button>
              </div>
              
              <Link to={`/admin/classes/${cls._id}`} style={{
                display: "block", textAlign: "center", padding: "10px", 
                backgroundColor: "#f8fafc", color: "#3b82f6", borderRadius: "6px", 
                textDecoration: "none", fontWeight: "500", border: "1px solid #e2e8f0",
                transition: "background 0.2s"
              }}>
                Manage Roster & View Details
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
