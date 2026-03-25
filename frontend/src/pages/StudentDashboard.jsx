import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CalendarDays, CheckCircle2, Clock3, FileText, History, Sigma } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [currentUser]);

  const fetchExams = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/student/dashboard/${currentUser._id}`);
      const data = await res.json();
      setExams(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const groupedExams = exams.reduce((acc, exam) => {
    const subName = exam.subjectId?.name || "Other";
    if (!acc[subName]) acc[subName] = [];
    acc[subName].push(exam);
    return acc;
  }, {});

  const gradedExams = useMemo(
    () => exams.filter((exam) => exam.status === "Graded" && exam.mySubmission?.score !== undefined),
    [exams]
  );

  const gpa = useMemo(() => {
    if (gradedExams.length === 0) return "0.00";
    const total = gradedExams.reduce((sum, exam) => {
      const pct = (Number(exam.mySubmission.score) / Number(exam.totalMarks || 1)) * 100;
      return sum + pct;
    }, 0);
    const avgPct = total / gradedExams.length;
    return ((avgPct / 100) * 4).toFixed(2);
  }, [gradedExams]);

  const sectionMeta = {
    Mathematics: { icon: <Sigma size={14} />, tone: "#f39d48", bg: "rgba(243, 157, 72, 0.18)" },
    Literature: { icon: <BookOpen size={14} />, tone: "var(--accent)", bg: "rgba(62, 101, 204, 0.15)" },
    History: { icon: <History size={14} />, tone: "#b7852b", bg: "rgba(183, 133, 43, 0.18)" },
    Other: { icon: <FileText size={14} />, tone: "var(--accent-strong)", bg: "rgba(46, 86, 190, 0.16)" },
  };

  const getCardStatus = (exam) => {
    if (exam.status === "Graded" && exam.mySubmission?.score !== undefined) {
      return { label: "Graded", color: "#1f8d4f", bg: "#daf5e4" };
    }
    return { label: "Pending", color: "#5f6b79", bg: "#eef2f7" };
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}
      >
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#916a46", fontWeight: 800 }}>
            Student Portal
          </p>
          <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.05, color: "#2d3440" }}>Academic Overview</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 14 }}>
            Tracking your progress across all disciplines. Review your latest graded assessments and upcoming deadlines.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <StatPill label="Current GPA" value={gpa} />
          <StatPill label="Exams Taken" value={`${gradedExams.length}`} />
        </div>
      </motion.header>

      {Object.keys(groupedExams).length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", fontSize: "16px" }}>You do not have any active classes or exams yet.</div>
        </div>
      ) : (
        Object.keys(groupedExams).map((subject, sectionIndex) => {
          const meta = sectionMeta[subject] || sectionMeta.Other;
          const visibleExams = groupedExams[subject].filter((exam) => exam.status !== "Draft");
          if (visibleExams.length === 0) return null;

          return (
            <motion.section
              key={subject}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: sectionIndex * 0.04 }}
              style={{ display: "grid", gap: 12 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    color: meta.tone,
                    background: meta.bg,
                  }}
                >
                  {meta.icon}
                </span>
                <h2 style={{ margin: 0, fontSize: 32, color: "#2f3542", lineHeight: 1.1 }}>{subject}</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {visibleExams.map((exam, idx) => {
                  const status = getCardStatus(exam);
                  const isGraded = exam.status === "Graded" && exam.mySubmission?.score !== undefined;
                  const score = isGraded ? Number(exam.mySubmission.score) : null;

                  return (
                    <motion.article
                      key={exam._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: idx * 0.03 }}
                      whileHover={{ y: -2 }}
                      style={{
                        borderRadius: 16,
                        border: "1px solid #e6eaef",
                        background: "#fff",
                        padding: 14,
                        minHeight: 140,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            borderRadius: 999,
                            padding: "4px 9px",
                            background: status.bg,
                            color: status.color,
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {isGraded ? <CheckCircle2 size={12} /> : <Clock3 size={12} />} {status.label}
                        </span>

                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#7d8794", fontSize: 11 }}>
                          <CalendarDays size={12} /> {exam.date ? new Date(exam.date).toLocaleDateString() : "TBD"}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#262d38", lineHeight: 1.3 }}>{exam.name}</p>

                      {isGraded ? (
                        <div style={{ marginTop: "auto", color: "#171c24", fontWeight: 800, fontSize: 44, lineHeight: 1 }}>
                          {score}
                          <span style={{ fontSize: 17, color: "#6f7886", fontWeight: 700 }}> / {exam.totalMarks}</span>
                        </div>
                      ) : (
                        <div style={{ marginTop: "auto", color: "#6f7886", fontSize: 13 }}>
                          {exam.mySubmission ? "Review in progress..." : "Scheduled Exam"}
                        </div>
                      )}

                      {!isGraded && (
                        <div style={{ color: "var(--accent-strong)", fontSize: 12, fontWeight: 600 }}>
                          {exam.mySubmission ? "Awaiting grading" : "Scheduled exam"}
                        </div>
                      )}

                      {isGraded ? (
                        <Link
                          to={`/student/exams/${exam._id}/result/${exam.mySubmission._id}`}
                          style={{
                            marginTop: 6,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            textDecoration: "none",
                            color: "var(--accent-strong)",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          View Result
                        </Link>
                      ) : null}
                    </motion.article>
                  );
                })}
              </div>
            </motion.section>
          );
        })
      )}
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div
      style={{
        minWidth: 106,
        borderRadius: 14,
        border: "1px solid #e5e9ef",
        background: "#fafbfc",
        padding: "8px 12px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#8b95a2",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 30, lineHeight: 1, color: "#202833", fontWeight: 800 }}>{value}</p>
    </div>
  );
}
