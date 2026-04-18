import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Link, Briefcase, Plus, X, ClipboardList } from "lucide-react";
import { AssignmentManagementSkeleton } from "../components/SkeletonUI";

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
        fetch(`${import.meta.env.VITE_API_URL}/api/users?role=teacher`),
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
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ classId: "", subjectId: "", teacherId: "" });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create assignment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/assignments/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const overview = useMemo(() => {
    const totalFaculty = new Set(
      assignments.map((a) => a.teacherId?._id).filter(Boolean)
    ).size;
    return {
      activeCourses: assignments.length,
      totalCourses: classes.length,
      totalFaculty,
    };
  }, [assignments, classes]);

  return (
    <>
      {loading && <AssignmentManagementSkeleton />}
      {!loading && (
    <section style={{ display: "grid", gap: 16 }}>
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ display: "grid", gap: 8 }}
      >
        <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.16em", color: "#8f7a67", textTransform: "uppercase", fontWeight: 800 }}>
          Academic Authority · Curriculum
        </p>
        <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.06, color: "#232b37" }}>Global Assignments</h1>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
          Manage course distribution and faculty workload across the university ecosystem.
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        style={{
          border: "1px solid var(--line)",
          borderRadius: 16,
          background: "#fff",
          padding: 14,
          display: "grid",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 17, color: "#2d3542" }}>Assign Teacher to Class & Subject</h2>

        <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, alignItems: "end" }}>
          <Field label="Class">
            <select
              required
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select class...</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Subject">
            <select
              required
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select subject...</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Teacher">
            <select
              required
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              style={selectStyle}
            >
              <option value="">Select teacher...</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.displayName || t.email}
                </option>
              ))}
            </select>
          </Field>

          <button
            type="submit"
            style={{
              height: 40,
              border: 0,
              borderRadius: 12,
              background: "var(--accent-strong)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Plus size={16} /> Assign
          </button>
        </form>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 210px", gap: 14 }}>
        <div style={{ border: "1px solid var(--line)", borderRadius: 16, background: "#fff", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #eef1f5" }}>
            <h3 style={{ margin: 0, fontSize: 16, color: "#2d3644" }}>Master Course List</h3>
            <span style={{ color: "#22a35a", fontSize: 11, fontWeight: 700 }}>
              ● {overview.activeCourses} ACTIVE COURSES
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "#f7f9fc", color: "#647181", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <tr>
                <th style={{ padding: "10px 12px" }}>Class Name</th>
                <th style={{ padding: "10px 12px" }}>Subject</th>
                <th style={{ padding: "10px 12px" }}>Assigned Teacher(s)</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: 16, textAlign: "center", color: "var(--muted)" }}>
                    Loading assignments...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: 16, textAlign: "center", color: "var(--muted)" }}>
                    No assignments available.
                  </td>
                </tr>
              ) : (
                assignments.map((assign) => (
                  <tr key={assign._id} style={{ borderTop: "1px solid #f0f2f5" }}>
                    <td style={{ padding: "11px 12px", fontWeight: 700, color: "#2a3340" }}>
                      {assign.classId?.name || "Deleted Class"}
                    </td>
                    <td style={{ padding: "11px 12px", color: "#4b5563" }}>
                      {assign.subjectId?.name || "Deleted Subject"}
                    </td>
                    <td style={{ padding: "11px 12px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          background: "#eaf0f7",
                          border: "1px solid #d8e2ef",
                          borderRadius: 999,
                          padding: "5px 10px",
                          fontSize: 11,
                          color: "#3b495a",
                        }}
                      >
                        {assign.teacherId?.displayName || assign.teacherId?.email || "Deleted Teacher"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 12px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(assign._id)}
                        style={{ border: 0, background: "transparent", color: "#bc4e4e", cursor: "pointer", fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ borderTop: "1px solid #eef1f5", padding: "10px 12px", color: "#7a8595", fontSize: 11 }}>
            Showing {assignments.length} of {classes.length} classes
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <div style={{ border: "1px solid #efdfd3", background: "#f8eee7", borderRadius: 14, padding: 12 }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 12, color: "#5e5044", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Status Overview
            </h4>

            <div style={{ borderRadius: 12, background: "#fff", border: "1px solid #efe3da", padding: 10, marginBottom: 8 }}>
              <div style={{ color: "#8c98a7", fontSize: 10, textTransform: "uppercase", fontWeight: 700 }}>Unassigned Courses</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 3 }}>
                <strong style={{ fontSize: 24, color: "#c0602b" }}>{Math.max(classes.length - assignments.length, 0)}</strong>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#b35322" }}>CRITICAL</span>
              </div>
            </div>

            <div style={{ borderRadius: 12, background: "#fff", border: "1px solid #efe3da", padding: 10 }}>
              <div style={{ color: "#8c98a7", fontSize: 10, textTransform: "uppercase", fontWeight: 700 }}>Total Faculty</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 3 }}>
                <strong style={{ fontSize: 24, color: "#2d3947" }}>{overview.totalFaculty}</strong>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#1f8d4f" }}>ACTIVE</span>
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: 14, background: "#fff", padding: 12 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 13, color: "#2c3442" }}>Assignment Summary</h4>
            <div style={{ color: "#7a8595", fontSize: 12, lineHeight: 1.5 }}>
              <div>Total courses: {overview.totalCourses}</div>
              <div>Active assignments: {overview.activeCourses}</div>
              <div>Available teachers: {teachers.length}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
      )}
    </>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 11, color: "#788294", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const selectStyle = {
  height: 40,
  borderRadius: 10,
  border: "1px solid #d8dde6",
  background: "#fff",
  padding: "0 10px",
  color: "#2f3743",
};
