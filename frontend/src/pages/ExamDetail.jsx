import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Eye,
  FileText,
  Grid as GridIcon,
  PlayCircle,
  Plus,
  Play,
  Settings,
  Upload,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const panel = {
  backgroundColor: "#fff",
  border: "1px solid var(--line)",
  borderRadius: "16px",
  boxShadow: "0 10px 28px rgba(42, 56, 74, 0.06)",
};

export default function ExamDetail() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [activeTab, setActiveTab] = useState("sheets");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${id}`);
      const data = await res.json();
      setExam(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !exam) return <div>Loading exam details...</div>;

  const tabs = [
    { id: "sheets", label: "Answer Sheets", icon: <Upload size={16} /> },
    { id: "seating", label: "Seating Arrangement", icon: <Settings size={16} /> },
    { id: "overview", label: "Class Overview", icon: <BarChart3 size={16} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: "100%" }}>
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          ...panel,
          padding: 18,
          background: "linear-gradient(180deg, #fff, #fcfcfd)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <Link
              to="/teacher"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--muted)",
                textDecoration: "none",
                fontSize: 13,
              }}
            >
              <ArrowLeft size={14} /> Back
            </Link>
            <h1 style={{ margin: "6px 0 4px", fontSize: 34, lineHeight: 1.1 }}>{exam.name}</h1>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
              {exam.subjectId?.name || "Subject"} • {exam.classId?.name || "Class"} • Max Marks {exam.totalMarks}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              style={{
                border: "1px solid var(--line)",
                background: "#fff",
                color: "var(--ink)",
                borderRadius: 999,
                padding: "10px 16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Edit Exam Details
            </button>
            <button
              type="button"
              style={{
                border: 0,
                background: "var(--accent-strong)",
                color: "#fff",
                borderRadius: 999,
                padding: "10px 16px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 8px 18px rgba(46, 86, 190, 0.26)",
              }}
            >
              Publish Results
            </button>
            <span
              style={{
                background: "rgba(62, 101, 204, 0.12)",
                color: "var(--accent-strong)",
                border: "1px solid rgba(62, 101, 204, 0.24)",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 10px",
              }}
            >
              {exam.status}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, borderTop: "1px solid var(--line)", marginTop: 14, paddingTop: 10 }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  border: "none",
                  background: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 0",
                  fontWeight: active ? 700 : 600,
                  color: active ? "var(--accent-strong)" : "#657082",
                  borderBottom: active ? "2px solid var(--accent-strong)" : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {activeTab === "sheets" && <AnswerSheetsTab exam={exam} fetchExam={fetchExam} />}
          {activeTab === "seating" && <SeatingTab exam={exam} fetchExam={fetchExam} />}
          {activeTab === "overview" && <OverviewTab exam={exam} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AnswerSheetsTab({ exam, fetchExam }) {
  const [submissions, setSubmissions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [classStudents, setClassStudents] = useState([]);

  useEffect(() => {
    fetchSubmissions();
    if (exam.classId?._id) fetchClassStudents();
  }, [exam]);

  const fetchSubmissions = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}/submissions`);
    setSubmissions(await res.json());
  };

  const fetchClassStudents = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classes/${exam.classId._id}`);
    const data = await res.json();
    setClassStudents(data.students);
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);

    const fd = new FormData();
    for (let i = 0; i < files.length; i += 1) fd.append("sheets", files[i]);

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}/submissions`, {
        method: "POST",
        body: fd,
      });
      fetchSubmissions();
      fetchExam();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleAssignStudent = async (subId, studentId) => {
    try {
      if (!studentId) return;
      await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}/submissions/${subId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      fetchSubmissions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}/grade-all`, { method: "POST" });
    fetchExam();
    setTimeout(() => {
      fetchSubmissions();
      fetchExam();
      setProcessing(false);
    }, 3500);
  };

  const unassigned = submissions.filter((s) => !s.studentId).length;
  const graded = submissions.filter((s) => s.status === "Graded");
  const avgScore =
    graded.length > 0
      ? (graded.reduce((sum, item) => sum + Number(item.score || 0), 0) / graded.length).toFixed(1)
      : "0.0";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          ...panel,
          borderColor: "rgba(62, 101, 204, 0.25)",
          background: "rgba(62, 101, 204, 0.06)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--accent-strong)", fontSize: 13, fontWeight: 600 }}>
          <AlertTriangle size={16} />
          Adjacent-sheet similarity is monitored. Review flagged papers before final publish.
        </div>
        <button
          type="button"
          style={{
            border: "1px solid rgba(62, 101, 204, 0.35)",
            background: "#fff",
            color: "var(--accent-strong)",
            borderRadius: 999,
            padding: "8px 12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Review Flags
        </button>
      </motion.div>

      <div style={{ ...panel, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Scanned Batches <span style={{ color: "var(--muted)", fontWeight: 500, fontSize: 13 }}>({submissions.length} total)</span></h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid var(--line)",
                borderRadius: 999,
                padding: "9px 14px",
                background: "#fff",
                color: "var(--ink)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload Sheets"}
              <input type="file" multiple accept="application/pdf" onChange={handleUpload} style={{ display: "none" }} disabled={uploading} />
            </label>

            <button
              onClick={handleProcess}
              disabled={submissions.length === 0 || processing || exam.status === "Graded"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                borderRadius: 999,
                padding: "9px 14px",
                background: "var(--accent-strong)",
                color: "#fff",
                fontWeight: 700,
                cursor: submissions.length === 0 || processing || exam.status === "Graded" ? "not-allowed" : "pointer",
                opacity: submissions.length === 0 || exam.status === "Graded" ? 0.5 : 1,
                boxShadow: "0 10px 20px rgba(46, 86, 190, 0.22)",
              }}
            >
              <Play size={16} />
              {processing ? "Processing..." : exam.status === "Graded" ? "Grading Complete" : "Process Papers"}
            </button>
          </div>
        </div>

        <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "#f9fafb", color: "#5f6b79", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <tr>
                <th style={{ padding: "12px 14px" }}>Filename</th>
                <th style={{ padding: "12px 14px" }}>Matched Student</th>
                <th style={{ padding: "12px 14px" }}>Score</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: 22, textAlign: "center", color: "var(--muted)" }}>
                    No sheets uploaded yet.
                  </td>
                </tr>
              ) : (
                submissions.map((sub, idx) => (
                  <motion.tr
                    key={sub._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: idx * 0.03 }}
                    style={{ borderTop: idx === 0 ? "none" : "1px solid var(--line)" }}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#364153" }}>{sub.fileName || `calc_mid_${String(idx + 1).padStart(3, "0")}.pdf`}</td>
                    <td style={{ padding: "12px 14px" }}>
                      {sub.studentId ? (
                        <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                          {sub.studentId.displayName || sub.studentId.email}
                        </span>
                      ) : (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <AlertTriangle size={15} color="var(--accent)" />
                          <select
                            onChange={(e) => handleAssignStudent(sub._id, e.target.value)}
                            style={{
                              border: "1px solid var(--accent)",
                              borderRadius: 999,
                              padding: "7px 10px",
                              background: "rgba(62, 101, 204, 0.08)",
                              color: "var(--accent-strong)",
                              fontWeight: 700,
                              minWidth: 140,
                            }}
                          >
                            <option value="">Assign Student</option>
                            {classStudents.map((cs) => (
                              <option key={cs._id} value={cs._id}>
                                {cs.displayName || cs.email}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {sub.status === "Graded" ? (
                        <span style={{ fontWeight: 700, color: "var(--accent-strong)" }}>{sub.score}/{exam.totalMarks}</span>
                      ) : (
                        <span style={{ color: "var(--muted)" }}>Pending</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      {sub.status === "Graded" ? (
                        <Link
                          to={`/teacher/exams/${exam._id}/grade/${sub._id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            textDecoration: "none",
                            borderRadius: 999,
                            padding: "7px 12px",
                            border: "1px solid var(--line)",
                            color: "var(--ink)",
                            fontWeight: 700,
                          }}
                        >
                          <Eye size={14} /> Review
                        </Link>
                      ) : null}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <MetricCard title="Processing Progress" value={`${submissions.length > 0 ? 88 : 0}%`} subtitle="from last upload" color="var(--accent-strong)" />
        <MetricCard title="Anomaly Detection" value={`${unassigned}`} subtitle="Unlinked sheets" color="var(--accent)" />
        <MetricCard title="Average Score" value={`${avgScore}`} subtitle="Class performance" color="var(--accent-strong)" />
      </div>
    </div>
  );
}

