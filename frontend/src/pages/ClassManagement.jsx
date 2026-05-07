import { apiFetch } from "../utils/apiFetch";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {Plus, GraduationCap, Search, Users, Trash2 } from "lucide-react";
import { ClassManagementSkeleton } from "../components/SkeletonUI";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/classes`);
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
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
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
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

  const confirmDelete = async () => {
    if (!classToDelete) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/classes/${classToDelete._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Class and assignments deleted");
        setIsDeleteModalOpen(false);
        setClassToDelete(null);
        fetchClasses();
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

  const filtered = useMemo(
    () => classes.filter((c) => c.name?.toLowerCase().includes(query.toLowerCase())),
    [classes, query]
  );

  if (loading) return <ClassManagementSkeleton />;

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.1, color: "#232b37" }}>Class Management</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 13 }}>
            Organize class groups and open roster configuration for each cohort.
          </p>
        </div>

        <form onSubmit={handleAddClass} style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Create new class..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              height: 40,
              minWidth: 210,
              borderRadius: 999,
              border: "1px solid #d5dbe4",
              padding: "0 14px",
              fontSize: 13,
              outline: "none",
              background: "#fff",
            }}
          />
          <button
            type="submit"
            style={{
              border: 0,
              background: "var(--accent-strong)",
              color: "#fff",
              borderRadius: 999,
              padding: "0 14px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              cursor: "pointer",
              height: 40,
            }}
          >
            <Plus size={16} /> Create
          </button>
        </form>
      </motion.header>

      <div
        style={{
          border: "1px solid var(--line)",
          background: "#FFFFFF",
          borderRadius: 16,
          padding: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#697383", fontSize: 13, fontWeight: 600 }}>
          <GraduationCap size={16} />
          {filtered.length} class groups
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #dadfe6",
            borderRadius: 999,
            background: "#fff",
            height: 36,
            padding: "0 12px",
            minWidth: 240,
          }}
        >
          <Search size={15} color="#7a8491" />
          <input
            type="text"
            placeholder="Search classes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: 0, outline: "none", width: "100%", fontSize: 13, background: "transparent" }}
          />
        </label>
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)", padding: "8px 2px" }}>Loading classes...</div>
      ) : filtered.length === 0 ? (
        <div style={{ border: "1px solid var(--line)", borderRadius: 14, background: "#fff", padding: 18, color: "var(--muted)" }}>
          No classes found.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
          {filtered.map((cls, idx) => (
            <motion.article
              key={cls._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              whileHover={{ y: -2 }}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                background: "#fff",
                padding: 14,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#26303d", fontWeight: 700 }}>
                  <GraduationCap size={15} color="var(--accent-strong)" /> {cls.name}
                </span>
                <button
                  onClick={() => {
                    setClassToDelete(cls);
                    setIsDeleteModalOpen(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#d1d5db",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 6,
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "#fee2e2"; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = "#d1d5db"; e.currentTarget.style.background = "none"; }}
                  title="Delete Class"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#5f6b79", fontSize: 13 }}>
                <Users size={14} /> {Array.isArray(cls.students) ? cls.students.length : 0} students enrolled
              </div>

              <Link
                to={`/admin/classes/${cls._id}`}
                style={{
                  marginTop: 4,
                  textDecoration: "none",
                  borderRadius: 999,
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  background: "rgba(99, 102, 241, 0.08)",
                  color: "var(--accent-strong)",
                  fontWeight: 700,
                  fontSize: 12,
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                Manage Roster
              </Link>
            </motion.article>
          ))}
        </div>
      )}

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
                width: "min(400px, 100%)",
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
              <h2 style={{ margin: "0 0 10px", fontSize: 22, color: "#111827", fontWeight: 800 }}>Delete Class?</h2>
              <p style={{ margin: "0 0 28px", color: "#6b7280", fontSize: 15, lineHeight: 1.6 }}>
                Are you sure you want to delete <strong style={{ color: "#111827" }}>{classToDelete?.name}</strong>? 
                This will permanently remove all subject-teacher assignments associated with this cohort.
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
                    transition: "all 0.2s"
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
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8
                  }}
                >
                  {isDeleting ? (
                    <div style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  ) : "Delete Class"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
