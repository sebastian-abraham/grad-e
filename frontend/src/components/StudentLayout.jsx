import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, LogOut, Menu, X, Bell, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
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
    { name: "My Dashboard", path: "/student", icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <div className="teacher-shell">
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="teacher-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`teacher-sidebar ${menuOpen ? "open" : ""}`}
        initial={{ x: -28, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="teacher-brand">
          <h1 className="teacher-brand-name">Grade-E</h1>
        </div>

        <nav className="teacher-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`teacher-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="teacher-side-foot" />
      </motion.aside>

      <main className="teacher-main">
        <motion.header
          className="teacher-topbar"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.34 }}
        >
          <div className="teacher-topbar-left">
            <button className="teacher-menu-btn" onClick={() => setMenuOpen((prev) => !prev)}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <div className="teacher-topbar-right" ref={profileMenuRef}>
            <button className="teacher-icon-btn" aria-label="Notifications">
              <Bell size={17} />
            </button>

            <button
              className={`teacher-profile-btn ${profileOpen ? "open" : ""}`}
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <span className="teacher-avatar">{getInitials()}</span>
              <ChevronDown size={16} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  className="teacher-profile-menu"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  role="menu"
                >
                  <div className="teacher-profile-meta">
                    <p>{currentUser?.displayName || "Student"}</p>
                    <small>{currentUser?.email || "No email"}</small>
                  </div>
                  <button onClick={handleLogout} className="teacher-profile-logout" role="menuitem">
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        <Outlet />
      </main>
    </div>
  );
}
