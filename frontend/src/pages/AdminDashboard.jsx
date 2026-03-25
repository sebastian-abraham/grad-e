import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, BookOpen, GraduationCap, ClipboardList, LayoutDashboard, ChevronRight, Plus } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to load stats", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { id: "teachers", title: "Total Teachers", value: stats.teachers, icon: <Users size={17} color="#6b7481" />, link: "/admin/users", status: "Graded", meta: "User accounts" },
    { id: "students", title: "Total Students", value: stats.students, icon: <Users size={17} color="#6b7481" />, link: "/admin/users", status: "Sheets Uploaded", meta: "Student profiles" },
    { id: "classes", title: "Total Classes", value: stats.classes, icon: <GraduationCap size={17} color="#6b7481" />, link: "/admin/classes", status: "Setup Complete", meta: "Active classes" },
    { id: "subjects", title: "Total Subjects", value: stats.subjects, icon: <BookOpen size={17} color="#6b7481" />, link: "/admin/subjects", status: "Draft", meta: "Subject catalog" },
  ];

  const quickActions = [
    { id: "users", title: "Manage Users", link: "/admin/users", icon: <Users size={17} color="#6b7481" /> },
    { id: "classes", title: "Manage Classes", link: "/admin/classes", icon: <GraduationCap size={17} color="#6b7481" /> },
    { id: "subjects", title: "Manage Subjects", link: "/admin/subjects", icon: <BookOpen size={17} color="#6b7481" /> },
    { id: "assignments", title: "Manage Assignments", link: "/admin/assignments", icon: <ClipboardList size={17} color="#6b7481" /> },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Draft":
        return { bg: "#eef0f3", text: "#5a6675" };
      case "Setup Complete":
        return { bg: "#f8d58f", text: "#8a5203" };
      case "Sheets Uploaded":
        return { bg: "#8fddb5", text: "#065f46" };
      case "Processing":
        return { bg: "#f5bb8d", text: "#9a4600" };
      case "Graded":
        return { bg: "#54b67e", text: "#ffffff" };
      default:
        return { bg: "#eef0f3", text: "#5a6675" };
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <section className="teacher-dashboard">
      <motion.div
        className="teacher-dashboard-toolbar"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="teacher-dashboard-title">Admin Dashboard</h1>
        <button onClick={() => navigate("/admin/users")} className="teacher-primary-btn teacher-primary-btn--caps">
          <Plus size={18} /> Add User
        </button>
      </motion.div>

      <motion.div
        className="teacher-subject"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="teacher-subject-head">
          <h2 className="teacher-subject-title">Platform Summary</h2>
          <span className="teacher-view-all">Overview</span>
        </div>

        <div className="teacher-card-row">
          {statCards.map((card, idx) => {
            const colors = getStatusColor(card.status);
            return (
              <motion.div
                key={card.id}
                className="teacher-card-wrap"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Link to={card.link} className="teacher-exam-card">
                  <div className="teacher-exam-top">
                    <span className="teacher-chip" style={{ backgroundColor: colors.bg, color: colors.text }}>
                      {card.status.toUpperCase()}
                    </span>
                    <LayoutDashboard size={17} color="#6b7481" />
                  </div>

                  <h3 className="teacher-exam-title">{card.title}</h3>
                  <p className="teacher-meta">{card.meta}</p>
                  <p className="teacher-meta teacher-meta-soft">Current count: {card.value}</p>

                  <div className="teacher-card-action primary">
                    <ChevronRight size={14} /> Open
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="teacher-subject"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <div className="teacher-subject-head">
          <h2 className="teacher-subject-title">Quick Management</h2>
          <span className="teacher-view-all">Shortcuts</span>
        </div>

        <div className="teacher-card-row">
          {quickActions.map((item, idx) => (
            <motion.div
              key={item.id}
              className="teacher-card-wrap"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: idx * 0.05 }}
            >
              <Link to={item.link} className="teacher-exam-card">
                <div className="teacher-exam-top">
                  <span className="teacher-chip" style={{ backgroundColor: "#eef0f3", color: "#5a6675" }}>
                    ACTION
                  </span>
                  {item.icon}
                </div>

                <h3 className="teacher-exam-title">{item.title}</h3>
                <p className="teacher-meta">Navigate to {item.title.toLowerCase()}.</p>
                <p className="teacher-meta teacher-meta-soft">Administrative tools</p>

                <div className="teacher-card-action ghost">
                  <ChevronRight size={14} /> Open Panel
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
