import { apiFetch } from "../utils/apiFetch";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BookOpen, Plus } from "lucide-react";
import { SubjectManagementSkeleton } from "../components/SkeletonUI";

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
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/subjects`);
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
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        setName("");
        fetchSubjects();
        toast.success("Subject created");
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
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/subjects/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSubjects();
        toast.success("Subject removed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <SubjectManagementSkeleton />;

  return (
    <section className="assign-page">
      {/* ── Page Header ── */}
      <motion.div
        className="assign-page-head"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <p className="assign-eyebrow">Academic Authority · Catalog</p>
        <h1>Subject Management</h1>
        <p>Define and maintain the master catalog of subjects offered across the platform.</p>
      </motion.div>

      {/* ── Add Subject Form ── */}
      <motion.div
        className="assign-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.04 }}
      >
        <h2 className="assign-card-title">Add New Subject</h2>
        <form onSubmit={handleAddSubject} className="assign-form-row" style={{ gridTemplateColumns: "1fr auto", maxWidth: "600px" }}>
          <div className="assign-field">
            <label htmlFor="subject-name">Subject Name</label>
            <input
              id="subject-name"
              type="text"
              required
              placeholder="e.g. Advanced Mathematics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="assign-select"
              style={{ cursor: "text" }}
            />
          </div>
          <button type="submit" className="assign-submit-btn">
            <Plus size={16} /> Create Subject
          </button>
        </form>
      </motion.div>

      {/* ── Subject List ── */}
      <motion.div
        className="assign-card"
        style={{ padding: 0, overflow: "hidden", maxWidth: "800px" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.08 }}
      >
        <div style={{ padding: "18px 24px" }} className="assign-table-header">
          <h3>Subject Catalog</h3>
          <span className="assign-active-badge">● {subjects.length} Subjects</span>
        </div>

        <table className="assign-table">
          <thead>
            <tr>
              <th>Subject Name</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ textAlign: "center", color: "var(--muted)", padding: "28px 14px" }}>
                  No subjects found. Create one above.
                </td>
              </tr>
            ) : (
              subjects.map(sub => (
                <tr key={sub._id}>
                  <td style={{ fontWeight: 700 }}>{sub.name}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="assign-remove-btn"
                      onClick={() => handleDelete(sub._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </section>
  );
}
