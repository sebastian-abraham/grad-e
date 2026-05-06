import { apiFetch } from "../utils/apiFetch";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { AssignmentManagementSkeleton } from "../components/SkeletonUI";

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses]         = useState([]);
  const [subjects, setSubjects]       = useState([]);
  const [teachers, setTeachers]       = useState([]);
  const [formData, setFormData]       = useState({ classId: "", subjectId: "", teacherId: "" });
  const [loading, setLoading]         = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignRes, classRes, subRes, teacherRes] = await Promise.all([
        apiFetch(`${import.meta.env.VITE_API_URL}/api/assignments`),
        apiFetch(`${import.meta.env.VITE_API_URL}/api/classes`),
        apiFetch(`${import.meta.env.VITE_API_URL}/api/subjects`),
        apiFetch(`${import.meta.env.VITE_API_URL}/api/users?role=teacher`),
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
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ classId: "", subjectId: "", teacherId: "" });
        fetchData();
        toast.success("Assignment created");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create assignment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/assignments/${id}`, { method: "DELETE" });
      if (res.ok) { fetchData(); toast.success("Assignment removed"); }
    } catch (error) {
      console.error(error);
    }
  };

  const overview = useMemo(() => {
    const totalFaculty = new Set(assignments.map((a) => a.teacherId?._id).filter(Boolean)).size;
    return { activeCourses: assignments.length, totalCourses: classes.length, totalFaculty };
  }, [assignments, classes]);

  if (loading) return <AssignmentManagementSkeleton />;

  return (
    <section className="assign-page">

      {/* ── Page Header ── */}
      <motion.div
        className="assign-page-head"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}
      >
        <p className="assign-eyebrow">Academic Authority · Curriculum</p>
        <h1>Global Assignments</h1>
        <p>Manage course distribution and faculty workload across the university ecosystem.</p>
      </motion.div>

      {/* ── Assign Form ── */}
      <motion.div
        className="assign-card"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.04 }}
      >
        <h2 className="assign-card-title">Assign Teacher to Class & Subject</h2>
        <form onSubmit={handleCreate} className="assign-form-row">
          <div className="assign-field">
            <label htmlFor="assign-class">Class</label>
            <select
              id="assign-class"
              required
              className="assign-select"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            >
              <option value="">Select class…</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="assign-field">
            <label htmlFor="assign-subject">Subject</label>
            <select
              id="assign-subject"
              required
              className="assign-select"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            >
              <option value="">Select subject…</option>
              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>

          <div className="assign-field">
            <label htmlFor="assign-teacher">Teacher</label>
            <select
              id="assign-teacher"
              required
              className="assign-select"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            >
              <option value="">Select teacher…</option>
              {teachers.map((t) => <option key={t._id} value={t._id}>{t.displayName || t.email}</option>)}
            </select>
          </div>

          <button type="submit" className="assign-submit-btn">
            <Plus size={16} /> Assign
          </button>
        </form>
      </motion.div>

      {/* ── Table + Overview ── */}
      <motion.div
        className="assign-layout"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.08 }}
      >
        {/* Main Table */}
        <div className="assign-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px" }} className="assign-table-header">
            <h3>Master Course List</h3>
            <span className="assign-active-badge">● {overview.activeCourses} Active</span>
          </div>

          <table className="assign-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Subject</th>
                <th>Assigned Teacher</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: "28px 14px" }}>
                    No assignments yet. Create one above.
                  </td>
                </tr>
              ) : assignments.map((assign) => (
                <tr key={assign._id}>
                  <td style={{ fontWeight: 700 }}>{assign.classId?.name || "Deleted Class"}</td>
                  <td style={{ color: "var(--muted)" }}>{assign.subjectId?.name || "Deleted Subject"}</td>
                  <td>
                    <span className="assign-teacher-chip">
                      {assign.teacherId?.displayName || assign.teacherId?.email || "Deleted Teacher"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="assign-remove-btn"
                      onClick={() => handleDelete(assign._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="assign-table-footer">
            Showing {assignments.length} of {classes.length} class{classes.length !== 1 ? "es" : ""}
          </div>
        </div>

        {/* Overview Sidebar */}
        <div className="assign-overview-card">
          <p className="assign-overview-title">Status Overview</p>

          <div className="assign-overview-stat">
            <div className="assign-overview-stat-label">Unassigned Courses</div>
            <div className="assign-overview-stat-value" style={{ color: Math.max(classes.length - assignments.length, 0) > 0 ? "var(--danger)" : "var(--ink)" }}>
              {Math.max(classes.length - assignments.length, 0)}
            </div>
            <div className="assign-overview-stat-sub" style={{ color: "var(--danger)" }}>
              {Math.max(classes.length - assignments.length, 0) > 0 ? "NEEDS ATTENTION" : "ALL COVERED"}
            </div>
          </div>

          <div className="assign-overview-stat">
            <div className="assign-overview-stat-label">Active Faculty</div>
            <div className="assign-overview-stat-value" style={{ color: "var(--ink)" }}>
              {overview.totalFaculty}
            </div>
            <div className="assign-overview-stat-sub" style={{ color: "var(--success)" }}>ACTIVE</div>
          </div>

          <div className="assign-overview-stat">
            <div className="assign-overview-stat-label">Total Courses</div>
            <div className="assign-overview-stat-value" style={{ color: "var(--ink)" }}>
              {overview.totalCourses}
            </div>
            <div className="assign-overview-stat-sub" style={{ color: "var(--muted)" }}>IN CATALOG</div>
          </div>
        </div>
      </motion.div>

    </section>
  );
}