function SeatingTab({ exam, fetchExam }) {
  const [rows, setRows] = useState(exam.seatingArrangement?.rows || 6);
  const [cols, setCols] = useState(exam.seatingArrangement?.cols || 8);
  const [assignments, setAssignments] = useState(exam.seatingArrangement?.assignments || []);
  const [classStudents, setClassStudents] = useState([]);

  useEffect(() => {
    if (exam.classId?._id) fetchClassStudents();
  }, [exam]);

  const fetchClassStudents = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classes/${exam.classId._id}`);
    const data = await res.json();
    setClassStudents(data.students);
  };

  const handleCellClick = (r, c) => {
    const existingIdx = assignments.findIndex((a) => a.row === r && a.col === c);
    const next = [...assignments];

    if (existingIdx !== -1) {
      next.splice(existingIdx, 1);
    } else {
      const assignedIds = new Set(next.map((a) => a.studentId));
      const unassignedStudent = classStudents.find((s) => !assignedIds.has(s._id));
      if (!unassignedStudent) {
        toast.error("All class students currently enrolled are assigned to seats.");
        return;
      }
      next.push({ row: r, col: c, studentId: unassignedStudent._id, studentDetails: unassignedStudent });
    }

    setAssignments(next);
  };

  const saveSeating = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatingArrangement: { rows, cols, assignments } }),
      });
      if (res.ok) {
        toast.success("Seating layout saved!");
        fetchExam();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const randomizeAssignments = () => {
    const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
    const next = [];
    let pointer = 0;

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (pointer < shuffled.length) {
          next.push({ row: r, col: c, studentId: shuffled[pointer]._id, studentDetails: shuffled[pointer] });
          pointer += 1;
        }
      }
    }

    setAssignments(next);
  };

  const assignedCount = assignments.length;
  const totalDesks = rows * cols;
  const riskCells = useMemo(() => {
    const risky = new Set();
    for (let i = 0; i < assignments.length; i += 1) {
      for (let j = i + 1; j < assignments.length; j += 1) {
        const a = assignments[i];
        const b = assignments[j];
        const adjacent = Math.abs(a.row - b.row) <= 1 && Math.abs(a.col - b.col) <= 1;
        if (adjacent) {
          risky.add(`${a.row}-${a.col}`);
          risky.add(`${b.row}-${b.col}`);
        }
      }
    }
    return risky;
  }, [assignments]);

  return (
    <div style={{ ...panel, padding: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 14 }}>
        <NumberInput label="Rows" value={rows} onChange={(v) => setRows(v)} />
        <NumberInput label="Columns" value={cols} onChange={(v) => setCols(v)} />
        <button
          type="button"
          onClick={randomizeAssignments}
          style={{
            height: 36,
            borderRadius: 999,
            border: "1px solid var(--line)",
            background: "#fff",
            color: "var(--ink)",
            fontWeight: 700,
            padding: "0 14px",
            cursor: "pointer",
          }}
        >
          Randomize
        </button>
        <button
          type="button"
          onClick={saveSeating}
          style={{
            height: 36,
            borderRadius: 999,
            border: 0,
            background: "var(--accent-strong)",
            color: "#fff",
            fontWeight: 700,
            padding: "0 14px",
            cursor: "pointer",
            boxShadow: "0 8px 18px rgba(46, 86, 190, 0.22)",
          }}
        >
          Generate Grid
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)", marginBottom: 10, flexWrap: "wrap" }}>
        <LegendDot label="Empty Desk" color="#f4f6f8" border="1px solid #d9dde3" />
        <LegendDot label="Assigned" color="rgba(62, 101, 204, 0.18)" border="1px solid rgba(62, 101, 204, 0.38)" />
        <LegendDot label="Proximity Risk" color="rgba(62, 101, 204, 0.32)" border="1px solid var(--accent-strong)" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          background: "#f8fafc",
          padding: 14,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 8,
            minWidth: `${cols * 56}px`,
          }}
        >
          {Array.from({ length: rows }).flatMap((_, r) =>
            Array.from({ length: cols }).map((__, c) => {
              const assigned = assignments.find((a) => a.row === r && a.col === c);
              const cellKey = `${r}-${c}`;
              const risky = riskCells.has(cellKey);

              return (
                <motion.button
                  key={cellKey}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCellClick(r, c)}
                  title={`Desk R-${r + 1}-${c + 1}`}
                  style={{
                    height: 48,
                    borderRadius: 10,
                    border: assigned
                      ? risky
                        ? "1px solid var(--accent-strong)"
                        : "1px solid rgba(62, 101, 204, 0.36)"
                      : "1px dashed #d2d8e0",
                    background: assigned
                      ? risky
                        ? "rgba(62, 101, 204, 0.32)"
                        : "rgba(62, 101, 204, 0.16)"
                      : "#fff",
                    color: assigned ? "var(--accent-strong)" : "#a0aabc",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {assigned ? "👤" : "＋"}
                </motion.button>
              );
            })
          )}
        </div>

        <div
          style={{
            marginTop: 14,
            textAlign: "center",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "#8a95a3",
            textTransform: "uppercase",
          }}
        >
          Examination Front / Proctor Desk
        </div>
      </motion.div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 13, color: "#5a6676" }}>
        <span>Total Capacity: {totalDesks} Desks</span>
        <span>Assigned Students: {assignedCount}</span>
        <span>Free Capacity: {Math.max(totalDesks - assignedCount, 0)}</span>
      </div>
    </div>
  );
}

function OverviewTab({ exam }) {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}/submissions`)
      .then((res) => res.json())
      .then((data) => setSubmissions(data.filter((s) => s.status === "Graded")));
  }, [exam]);

  if (submissions.length === 0) {
    return (
      <div style={{ ...panel, padding: 30, textAlign: "center", color: "var(--muted)" }}>
        Not enough graded submissions to generate an overview.
      </div>
    );
  }

  const scores = submissions.map((s) => Number(s.score || 0));
  const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const max = Math.max(...scores);

  const ranges = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
  scores.forEach((s) => {
    if (s <= 20) ranges["0-20"] += 1;
    else if (s <= 40) ranges["21-40"] += 1;
    else if (s <= 60) ranges["41-60"] += 1;
    else if (s <= 80) ranges["61-80"] += 1;
    else ranges["81-100"] += 1;
  });

  const chartData = {
    labels: Object.keys(ranges),
    datasets: [
      {
        label: "Frequency (%)",
        data: Object.values(ranges),
        backgroundColor: [
          "rgba(46, 86, 190, 0.25)",
          "rgba(46, 86, 190, 0.38)",
          "rgba(46, 86, 190, 0.52)",
          "rgba(62, 101, 204, 0.68)",
          "rgba(62, 101, 204, 0.86)",
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#1f2937", titleColor: "#fff", bodyColor: "#fff" },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#edf0f4" } },
    },
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <MetricCard title="Class Average" value={`${avg}%`} subtitle="vs last term" color="var(--accent-strong)" />
        <MetricCard title="Highest Score" value={`${max}/${exam.totalMarks}`} subtitle="Top performance" color="var(--accent)" />
        <MetricCard title="Total Submissions" value={`${submissions.length}`} subtitle={`of ${submissions.length}`} color="var(--accent-strong)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ ...panel, padding: 20 }}
        >
          <h3 style={{ margin: 0, fontSize: 20 }}>Score Distribution</h3>
          <p style={{ margin: "4px 0 12px", color: "var(--muted)", fontSize: 12 }}>Frequency (%)</p>
          <div style={{ height: 280 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.04 }}
          style={{ ...panel, padding: 20 }}
        >
          <h3 style={{ margin: 0 }}>Weakest Questions</h3>
          <p style={{ margin: "4px 0 14px", color: "var(--muted)", fontSize: 12 }}>Prioritize these areas for review</p>

          {[
            { q: "Q4 - Integral Calculus Basics", pct: 32 },
            { q: "Q7 - Mean Value Theorem", pct: 45 },
            { q: "Q2 - Limits at Infinity", pct: 51 },
          ].map((item) => (
            <div key={item.q} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{item.q}</span>
                <span style={{ color: "var(--accent-strong)", fontWeight: 700 }}>{item.pct}%</span>
              </div>
              <div style={{ height: 6, background: "#e6ebf2", borderRadius: 999 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ height: 6, borderRadius: 999, background: "var(--accent)" }}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            style={{
              marginTop: 4,
              width: "100%",
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "#fff",
              color: "var(--ink)",
              fontWeight: 700,
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            View Full Item Analysis
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      <input
        type="number"
        min="1"
        max="30"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: 84,
          height: 36,
          borderRadius: 10,
          border: "1px solid var(--line)",
          background: "#fff",
          padding: "0 10px",
          fontWeight: 700,
        }}
      />
    </label>
  );
}

function LegendDot({ label, color, border }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <i style={{ width: 10, height: 10, borderRadius: 999, background: color, border }} />
      {label}
    </span>
  );
}

function MetricCard({ title, value, subtitle, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        ...panel,
        padding: 16,
        background: "linear-gradient(180deg, #fff, #fbfcfe)",
      }}
    >
      <p style={{ margin: 0, color: "#778293", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
        {title}
      </p>
      <p style={{ margin: "6px 0 2px", color, fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{value}</p>
      <p style={{ margin: 0, color: "var(--muted)", fontSize: 12 }}>{subtitle}</p>
    </motion.div>
  );
}
