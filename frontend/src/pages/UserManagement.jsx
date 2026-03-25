import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Ban, Pencil, Search, UserPlus, FileEdit, Trash2, X, UserPlus } from "lucide-react";

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("teacher");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student"
  });

  useEffect(() => {
    fetchUsers();
  }, [activeTab, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users?role=${activeTab}&search=${search}`
      );
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        // Edit User
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: formData.role }) 
        });
        if (res.ok) {
          setIsModalOpen(false);
          setEditingUserId(null);
          toast.success("User updated successfully");
          fetchUsers();
        } else {
          const error = await res.json();
          toast.error(error.error || "Failed to update user");
        }
      } else {
        // Add User
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            role: formData.role,
            displayName: formData.name,
          }),
        });
        if (res.ok) {
          setIsModalOpen(false);
          setFormData({ name: "", email: "", role: activeTab });
          toast.success("User created successfully");
          fetchUsers();
        } else {
          const error = await res.json();
          toast.error(error.error || "Failed to create user");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const openAddModal = () => {
    setEditingUserId(null);
    setFormData({ name: "", email: "", role: activeTab });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUserId(user._id);
    setFormData({ name: user.displayName || "", email: user.email, role: user.role });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User deleted successfully");
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete user");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const roleTabs = ["teacher", "student", "admin"];

  const summary = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.isActive !== false).length,
    }),
    [users]
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
          <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.1, color: "#232b37" }}>User Management</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 13 }}>
            Oversee and manage institutional access for all academic staff and students.
          </p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            border: "none",
            background: "var(--accent-strong)",
            color: "#fff",
            borderRadius: 999,
            padding: "10px 16px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            boxShadow: "0 10px 20px rgba(46, 86, 190, 0.24)",
          }}
        >
          <UserPlus size={18} /> Add User
        </button>
      </motion.header>

      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 16,
          background: "#f6eeea",
          padding: 10,
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "inline-flex", gap: 6, background: "#efe6e1", borderRadius: 999, padding: 4 }}>
          {roleTabs.map((role) => (
            <button
              key={role}
              onClick={() => setActiveTab(role)}
              style={{
                border: 0,
                cursor: "pointer",
                borderRadius: 999,
                padding: "7px 14px",
                textTransform: "capitalize",
                fontWeight: 700,
                fontSize: 12,
                color: activeTab === role ? "#1f2a36" : "#6f7784",
                background: activeTab === role ? "#fff" : "transparent",
              }}
            >
              {role}s
            </button>
          ))}
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
            minWidth: 260,
          }}
        >
          <Search size={15} color="#7a8491" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 0, outline: "none", width: "100%", fontSize: 13, background: "transparent" }}
          />
        </label>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        style={{ border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", background: "#fff" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "#efe3db", color: "#677281", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            <tr>
              <th style={{ padding: "12px 14px" }}>Name</th>
              <th style={{ padding: "12px 14px" }}>Email Address</th>
              <th style={{ padding: "12px 14px" }}>Department / Role</th>
              <th style={{ padding: "12px 14px" }}>Status</th>
              <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: 18, textAlign: "center", color: "var(--muted)" }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: 18, textAlign: "center", color: "var(--muted)" }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const active = u.isActive !== false;
                const initials = (u.displayName || u.email || "U")
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <tr key={u._id} style={{ borderTop: "1px solid #f0f2f5" }}>
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 999,
                            background: "#f2e2d8",
                            color: "#98521b",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          {initials}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, color: "#27303d", fontSize: 13 }}>{u.displayName || "Unnamed"}</div>
                          <div style={{ color: "#7c8593", fontSize: 11, textTransform: "capitalize" }}>
                            {u.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "13px 14px", color: "#4f5967", fontSize: 13 }}>{u.email}</td>
                    <td style={{ padding: "13px 14px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          borderRadius: 999,
                          background: "#f4e7df",
                          color: "#734f3e",
                          padding: "4px 10px",
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          borderRadius: 999,
                          background: active ? "#dff6e8" : "#edf1f6",
                          color: active ? "#137a43" : "#6b7480",
                          padding: "4px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        <i
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: active ? "#22c55e" : "#9ca3af",
                          }}
                        />
                        {active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 14px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEditModal(u)}
                          style={{ border: 0, background: "transparent", cursor: "pointer", color: "#5f6b79" }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => openDeleteModal(u._id)}
                          style={{ border: 0, background: "transparent", cursor: "pointer", color: "#c94949" }}
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div style={{ borderTop: "1px solid #f0f2f5", padding: "10px 14px", display: "flex", justifyContent: "space-between", color: "#7c8593", fontSize: 11 }}>
          <span>
            Showing {users.length} {activeTab} records
          </span>
          <span>
            {summary.active} active / {summary.total} total
          </span>
        </div>
      </motion.div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(19, 26, 38, 0.48)",
            display: "grid",
            placeItems: "center",
            zIndex: 60,
            padding: 16,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ width: "min(420px, 100%)", borderRadius: 16, background: "#fff", border: "1px solid var(--line)", padding: 20 }}
          >
            <h2 style={{ margin: "0 0 14px", fontSize: 22, color: "#252d39" }}>
              {editingUserId ? "Edit" : "Add"} {formData.role}
            </h2>
            <form onSubmit={handleSaveUser} style={{ display: "grid", gap: 12 }}>
              {!editingUserId && (
                <input
                  type="text"
                  placeholder="Display name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ height: 40, borderRadius: 10, border: "1px solid #d7dce4", padding: "0 12px" }}
                />
              )}
              {!editingUserId && (
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ height: 40, borderRadius: 10, border: "1px solid #d7dce4", padding: "0 12px" }}
                />
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ border: "1px solid #d7dce4", borderRadius: 10, background: "#fff", padding: "8px 13px", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ border: 0, borderRadius: 10, background: "var(--accent-strong)", color: "#fff", padding: "8px 13px", cursor: "pointer", fontWeight: 700 }}
                >
                  {editingUserId ? "Update" : "Save"} User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
}
