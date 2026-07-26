import React, { useState, useEffect } from "react";

function ManageSpareParts({ setApiMessage, setApiError }) {
    const [parts, setParts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPartId, setEditingPartId] = useState(null);

    // In-Modal Alert Notification States
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    // Custom Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [partToDelete, setPartToDelete] = useState(null);

    const [form, setForm] = useState({
        part_name: "",
        part_number: "",
        stock_qty: "",
        unit_price: "",
        supplier: ""
    });

    useEffect(() => {
        fetchParts();
    }, []);

    const showModalError = (err) => {
        setFormError(err);
        setTimeout(() => setFormError(""), 2000);
    };

    const showModalMessage = (msg) => {
        setFormMessage(msg);
        setTimeout(() => setFormMessage(""), 2000);
    };

    // 1. Fetch Spare Parts List
    const fetchParts = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/spare_parts/get_parts.php");
            const result = await response.json();
            if (result.success) {
                setParts(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            if (setApiError) setApiError("Failed to load spare parts list.");
        }
    };

    // 2. Open Edit Modal
    const handleEditClick = (p) => {
        setFormError("");
        setFormMessage("");
        setEditingPartId(p.part_id);
        setForm({
            part_name: p.part_name || "",
            part_number: p.part_number || "",
            stock_qty: p.stock_qty || "",
            unit_price: p.unit_price || "",
            supplier: p.supplier || ""
        });
        setIsModalOpen(true);
    };

    // 3. Prompt Custom Delete Modal
    const promptDeletePart = (p) => {
        setPartToDelete(p);
        setDeleteModalOpen(true);
    };

    // 4. Execute Part Deletion
    const confirmDeletePart = async () => {
        if (!partToDelete) return;

        try {
            const response = await fetch("http://localhost:8000/api/spare_parts/delete_part.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ part_id: partToDelete.part_id })
            });
            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || "Spare part removed successfully.";
                if (setApiMessage) setApiMessage(successMsg);
                fetchParts();
            } else {
                const errorMsg = result.message || "Failed to delete spare part.";
                if (setApiError) setApiError(errorMsg);
            }
        } catch (error) {
            if (setApiError) setApiError("Server communication error.");
        } finally {
            setDeleteModalOpen(false);
            setPartToDelete(null);
        }
    };

    // 5. Handle Submit (Create / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormMessage("");

        const isEditing = editingPartId !== null;
        const endpoint = isEditing
            ? "http://localhost:8000/api/spare_parts/update_part.php"
            : "http://localhost:8000/api/spare_parts/create_part.php";

        const requestBody = isEditing
            ? { ...form, part_id: editingPartId }
            : form;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || (isEditing ? "Spare part updated!" : "Spare part added successfully!");
                showModalMessage(successMsg);
                if (setApiMessage) setApiMessage(successMsg);

                setTimeout(() => {
                    closeModal();
                    fetchParts();
                }, 1200);
            } else {
                const errorMsg = result.message || "Failed to save spare part record.";
                showModalError(errorMsg);
            }
        } catch (error) {
            showModalError("Server communication error.");
        }
    };

    const openAddModal = () => {
        setEditingPartId(null);
        setFormError("");
        setFormMessage("");
        setForm({
            part_name: "",
            part_number: "",
            stock_qty: "",
            unit_price: "",
            supplier: ""
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
                <h3>Spare Parts Inventory</h3>
                <button className="btn-login" onClick={openAddModal}>
                    ➕ Add Spare Part
                </button>
            </div>

            <div className="responsive-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Part ID</th>
                            <th>Part Name</th>
                            <th>Part Number</th>
                            <th>Stock Qty</th>
                            <th>Unit Price</th>
                            <th>Supplier</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parts.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)" }}>No spare parts found.</td>
                            </tr>
                        ) : (
                            parts.map((p) => (
                                <tr key={p.part_id}>
                                    <td>{p.part_id}</td>
                                    <td><strong>{p.part_name}</strong></td>
                                    <td>{p.part_number || "-"}</td>
                                    <td>{p.stock_qty ?? 0}</td>
                                    <td>${p.unit_price ? parseFloat(p.unit_price).toFixed(2) : "0.00"}</td>
                                    <td>{p.supplier || "-"}</td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(p)}>✏️ Edit</button>
                                        <button className="action-btn delete" onClick={() => promptDeletePart(p)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD / EDIT SPARE PART MODAL */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingPartId ? "✏️ Edit Spare Part" : "⚙️ Register New Spare Part"}</h3>
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
                                    <label>Part Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Hydraulic Filter"
                                        value={form.part_name}
                                        onChange={(e) => setForm({ ...form, part_name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Part Number (Unique)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. HF-90821"
                                        value={form.part_number}
                                        onChange={(e) => setForm({ ...form, part_number: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Stock Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        placeholder="0"
                                        value={form.stock_qty}
                                        onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Unit Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={form.unit_price}
                                        onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Supplier</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Bosch Global"
                                        value={form.supplier}
                                        onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-login" style={{ width: "auto", margin: 0, padding: "10px 20px" }}>
                                        {editingPartId ? "Update Part" : "Save Part"}
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
                        <h3>Confirm Part Deletion</h3>
                        <p>
                            Are you sure you want to delete part <strong>{partToDelete?.part_name}</strong>?
                        </p>
                        <div className="modal-actions" style={{ marginTop: "24px" }}>
                            <button className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="action-btn delete" style={{ padding: "10px 20px", fontSize: "14px" }} onClick={confirmDeletePart}>
                                Yes, Delete Part
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageSpareParts;