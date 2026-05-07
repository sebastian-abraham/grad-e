import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const getInitials = () => {
    const name = currentUser?.displayName?.trim();
    if (name) {
      return name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
    }

    if (currentUser?.email) {
      return currentUser.email.slice(0, 2).toUpperCase();
    }

    return "ST";
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navItems = [
    { name: "My Dashboard", path: "/student", icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <div className="shell">
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">G</div>
          <span className="sidebar-brand-text">Grade-E</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
                title={item.name}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-text">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout-btn" title="Logout">
            <span className="sidebar-link-icon"><LogOut size={20} /></span>
            <span className="sidebar-link-text">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <motion.header
          className="topbar"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.34 }}
        >
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen((prev) => !prev)}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="topbar-breadcrumb">Student Portal</span>
          </div>

          <div className="topbar-right" ref={profileMenuRef}>
            <button
              className={`topbar-profile-btn ${profileOpen ? "open" : ""}`}
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <span className="topbar-avatar">{getInitials()}</span>
              <span className="topbar-profile-name">{currentUser?.displayName || "Student"}</span>
              <ChevronDown size={14} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  className="topbar-profile-menu"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  role="menu"
                >
                  <div className="topbar-profile-meta">
                    <p>{currentUser?.displayName || "Student"}</p>
                    <small>{currentUser?.email || "No email"}</small>
                  </div>
                  <button onClick={handleLogout} className="topbar-profile-logout" role="menuitem">
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
