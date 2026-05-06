import { apiFetch } from "../utils/apiFetch";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, FileText, ChevronRight, Upload, Play, LoaderCircle, PencilLine } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { DashboardExamCardsSkeleton } from "../components/SkeletonUI";

export default function TeacherDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [currentUser]);

  const fetchExams = async () => {
    if (!currentUser) return;
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/exams?teacherId=${currentUser._id}`);
      const data = await res.json();
      setExams(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Group exams by subject
  const groupedExams = exams.reduce((acc, exam) => {
    const subName = exam.subjectId?.name || "Other";
    if (!acc[subName]) acc[subName] = [];
    acc[subName].push(exam);
    return acc;
  }, {});

  const getStatusColor = (status) => {
    switch (status) {
      case "Draft":
        return { bg: "#F1F5F9", text: "#475569" };
      case "Setup Complete":
        return { bg: "#FEF3C7", text: "#92400E" };
      case "Sheets Uploaded":
        return { bg: "#D1FAE5", text: "#065F46" };
      case "Processing":
        return { bg: "#FFEDD5", text: "#9A3412" };
      case "Graded":
        return { bg: "#6366F1", text: "#FFFFFF" };
      default:
        return { bg: "#F1F5F9", text: "#475569" };
    }
  };

  const getActionConfig = (status) => {
    switch (status) {
      case "Draft":
        return { icon: <PencilLine size={14} />, label: "Resume Setup", className: "ghost" };
      case "Setup Complete":
        return { icon: <Upload size={14} />, label: "Ready for Upload", className: "subtle" };
      case "Sheets Uploaded":
        return { icon: <Play size={14} />, label: "Process", className: "primary" };
      case "Processing":
        return { icon: <LoaderCircle size={14} className="spin" />, label: "Scanning Sheets", className: "subtle" };
      case "Graded":
        return { icon: <ChevronRight size={14} />, label: "View Results", className: "primary" };
      default:
        return { icon: <ChevronRight size={14} />, label: "View", className: "ghost" };
    }
  };

  if (loading) return <DashboardExamCardsSkeleton count={8} />;

  return (
    <section className="teacher-dashboard">
      <motion.div
        className="teacher-dashboard-toolbar"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="teacher-dashboard-title">Exams</h1>
        <button onClick={() => navigate("/teacher/create-exam")} className="teacher-primary-btn teacher-primary-btn--caps">
          <Plus size={18} /> New Exam
        </button>
      </motion.div>

      {Object.keys(groupedExams).length === 0 ? (
        <motion.div
          className="teacher-empty"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p>No exams created yet.</p>
          <button onClick={() => navigate("/teacher/create-exam")} className="teacher-primary-btn">
            Create your first exam
          </button>
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
              <span className="teacher-view-all">View All</span>
            </div>

            <div className="teacher-card-row">
              {groupedExams[subject].map((exam, examIdx) => {
                const colors = getStatusColor(exam.status);
                const action = getActionConfig(exam.status);
                return (
                  <motion.div
                    key={exam._id}
                    className="teacher-card-wrap"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: examIdx * 0.05 }}
                  >
                    <Link to={`/teacher/exams/${exam._id}`} className="teacher-exam-card">
                      <div className="teacher-exam-top">
                        <span className="teacher-chip" style={{ backgroundColor: colors.bg, color: colors.text }}>
                          {exam.status.toUpperCase()}
                        </span>
                        <FileText size={17} color="#64748B" />
                      </div>

                      <h3 className="teacher-exam-title">{exam.name}</h3>
                      <p className="teacher-meta">{exam.date ? new Date(exam.date).toLocaleDateString() : "No date set"}</p>
                      <p className="teacher-meta teacher-meta-soft">Class: {exam.classId?.name || "Not set"}</p>

                      <div className={`teacher-card-action ${action.className}`}>
                        {action.icon}
                        {action.label}
                      </div>
                    </Link>
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
