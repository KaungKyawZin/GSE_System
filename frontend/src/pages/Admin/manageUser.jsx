import React, { useState, useEffect } from "react";

function ManageUser({ setApiMessage, setApiError }) {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    const [form, setForm] = useState({
        role_id: "1", full_name: "", username: "", email: "", password: "", phone: "", status: "Active"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/users/read.php");
            const result = await response.json();
            if (result.success) {
                // Ensure data falls back cleanly to an array structure
                setUsers(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            setApiError("Failed to load users list.");
        }
    };

    const handleEditClick = async (userId) => {
        setApiMessage("");
        setApiError("");
        try {
            const response = await fetch(`http://localhost:8000/api/users/get_user.php?user_id=${userId}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                const userData = Array.isArray(result.data) ? result.data[0] : result.data;
                
                setEditingUserId(userId);
                setForm({
                    role_id: userData.role_id || "1",
                    full_name: userData.full_name || "",
                    username: userData.username || "",
                    email: userData.email || "",
                    password: "",
                    phone: userData.phone || "",
                    status: userData.status || "Active"
                });
                setIsModalOpen(true);
            } else {
                setApiError(result.message || "Failed to retrieve user data.");
            }
        } catch (error) {
            setApiError("Network connection failure getting user metadata.");
        }
    };

    const handleDeleteClick = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        setApiMessage("");
        setApiError("");

        try {
            const response = await fetch("http://localhost:8000/api/users/delete.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId })
            });
            const result = await response.json();

            if (result.success) {
                setApiMessage("User profile removed successfully.");
                fetchUsers();
            } else {
                setApiError(result.message);
            }
        } catch (error) {
            setApiError("Error connecting to server to delete account.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage("");
        setApiError("");

        const endpoint = editingUserId 
            ? "http://localhost:8000/api/users/update.php" 
            : "http://localhost:8000/api/users/create_user.php";

        const requestBody = editingUserId 
            ? { ...form, user_id: editingUserId } 
            : form;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });
            const result = await response.json();
            
            if (result.success) {
                setApiMessage(editingUserId ? "User profile updated!" : "User account created successfully!");
                closeModal();
                fetchUsers();
            } else {
                setApiError(result.message);
            }
        } catch (error) {
            setApiError("Network Connection Error saving profile metadata.");
        }
    };

    const openAddModal = () => {
        setEditingUserId(null);
        setForm({ role_id: "1", full_name: "", username: "", email: "", password: "", phone: "", status: "Active" });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="management-card">
            <div className="content-header" style={{ borderBottom: "none", marginBottom: "16px", paddingBottom: 0 }}>
                <h3>System Accounts</h3>
                <button className="btn-login" style={{ maxWidth: "200px", margin: 0 }} onClick={openAddModal}>
                    ➕ Add New User
                </button>
            </div>

            <div className="responsive-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Username</th>
                            <th>Role ID</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)" }}>No accounts found.</td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.user_id}>
                                    <td>{u.user_id}</td>
                                    <td>{u.full_name}</td>
                                    <td>{u.username}</td>
                                    <td>{u.role_id}</td>
                                    <td>
                                        <span className={`status-badge ${u.status?.toLowerCase() === 'active' ? 'active' : 'standby'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(u.user_id)}>✏️ Edit</button>
                                        <button className="action-btn delete" onClick={() => handleDeleteClick(u.user_id)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* UPGRADED POPUP MODAL DIALOG */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    {/* e.stopPropagation() stops outside clicks from triggering when clicking inside the form */}
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingUserId ? "✏️ Edit System Account" : "✨ Add System Account"}</h3>
                            <button className="close-modal-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="modal-scroll-area">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Access Role Profile</label>
                                    <select value={form.role_id} onChange={(e) => setForm({...form, role_id: e.target.value})} className="dashboard-select">
                                        <option value="1">Admin</option>
                                        <option value="2">Manager</option>
                                        <option value="3">Supervisor</option>
                                        <option value="4">Inspector</option>
                                        <option value="5">Technician</option>
                                        <option value="6">Driver</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" required value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})}/>
                                </div>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" required value={form.username} onChange={(e) => setForm({...form, username: e.target.value})}/>
                                </div>
                                <div className="form-group">
                                    <label>Password {editingUserId && <span style={{fontSize: "11px", color:"var(--text-muted)"}}>(leave empty to keep current)</span>}</label>
                                    <input type="password" required={!editingUserId} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}/>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="dashboard-select">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="btn-login" style={{ margin: 0, padding: "10px 20px" }}>Save Account</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUser;