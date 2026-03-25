import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Users,Plus, GraduationCap, Search, Users } from "lucide-react";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classes`);
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setName("");
        fetchClasses();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save class");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = useMemo(
    () => classes.filter((c) => c.name?.toLowerCase().includes(query.toLowerCase())),
    [classes, query]
  );

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.1, color: "#232b37" }}>Class Management</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 13 }}>
            Organize class groups and open roster configuration for each cohort.
          </p>
        </div>

        <form onSubmit={handleAddClass} style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Create new class..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              height: 40,
              minWidth: 210,
              borderRadius: 999,
              border: "1px solid #d5dbe4",
              padding: "0 14px",
              fontSize: 13,
              outline: "none",
              background: "#fff",
            }}
          />
          <button
            type="submit"
            style={{
              border: 0,
              background: "var(--accent-strong)",
              color: "#fff",
              borderRadius: 999,
              padding: "0 14px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              cursor: "pointer",
              height: 40,
            }}
          >
            <Plus size={16} /> Create
          </button>
        </form>
      </motion.header>

      <div
        style={{
          border: "1px solid var(--line)",
          background: "#f6eeea",
          borderRadius: 16,
          padding: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#697383", fontSize: 13, fontWeight: 600 }}>
          <GraduationCap size={16} />
          {filtered.length} class groups
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #dadfe6",
            borderRadius: 999,
            background: "#fff",
            height: 36,
            padding: "0 12px",
            minWidth: 240,
          }}
        >
          <Search size={15} color="#7a8491" />
          <input
            type="text"
            placeholder="Search classes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: 0, outline: "none", width: "100%", fontSize: 13, background: "transparent" }}
          />
        </label>
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)", padding: "8px 2px" }}>Loading classes...</div>
      ) : filtered.length === 0 ? (
        <div style={{ border: "1px solid var(--line)", borderRadius: 14, background: "#fff", padding: 18, color: "var(--muted)" }}>
          No classes found.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
          {filtered.map((cls, idx) => (
            <motion.article
              key={cls._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              whileHover={{ y: -2 }}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                background: "#fff",
                padding: 14,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#26303d", fontWeight: 700 }}>
                  <GraduationCap size={15} color="var(--accent-strong)" /> {cls.name}
                </span>
                <span style={{ fontSize: 11, color: "#7a8491" }}>ID: {String(cls._id).slice(-6)}</span>
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#5f6b79", fontSize: 13 }}>
                <Users size={14} /> {Array.isArray(cls.students) ? cls.students.length : 0} students enrolled
              </div>

              <Link
                to={`/admin/classes/${cls._id}`}
                style={{
                  marginTop: 4,
                  textDecoration: "none",
                  borderRadius: 999,
                  border: "1px solid rgba(46, 86, 190, 0.3)",
                  background: "rgba(62, 101, 204, 0.1)",
                  color: "var(--accent-strong)",
                  fontWeight: 700,
                  fontSize: 12,
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                Manage Roster
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
