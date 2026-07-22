import React, { useState, useEffect } from "react";

function ManageRoles({ setApiMessage, setApiError }) {
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState(null);

    const [form, setForm] = useState({
        role_name: "",
        description: ""
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    // 1. Fetch Roles List
    const fetchRoles = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/roles/get_roles.php");
            const result = await response.json();
            if (result.success) {
                setRoles(Array.isArray(result.data) ? result.data : []);
            } else {
                setApiError(result.message || "Failed to load roles.");
            }
        } catch (error) {
            setApiError("Failed to load role list.");
        }
    };

    const handleEditClick = (role) => {
        setApiMessage("");
        setApiError("");
        
        // Save the active role ID
        setEditingRoleId(role.role_id);
        
        // Populate form with existing data
        setForm({
            role_name: role.role_name || "",
            description: role.description || ""
        });
        
        setIsModalOpen(true);
    };

    // 3. Click Delete Button
    const handleDeleteClick = async (roleId) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;
        setApiMessage("");
        setApiError("");

        try {
            const response = await fetch("http://localhost:8000/api/roles/delete_role.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role_id: roleId })
            });
            const result = await response.json();

            if (result.success) {
                setApiMessage("Role removed successfully.");
                fetchRoles();
            } else {
                setApiError(result.message || "Failed to delete role.");
            }
        } catch (error) {
            setApiError("Error connecting to server to delete role.");
        }
    };

    // 4. Submit Form (Create / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiMessage("");
        setApiError("");

        // Validate form inputs before sending
        if (!form.role_name.trim() || !form.description.trim()) {
            setApiError("Please fill in both Role Name and Description.");
            return;
        }

        const isEditing = editingRoleId !== null;
        const endpoint = isEditing
            ? "http://localhost:8000/api/roles/update_role.php"
            : "http://localhost:8000/api/roles/create_role.php";

        // Always include role_id when updating!
        const requestBody = isEditing
            ? {
                role_id: Number(editingRoleId),
                role_name: form.role_name,
                description: form.description
              }
            : {
                role_name: form.role_name,
                description: form.description
              };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });
            const result = await response.json();

            if (result.success) {
                setApiMessage(isEditing ? "Role updated successfully!" : "Role created successfully!");
                closeModal();
                fetchRoles();
            } else {
                setApiError(result.message || "Failed to save role.");
            }
        } catch (error) {
            setApiError("Network Connection Error saving role metadata.");
        }
    };

    const openAddModal = () => {
        setEditingRoleId(null);
        setForm({ role_name: "", description: "" });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="management-card">
            <div className="content-header" style={{ borderBottom: "none", marginBottom: "16px", paddingBottom: 0 }}>
                <h3>Role Management</h3>
                <button className="btn-login" style={{ maxWidth: "200px", margin: 0 }} onClick={openAddModal}>
                    ➕ Add New Role
                </button>
            </div>

            <div className="responsive-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Role Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                                    No roles found.
                                </td>
                            </tr>
                        ) : (
                            roles.map((r) => (
                                <tr key={r.role_id}>
                                    <td>{r.role_id}</td>
                                    <td>{r.role_name}</td>
                                    <td>{r.description}</td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(r)}>
                                            ✏️ Edit
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDeleteClick(r.role_id)}>
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* POPUP MODAL DIALOG */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingRoleId ? "✏️ Edit Role" : "✨ Add Role"}</h3>
                            <button className="close-modal-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="modal-scroll-area">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Role Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.role_name}
                                        onChange={(e) => setForm({ ...form, role_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        required
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="dashboard-textarea"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-login" style={{ margin: 0, padding: "10px 20px" }}>
                                        Save Role
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageRoles;