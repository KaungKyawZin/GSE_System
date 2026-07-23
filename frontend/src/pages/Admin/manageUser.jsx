import React, { useState, useEffect } from "react";

function ManageUser({ setApiMessage, setApiError }) {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [showPassword, setShowPassword] = useState(false); 

    // In-Modal Alert Notification States (Disappear after 2 seconds)
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    // Custom Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [form, setForm] = useState({
        role_id: "",
        full_name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        status: "Active"
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    // Helper functions to handle 2-second floating alert timer inside the modal
    const showModalError = (err) => {
        setFormError(err);
        setTimeout(() => setFormError(""), 2000);
    };

    const showModalMessage = (msg) => {
        setFormMessage(msg);
        setTimeout(() => setFormMessage(""), 2000);
    };

    // 1. Fetch Users List
    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/users/get_users.php");
            const result = await response.json();
            if (result.success) {
                setUsers(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            if (setApiError) setApiError("Failed to load users list.");
        }
    };


    const fetchRoles = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/roles/get_roles.php");
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setRoles(result.data);
                if (result.data.length > 0 && !form.role_id) {
                    setForm((prev) => ({ ...prev, role_id: String(result.data[0].role_id) }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch dynamic roles:", error);
        }
    };

    const handleEditClick = (user) => {
        setFormError("");
        setFormMessage("");
        setEditingUserId(user.user_id);
        setForm({
            role_id: String(user.role_id || (roles[0] ? roles[0].role_id : "1")),
            full_name: user.full_name || "",
            username: user.username || "",
            email: user.email || "",
            password: "", 
            phone: user.phone || "",
            status: user.status || "Active"
        });
        setShowPassword(false);
        setIsModalOpen(true);
    };

    const promptDeleteUser = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    // Execute Account Deletion
    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch("http://localhost:8000/api/users/delete_user.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userToDelete.user_id })
            });
            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || "User profile removed successfully.";
                if (setApiMessage) setApiMessage(successMsg);
                fetchUsers();
            } else {
                const errorMsg = result.message || "Failed to delete user.";
                if (setApiError) setApiError(errorMsg);
            }
        } catch (error) {
            if (setApiError) setApiError("Server communication error.");
        } finally {
            setDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormMessage("");

        const isEditing = editingUserId !== null;
        const endpoint = isEditing 
            ? "http://localhost:8000/api/users/update_user.php" 
            : "http://localhost:8000/api/users/create_user.php";

        const requestBody = isEditing 
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
         
                const successMsg = result.message || (isEditing ? "User profile updated!" : "User account created successfully!");
                showModalMessage(successMsg);
                if (setApiMessage) setApiMessage(successMsg);
                setTimeout(() => {
                    closeModal();
                    fetchUsers();
                }, 1200);
            } else {
          
                const errorMsg = result.message || "Failed to save user account.";
                showModalError(errorMsg);
            }
        } catch (error) {
            showModalError("Server communication error.");
        }
    };

    const openAddModal = () => {
        setEditingUserId(null);
        setFormError("");
        setFormMessage("");
        setForm({
            role_id: roles.length > 0 ? String(roles[0].role_id) : "1",
            full_name: "",
            username: "",
            email: "",
            password: "",
            phone: "",
            status: "Active"
        });
        setShowPassword(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setShowPassword(false);
        setIsModalOpen(false);
        setFormError("");
        setFormMessage("");
    };

    const getRoleName = (roleId) => {
        const foundRole = roles.find((r) => String(r.role_id) === String(roleId));
        return foundRole ? foundRole.role_name : `Role ${roleId}`;
    };

    return (
        <div className="management-card">
            <div className="content-header">
                <h3>System Accounts</h3>
                <button className="btn-login" onClick={openAddModal}>
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
                            <th>Role</th>
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
                                    <td>{getRoleName(u.role_id)}</td>
                                    <td>
                                        <span className={`status-badge ${u.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(u)}>✏️ Edit</button>
                                        <button className="action-btn delete" onClick={() => promptDeleteUser(u)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD / EDIT USER MODAL DIALOG */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingUserId ? "✏️ Edit User Account" : "👤 Add New User Account"}</h3>
                            <button className="close-modal-btn" onClick={closeModal}>&times;</button>
                        </div>

                        {formMessage && (
                            <div className="modal-top-alert success">
                                <span>✓ {formMessage}</span>
                            </div>
                        )}
                        {formError && (
                            <div className="modal-top-alert error">
                                <span>⚠️ {formError}</span>
                            </div>
                        )}

                        <div className="modal-scroll-area">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Access Role Profile</label>
                                    <select 
                                        value={form.role_id} 
                                        onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                                        required
                                    >
                                        {roles.length === 0 ? (
                                            <option value="">Loading roles...</option>
                                        ) : (
                                            roles.map((r) => (
                                                <option key={r.role_id} value={r.role_id}>
                                                    {r.role_name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Enter Your Full Name"
                                        value={form.full_name} 
                                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Username</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Enter Your User Name"
                                        value={form.username} 
                                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="e.g. sample@example.com"
                                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                        title="Please enter a valid email address (e.g. user@domain.com)"
                                        value={form.email} 
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Password {editingUserId && <span style={{ fontSize: "10px", color: "#64748b" }}>(leave blank to keep)</span>}
                                    </label>
                                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            required={!editingUserId} 
                                            placeholder="••••••••"
                                            value={form.password} 
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            style={{ paddingRight: "40px", width: "100%" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: "absolute",
                                                right: "10px",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "16px",
                                                padding: "0 4px",
                                                color: "#64748b",
                                                userSelect: "none"
                                            }}
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? "👁️" : "🙈"}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input 
                                        type="tel" 
                                        placeholder="09--------"
                                        pattern="^\+?[0-9\s\-\(\)]{7,15}$"
                                        title="Please enter a valid phone number (7-15 digits)"
                                        value={form.phone} 
                                        onChange={(e) => {
                                            const sanitizedValue = e.target.value.replace(/[^0-9+\s\-()]/g, "");
                                            setForm({ ...form, phone: sanitizedValue });
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Account Status</label>
                                    <select 
                                        value={form.status} 
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-login" style={{ width: "auto", margin: 0, padding: "10px 20px" }}>
                                        {editingUserId ? "Update Account" : "Save Account"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* CUSTOM DELETE CONFIRMATION MODAL (REPLACES window.confirm) */}
            {deleteModalOpen && (
                <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
                    <div className="custom-confirm-card" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">⚠️</div>
                        <h3>Confirm Account Deletion</h3>
                        <p>
                            Are you sure you want to permanently delete user <strong>{userToDelete?.full_name || userToDelete?.username}</strong>? This action cannot be undone.
                        </p>
                        <div className="modal-actions" style={{ marginTop: "24px" }}>
                            <button className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="action-btn delete" style={{ padding: "10px 20px", fontSize: "14px" }} onClick={confirmDeleteUser}>
                                Yes, Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUser;