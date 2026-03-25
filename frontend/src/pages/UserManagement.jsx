import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, UserPlus, FileEdit, Trash2, X } from "lucide-react";

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("teacher");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    role: "student"
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
          body: JSON.stringify({ email: formData.email, role: formData.role }) 
        });
        if (res.ok) {
          setIsModalOpen(false);
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
    setFormData({ email: "", role: activeTab });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUserId(user._id);
    setFormData({ email: user.email, role: user.role });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userToDelete}`, { method: "DELETE" });
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", color: "#1e293b" }}>User Management</h1>
        <button 
          onClick={openAddModal}
          style={{ backgroundColor: "#3b82f6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <UserPlus size={18} /> Add User
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
                  <td style={{ padding: "12px 16px" }}>{u.displayName || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Pending Login</span>}</td>
                  <td style={{ padding: "12px 16px" }}>{u.email}</td>
                  <td style={{ padding: "12px 16px", textTransform: "capitalize" }}>{u.role}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button onClick={() => openEditModal(u)} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", marginRight: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <FileEdit size={16} /> Edit
                    </button>
                    <button onClick={() => openDeleteModal(u._id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "400px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "20px" }}>{editingUserId ? "Edit User role" : "Add New User"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#475569", marginBottom: "4px" }}>Email</label>
                <input 
                  type="email" placeholder="example@grad-e.com" required
                  disabled={editingUserId !== null}
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: editingUserId ? "#f1f5f9" : "#fff", color: editingUserId ? "#94a3b8" : "#000" }}
                />
                {editingUserId && <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Email address cannot be modified after creation.</p>}
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#475569", marginBottom: "4px" }}>Role</label>
                <select 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "none", cursor: "pointer", color: "#475569", fontWeight: "500" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#3b82f6", color: "#fff", cursor: "pointer", fontWeight: "500" }}>
                  {editingUserId ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "400px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 12px 0", fontSize: "20px", color: "#0f172a" }}>Delete User?</h2>
            <p style={{ margin: "0 0 24px 0", color: "#64748b", lineHeight: "1.5" }}>Are you sure you want to permanently delete this user? All their submissions and associations will be unlinked. This action cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "none", cursor: "pointer", color: "#475569", fontWeight: "500" }}>Cancel</button>
              <button type="button" onClick={confirmDelete} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: "500" }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
