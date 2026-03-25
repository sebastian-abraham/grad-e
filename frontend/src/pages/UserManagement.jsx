import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, UserPlus, FileEdit, Trash2, X } from "lucide-react";

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("teacher");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Optional: If Firebase auth creates it
    role: "teacher"
  });

  useEffect(() => {
    fetchUsers();
  }, [activeTab, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users?role=${activeTab}&search=${search}`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Add name if backend mapped it to displayName
        body: JSON.stringify({ email: formData.email, role: formData.role, displayName: formData.name }) 
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", email: "", password: "", role: activeTab });
        fetchUsers();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create user");
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", color: "#1e293b" }}>User Management</h1>
        <button 
          onClick={() => { setFormData({ ...formData, role: activeTab }); setIsModalOpen(true); }}
          style={{ backgroundColor: "#3b82f6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
        >
          + Add User
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
        {["teacher", "student", "admin"].map(role => (
          <button
            key={role}
            onClick={() => setActiveTab(role)}
            style={{
              background: "none",
              border: "none",
              padding: "12px 16px",
              cursor: "pointer",
              fontSize: "16px",
              textTransform: "capitalize",
              color: activeTab === role ? "#3b82f6" : "#64748b",
              borderBottom: activeTab === role ? "2px solid #3b82f6" : "2px solid transparent",
              fontWeight: activeTab === role ? "600" : "400"
            }}
          >
            {role}s
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", backgroundColor: "#fff", padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", width: "300px" }}>
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: "none", outline: "none", marginLeft: "8px", width: "100%", fontSize: "14px" }}
        />
      </div>

      <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "#f8fafc", color: "#475569", fontSize: "14px", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              <th style={{ padding: "12px 16px", fontWeight: "600" }}>Name</th>
              <th style={{ padding: "12px 16px", fontWeight: "600" }}>Email</th>
              <th style={{ padding: "12px 16px", fontWeight: "600" }}>Role</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: "16px", textAlign: "center" }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: "16px", textAlign: "center", color: "#64748b" }}>No users found.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 16px" }}>{u.displayName || "N/A"}</td>
                  <td style={{ padding: "12px 16px" }}>{u.email}</td>
                  <td style={{ padding: "12px 16px", textTransform: "capitalize" }}>{u.role}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", marginRight: "12px" }}>Edit</button>
                    <button onClick={() => handleDelete(u._id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "400px" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "20px" }}>Add {formData.role}</h2>
            <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input 
                type="text" placeholder="Name" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <input 
                type="email" placeholder="Email" required
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "none", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#3b82f6", color: "#fff", cursor: "pointer" }}>Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
