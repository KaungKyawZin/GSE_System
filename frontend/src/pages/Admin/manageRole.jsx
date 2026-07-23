import React, { useState, useEffect } from "react";

function ManageRoles({ setApiMessage, setApiError }) {
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState(null);

    // In-Modal Alert Notification States (Disappear after 2 seconds)
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    // Custom Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);

    const [form, setForm] = useState({
        role_name: "",
        description: ""
    });

    useEffect(() => {
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

    // 1. Fetch Roles List
    const fetchRoles = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/roles/get_roles.php");
            const result = await response.json();
            if (result.success) {
                setRoles(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            if (setApiError) setApiError("Failed to load roles list.");
        }
    };

    // 2. Open Edit Modal
    const handleEditClick = (role) => {
        setFormError("");
        setFormMessage("");
        setEditingRoleId(role.role_id);
        setForm({
            role_name: role.role_name || "",
            description: role.description || ""
        });
        setIsModalOpen(true);
    };

    // 3. Open Custom Confirmation Dialog for Role Deletion
    const promptDeleteRole = (role) => {
        setRoleToDelete(role);
        setDeleteModalOpen(true);
    };

    // 4. Execute Role Deletion
    const confirmDeleteRole = async () => {
        if (!roleToDelete) return;

        try {
            const response = await fetch("http://localhost:8000/api/roles/delete_role.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role_id: roleToDelete.role_id })
            });
            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || "Role removed successfully.";
                if (setApiMessage) setApiMessage(successMsg);
                fetchRoles();
            } else {
                const errorMsg = result.message || "Failed to delete role.";
                if (setApiError) setApiError(errorMsg);
            }
        } catch (error) {
            if (setApiError) setApiError("Server communication error.");
        } finally {
            setDeleteModalOpen(false);
            setRoleToDelete(null);
        }
    };

    // 5. Handle Save / Update Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormMessage("");

        const isEditing = editingRoleId !== null;
        const endpoint = isEditing 
            ? "http://localhost:8000/api/roles/update_role.php" 
            : "http://localhost:8000/api/roles/create_role.php";

        const requestBody = isEditing 
            ? { ...form, role_id: editingRoleId } 
            : form;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (result.success) {
                // Catches exact success message from PHP response
                const successMsg = result.message || (isEditing ? "Role profile updated!" : "New role created successfully!");
                showModalMessage(successMsg);
                if (setApiMessage) setApiMessage(successMsg);

                setTimeout(() => {
                    closeModal();
                    fetchRoles();
                }, 1200);
            } else {
                // Catches exact error message from PHP backend (e.g. "Role name already exists")
                const errorMsg = result.message || "Failed to save role profile.";
                showModalError(errorMsg);
            }
        } catch (error) {
            showModalError("Server communication error.");
        }
    };

    const openAddModal = () => {
        setEditingRoleId(null);
        setFormError("");
        setFormMessage("");
        setForm({
            role_name: "",
            description: ""
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError("");
        setFormMessage("");
    };

    return (
        <div className="management-card">
            <div className="content-header">
                <h3>System Roles</h3>
                <button className="btn-login"  onClick={openAddModal}>
                    ➕ Add New Role
                </button>
            </div>

            <div className="responsive-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Role ID</th>
                            <th>Role Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)" }}>No roles found.</td>
                            </tr>
                        ) : (
                            roles.map((r) => (
                                <tr key={r.role_id}>
                                    <td>{r.role_id}</td>
                                    <td><strong>{r.role_name}</strong></td>
                                    <td>{r.description}</td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(r)}>✏️ Edit</button>
                                        <button className="action-btn delete" onClick={() => promptDeleteRole(r)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD / EDIT ROLE MODAL DIALOG */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingRoleId ? "✏️ Edit Access Role" : "🔑 Create New Role"}</h3>
                            <button className="close-modal-btn" onClick={closeModal}>&times;</button>
                        </div>

                        {/* POP-UP ALERT INSIDE MODAL (OVER FORM, DISAPPEARS AFTER 2s) */}
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
                                    <label>Role Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Maintenance Supervisor"
                                        value={form.role_name}
                                        onChange={(e) => setForm({ ...form, role_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        required
                                        rows="3"
                                        placeholder="Describe permission scope..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-login" style={{ width: "auto", margin: 0, padding: "10px 20px" }}>
                                        {editingRoleId ? "Update Role" : "Save Role"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {deleteModalOpen && (
                <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
                    <div className="custom-confirm-card" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">⚠️</div>
                        <h3>Confirm Role Deletion</h3>
                        <p>
                            Are you sure you want to delete role <strong>{roleToDelete?.role_name}</strong>? Users assigned to this role may lose access permissions.
                        </p>
                        <div className="modal-actions" style={{ marginTop: "24px" }}>
                            <button className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={() => setDeleteModalOpen(false)}>
                                Cancel 
                            </button>
                            <button className="action-btn delete" style={{ padding: "10px 20px", fontSize: "14px" }} onClick={confirmDeleteRole}>
                                Yes, Delete Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageRoles;