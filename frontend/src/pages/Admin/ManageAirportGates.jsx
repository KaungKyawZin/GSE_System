import React, { useState, useEffect } from "react";

function ManageAirportGates({ setApiMessage, setApiError }) {
    const [gates, setGates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGateId, setEditingGateId] = useState(null);

    // In-Modal Alert Notification States
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    // Custom Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [gateToDelete, setGateToDelete] = useState(null);

    const [form, setForm] = useState({
        gate_code: "",
        terminal: "",
        status: "Available"
    });

    useEffect(() => {
        fetchGates();
    }, []);

    const showModalError = (err) => {
        setFormError(err);
        setTimeout(() => setFormError(""), 2000);
    };

    const showModalMessage = (msg) => {
        setFormMessage(msg);
        setTimeout(() => setFormMessage(""), 2000);
    };

    // 1. Fetch Airport Gates List
    const fetchGates = async () => {
        try {
            const response = await fetch("/api/gate/get_gate.php");
            const result = await response.json();
            if (result.success) {
                setGates(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            if (setApiError) setApiError("Failed to load airport gates list.");
        }
    };

    // 2. Open Edit Modal
    const handleEditClick = (g) => {
        setFormError("");
        setFormMessage("");
        setEditingGateId(g.gate_id);
        setForm({
            gate_code: g.gate_code || "",
            terminal: g.terminal || "",
            status: g.status || "Available"
        });
        setIsModalOpen(true);
    };

    // 3. Prompt Custom Delete Modal
    const promptDeleteGate = (g) => {
        setGateToDelete(g);
        setDeleteModalOpen(true);
    };

    // 4. Execute Gate Deletion
    const confirmDeleteGate = async () => {
        if (!gateToDelete) return;

        try {
            const response = await fetch("/api/gate/delete_gate.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gate_id: gateToDelete.gate_id })
});
            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || "Airport gate deleted successfully.";
                if (setApiMessage) setApiMessage(successMsg);
                fetchGates();
            } else {
                const errorMsg = result.message || "Failed to delete gate.";
                if (setApiError) setApiError(errorMsg);
            }
        } catch (error) {
            if (setApiError) setApiError("Server communication error.");
        } finally {
            setDeleteModalOpen(false);
            setGateToDelete(null);
        }
    };

    // 5. Handle Submit (Create / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormMessage("");

        const isEditing = editingGateId !== null;
        const endpoint = isEditing
         ? "/api/gate/update_gate.php" 
    : "/api/gate/create_gate.php";
        const requestBody = isEditing
            ? { ...form, gate_id: editingGateId }
            : form;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json(); 

            if (result.success) {
                const successMsg = result.message || (isEditing ? "Gate updated successfully!" : "Gate created successfully!");
                showModalMessage(successMsg);
                if (setApiMessage) setApiMessage(successMsg);

                setTimeout(() => {
                    closeModal();
                    fetchGates();
                }, 1200);
            } else {
                const errorMsg = result.message || "Failed to save gate profile.";
                showModalError(errorMsg);
            }
        } catch (error) {
            showModalError("Server communication error.");
        }
    };

    const openAddModal = () => {
        setEditingGateId(null);
        setFormError("");
        setFormMessage("");
        setForm({
            gate_code: "",
            terminal: "",
            status: "Available"
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
                <h3>Airport Gates</h3>
                <button className="btn-login" onClick={openAddModal}>
                    ➕ Add Gate
                </button>
            </div>

            <div className="responsive-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Gate ID</th>
                            <th>Gate Code</th>
                            <th>Terminal</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gates.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)" }}>No airport gates found.</td>
                            </tr>
                        ) : (
                            gates.map((g) => (
                                <tr key={g.gate_id}>
                                    <td>{g.gate_id}</td>
                                    <td><strong>{g.gate_code}</strong></td>
                                    <td>{g.terminal || "-"}</td>
                                    <td>{g.status}</td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(g)}>✏️ Edit</button>
                                        <button className="action-btn delete" onClick={() => promptDeleteGate(g)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD / EDIT GATE MODAL */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingGateId ? "✏️ Edit Airport Gate" : "🚪 Register New Gate"}</h3>
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
                                    <label>Gate Code (Unique)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. G-01A"
                                        value={form.gate_code}
                                        onChange={(e) => setForm({ ...form, gate_code: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Terminal</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Terminal 1 / International"
                                        value={form.terminal}
                                        onChange={(e) => setForm({ ...form, terminal: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Gate Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Occupied">Occupied</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-login" style={{ width: "auto", margin: 0, padding: "10px 20px" }}>
                                        {editingGateId ? "Update Gate" : "Save Gate"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* CUSTOM DELETE CONFIRMATION MODAL */}
            {deleteModalOpen && (
                <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
                    <div className="custom-confirm-card" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">⚠️</div>
                        <h3>Confirm Gate Deletion</h3>
                        <p>
                            Are you sure you want to delete gate <strong>{gateToDelete?.gate_code}</strong>?
                        </p>
                        <div className="modal-actions" style={{ marginTop: "24px" }}>
                            <button className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="action-btn delete" style={{ padding: "10px 20px", fontSize: "14px" }} onClick={confirmDeleteGate}>
                                Yes, Delete Gate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageAirportGates;