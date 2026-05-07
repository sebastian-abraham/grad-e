import { apiFetch } from "../utils/apiFetch";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { SubjectManagementSkeleton } from "../components/SkeletonUI";

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!subjectToDelete) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/subjects/${subjectToDelete._id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSubjects();
        toast.success("Subject removed");
        setIsDeleteModalOpen(false);
        setSubjectToDelete(null);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
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
                      onClick={() => {
                        setSubjectToDelete(sub);
                        setIsDeleteModalOpen(true);
                      }}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(19, 26, 38, 0.48)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 16,
            }}
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(380px, 100%)",
                borderRadius: 24,
                background: "#fff",
                padding: "32px 24px",
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "#fef2f2",
                  color: "#dc2626",
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Trash2 size={32} />
              </div>
              <h2 style={{ margin: "0 0 10px", fontSize: 22, color: "#111827", fontWeight: 800 }}>Delete Subject?</h2>
              <p style={{ margin: "0 0 28px", color: "#6b7280", fontSize: 15, lineHeight: 1.6 }}>
                Are you sure you want to remove <strong style={{ color: "#111827" }}>{subjectToDelete?.name}</strong>? 
                This action cannot be undone.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    background: "#fff",
                    padding: "12px",
                    cursor: "pointer",
                    fontWeight: 700,
                    color: "#374151",
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  style={{
                    border: 0,
                    borderRadius: 14,
                    background: "#dc2626",
                    color: "#fff",
                    padding: "12px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8
                  }}
                >
                  {isDeleting ? (
                    <div style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  ) : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
