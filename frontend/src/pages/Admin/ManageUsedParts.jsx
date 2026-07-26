import React, { useState, useEffect } from "react";

function ManageMaintenancePartsUsed({ setApiMessage, setApiError }) {
    const [partsUsed, setPartsUsed] = useState([]);
    const [spareParts, setSpareParts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // In-Modal Alert Notification States
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    // Custom Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    const [form, setForm] = useState({
        maintenance_id: "",
        part_id: "",
        quantity: "1"
    });

    useEffect(() => {
        fetchPartsUsed();
        fetchSparePartsDropdown();
    }, []);

    const showModalError = (err) => {
        setFormError(err);
        setTimeout(() => setFormError(""), 2000);
    };

    const showModalMessage = (msg) => {
        setFormMessage(msg);
        setTimeout(() => setFormMessage(""), 2000);
    };

    // 1. Fetch Maintenance Parts Used List
    const fetchPartsUsed = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/maintenance_parts_used/get_parts_used.php");
            const result = await response.json();
            if (result.success) {
                setPartsUsed(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            if (setApiError) setApiError("Failed to load maintenance parts used list.");
        }
    };

    // 2. Fetch Spare Parts Dropdown List
    const fetchSparePartsDropdown = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/spare_parts/get_parts.php");
            const result = await response.json();
            if (result.success) {
                setSpareParts(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            if (setApiError) setApiError("Failed to load spare parts dropdown.");
        }
    };

    // 3. Open Edit Modal
    const handleEditClick = (item) => {
        setFormError("");
        setFormMessage("");
        setEditingId(item.id);
        setForm({
            maintenance_id: item.maintenance_id || "",
            part_id: item.part_id || "",
            quantity: item.quantity || "1"
        });
        setIsModalOpen(true);
    };

    // 4. Prompt Custom Delete Modal
    const promptDeleteRecord = (item) => {
        setRecordToDelete(item);
        setDeleteModalOpen(true);
    };

    // 5. Execute Deletion
    const confirmDeleteRecord = async () => {
        if (!recordToDelete) return;

        try {
            const response = await fetch("http://localhost:8000/api/maintenance_parts_used/delete_part_used.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: recordToDelete.id })
            });
            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || "Usage record deleted successfully.";
                if (setApiMessage) setApiMessage(successMsg);
                fetchPartsUsed();
            } else {
                const errorMsg = result.message || "Failed to delete record.";
                if (setApiError) setApiError(errorMsg);
            }
        } catch (error) {
            if (setApiError) setApiError("Server communication error.");
        } finally {
            setDeleteModalOpen(false);
            setRecordToDelete(null);
        }
    };

    // 6. Handle Submit (Create / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormMessage("");

        const isEditing = editingId !== null;
        const endpoint = isEditing
            ? "http://localhost:8000/api/maintenance_parts_used/update_part_used.php"
            : "http://localhost:8000/api/maintenance_parts_used/create_part_used.php";

        const requestBody = isEditing
            ? { ...form, id: editingId }
            : form;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || (isEditing ? "Record updated!" : "Part usage logged successfully!");
                showModalMessage(successMsg);
                if (setApiMessage) setApiMessage(successMsg);

                setTimeout(() => {
                    closeModal();
                    fetchPartsUsed();
                }, 1200);
            } else {
                const errorMsg = result.message || "Failed to save part usage.";
                showModalError(errorMsg);
            }
        } catch (error) {
            showModalError("Server communication error.");
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormError("");
        setFormMessage("");
        setForm({
            maintenance_id: "",
            part_id: "",
            quantity: "1"
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
                <h3>Maintenance Parts Used</h3>
                <button className="btn-login" onClick={openAddModal}>
                    ➕ Log Part Usage
                </button>
            </div>

            <div className="responsive-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Record ID</th>
                            <th>Maint. Job ID</th>
                            <th>Part Name</th>
                            <th>Quantity Used</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partsUsed.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)" }}>No usage records found.</td>
                            </tr>
                        ) : (
                            partsUsed.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td><strong>#{item.maintenance_id}</strong></td>
                                    <td>{item.part_name || `Part ID: ${item.part_id}`}</td>
                                    <td>{item.quantity}</td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(item)}>✏️ Edit</button>
                                        <button className="action-btn delete" onClick={() => promptDeleteRecord(item)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD / EDIT USAGE RECORD MODAL */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId ? "✏️ Edit Part Usage" : "🔧 Log Part Usage"}</h3>
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
                                    <label>Maintenance Job ID</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="e.g. 101"
                                        value={form.maintenance_id}
                                        onChange={(e) => setForm({ ...form, maintenance_id: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Spare Part</label>
                                    <select
                                        required
                                        value={form.part_id}
                                        onChange={(e) => setForm({ ...form, part_id: e.target.value })}
                                    >
                                        <option value="">-- Select Spare Part --</option>
                                        {spareParts.map((sp) => (
                                            <option key={sp.part_id} value={sp.part_id}>
                                                {sp.part_name} {sp.part_number ? `(${sp.part_number})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Quantity Used</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-login" style={{ width: "auto", margin: 0, padding: "10px 20px" }}>
                                        {editingId ? "Update Record" : "Save Record"}
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
                        <h3>Confirm Record Deletion</h3>
                        <p>
                            Are you sure you want to remove this part usage record for Maintenance Job <strong>#{recordToDelete?.maintenance_id}</strong>?
                        </p>
                        <div className="modal-actions" style={{ marginTop: "24px" }}>
                            <button className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="action-btn delete" style={{ padding: "10px 20px", fontSize: "14px" }} onClick={confirmDeleteRecord}>
                                Yes, Delete Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageMaintenancePartsUsed;