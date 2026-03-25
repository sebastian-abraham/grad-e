import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Clock3, FileText, LoaderCircle } from "lucide-react";
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
    if (exam.status === "Draft") return acc;
    const subject = exam.subjectId?.name || "Other";
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(exam);
    return acc;
  }, {});

  const getStatusColor = (exam) => {
    if (exam.status === "Graded" && exam.mySubmission?.score !== undefined) {
      return { bg: "#54b67e", text: "#ffffff", label: "GRADED" };
    }
    if (exam.status === "Graded" && !exam.mySubmission) {
      return { bg: "#f5bb8d", text: "#9a4600", label: "MISSED" };
    }
    if (exam.mySubmission) {
      return { bg: "#f8d58f", text: "#8a5203", label: "AWAITING" };
    }
    if (exam.status === "Processing") {
      return { bg: "#f5bb8d", text: "#9a4600", label: "PROCESSING" };
    }
    return { bg: "#eef0f3", text: "#5a6675", label: "PENDING" };
  };

  const getActionConfig = (exam) => {
    const hasResult = exam.status === "Graded" && exam.mySubmission?._id;

    if (hasResult) {
      return {
        icon: <ChevronRight size={14} />,
        label: "View Result",
        className: "primary",
        to: `/student/exams/${exam._id}/result/${exam.mySubmission._id}`,
      };
    }

    if (exam.mySubmission) {
      return { icon: <Clock3 size={14} />, label: "Awaiting Grading", className: "subtle" };
    }

    if (exam.status === "Processing") {
      return {
        icon: <LoaderCircle size={14} className="spin" />,
        label: "Processing",
        className: "subtle",
      };
    }

    return { icon: <Clock3 size={14} />, label: "Results Unavailable", className: "ghost" };
  };

  if (loading) return <div className="teacher-loading">Loading dashboard...</div>;

  return (
    <section className="teacher-dashboard">
      <motion.div
        className="teacher-dashboard-toolbar"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="teacher-dashboard-title">Academic Overview</h1>
        <div className="teacher-view-all">Student Dashboard</div>
      </motion.div>

      {Object.keys(groupedExams).length === 0 ? (
        <motion.div
          className="teacher-empty"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p>You do not have any active classes or exams yet.</p>
        </motion.div>
      ) : (
        Object.keys(groupedExams).map((subject, subjectIdx) => (
          <motion.div
            key={subject}
            className="teacher-subject"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: subjectIdx * 0.07 }}
          >
            <div className="teacher-subject-head">
              <h2 className="teacher-subject-title">{subject}</h2>
              <span className="teacher-view-all">{groupedExams[subject].length} Exams</span>
            </div>

            <div className="teacher-card-row">
              {groupedExams[subject].map((exam, examIdx) => {
                const status = getStatusColor(exam);
                const action = getActionConfig(exam);
                const score = exam.mySubmission?.score;

                return (
                  <motion.div
                    key={exam._id}
                    className="teacher-card-wrap"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: examIdx * 0.05 }}
                  >
                    <div className="teacher-exam-card">
                      <div className="teacher-exam-top">
                        <span className="teacher-chip" style={{ backgroundColor: status.bg, color: status.text }}>
                          {status.label}
                        </span>
                        <FileText size={17} color="#6b7481" />
                      </div>

                      <h3 className="teacher-exam-title">{exam.name}</h3>
                      <p className="teacher-meta">
                        {exam.date ? new Date(exam.date).toLocaleDateString() : "No date set"}
                      </p>
                      <p className="teacher-meta teacher-meta-soft">
                        {score !== undefined ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <CheckCircle2 size={14} color="#3e65cc" /> Score: {score}/{exam.totalMarks}
                          </span>
                        ) : (
                          "Result pending"
                        )}
                      </p>

                      {action.to ? (
                        <Link to={action.to} className={`teacher-card-action ${action.className}`}>
                          {action.icon}
                          {action.label}
                        </Link>
                      ) : (
                        <div className={`teacher-card-action ${action.className}`}>
                          {action.icon}
                          {action.label}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))
      )}
    </section>
  );
}
