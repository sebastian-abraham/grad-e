import { apiFetch } from "../utils/apiFetch";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, BookOpen, GraduationCap, ClipboardList, LayoutDashboard, ChevronRight, Plus, TrendingUp } from "lucide-react";
import { AdminDashboardSkeleton } from "../components/SkeletonUI";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, delay },
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, subjects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`);
      if (res.ok) setStats(await res.json());
    } catch (error) {
      console.error("Failed to load stats", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { id: "teachers",  title: "Total Teachers",  value: stats.teachers, icon: <Users size={20} />,         link: "/admin/users",       accent: "#6366F1", label: "FACULTY" },
    { id: "students",  title: "Total Students",  value: stats.students, icon: <GraduationCap size={20} />, link: "/admin/users",       accent: "#10B981", label: "ENROLLED" },
    { id: "classes",   title: "Total Classes",   value: stats.classes,  icon: <LayoutDashboard size={20}/>,link: "/admin/classes",     accent: "#F59E0B", label: "ACTIVE" },
    { id: "subjects",  title: "Total Subjects",  value: stats.subjects, icon: <BookOpen size={20} />,      link: "/admin/subjects",    accent: "#8B5CF6", label: "CATALOG" },
  ];

  const quickActions = [
    { id: "users",       title: "Manage Users",       link: "/admin/users",       icon: <Users size={18} />,         desc: "Create, edit and manage all user accounts" },
    { id: "classes",     title: "Manage Classes",     link: "/admin/classes",     icon: <GraduationCap size={18} />, desc: "Configure class groups and student rosters" },
    { id: "subjects",    title: "Manage Subjects",    link: "/admin/subjects",    icon: <BookOpen size={18} />,      desc: "Maintain the subject catalog" },
    { id: "assignments", title: "Manage Assignments", link: "/admin/assignments", icon: <ClipboardList size={18} />, desc: "Assign teachers to classes and subjects" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Draft":          return { bg: "#F1F5F9", text: "#475569" };
      case "Setup Complete": return { bg: "#FEF3C7", text: "#92400E" };
      case "Sheets Uploaded":return { bg: "#D1FAE5", text: "#065F46" };
      case "Processing":     return { bg: "#FFEDD5", text: "#9A3412" };
      case "Graded":         return { bg: "#6366F1", text: "#FFFFFF" };
      default:               return { bg: "#F1F5F9", text: "#475569" };
    }
  };

  if (loading) return <AdminDashboardSkeleton />;

  return (
    <section className="admin-page-content" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Toolbar ── */}
      <motion.div className="teacher-dashboard-toolbar" {...fade()}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)" }}>
            Administration
          </p>
          <h1 className="teacher-dashboard-title">Admin Dashboard</h1>
        </div>
        <button onClick={() => navigate("/admin/users")} className="teacher-primary-btn teacher-primary-btn--caps">
          <Plus size={16} /> Add User
        </button>
      </motion.div>

      {/* ── Platform Summary ── */}
      <motion.div className="admin-section" {...fade(0.05)}>
        <div className="admin-section-head">
          <h2 className="teacher-subject-title">Platform Summary</h2>
          <span className="teacher-view-all">Live overview</span>
        </div>

        <div className="admin-stat-grid">
          {statCards.map((card, idx) => (
            <motion.div key={card.id} {...fade(0.06 + idx * 0.05)}>
              <Link to={card.link} className="admin-stat-card">
                {/* Top row: badge + icon */}
                <div className="admin-stat-top">
                  <span className="admin-stat-badge" style={{ background: card.accent + "1A", color: card.accent }}>
                    {card.label}
                  </span>
                  <span className="admin-stat-icon" style={{ background: card.accent + "18", color: card.accent }}>
                    {card.icon}
                  </span>
                </div>

                {/* Value */}
                <div className="admin-stat-value">{card.value}</div>

                {/* Label + chevron */}
                <div className="admin-stat-footer">
                  <span className="admin-stat-title">{card.title}</span>
                  <span className="admin-stat-arrow" style={{ color: card.accent }}>
                    <ChevronRight size={15} />
                  </span>
                </div>

                {/* Accent bar */}
                <div className="admin-stat-bar" style={{ background: card.accent }} />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Quick Management ── */}
      <motion.div className="admin-section" {...fade(0.18)}>
        <div className="admin-section-head">
          <h2 className="teacher-subject-title">Quick Management</h2>
          <span className="teacher-view-all">Shortcuts</span>
        </div>

        <div className="admin-action-grid">
          {quickActions.map((item, idx) => (
            <motion.div key={item.id} {...fade(0.2 + idx * 0.05)}>
              <Link to={item.link} className="admin-action-card">
                <div className="admin-action-icon-wrap">
                  {item.icon}
                </div>
                <div className="admin-action-body">
                  <div className="admin-action-title">{item.title}</div>
                  <div className="admin-action-desc">{item.desc}</div>
                </div>
                <ChevronRight size={16} className="admin-action-chevron" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </section>
  );
}
