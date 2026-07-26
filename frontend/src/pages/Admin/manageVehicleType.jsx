import React, { useState, useEffect } from "react";

function ManageVehicleTypes({ setApiMessage, setApiError }) {
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTypeId, setEditingTypeId] = useState(null);

    // In-Modal Alert Notification States (Disappear after 2 seconds)
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    // Custom Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState(null);

    const [form, setForm] = useState({
        type_name: "",
        description: ""
    });

    useEffect(() => {
        fetchVehicleTypes();
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

    // 1. Fetch Vehicle Types List
    const fetchVehicleTypes = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/vehicle_type/get_type.php");
            const result = await response.json();
            if (result.success) {
                setVehicleTypes(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            if (setApiError) setApiError("Failed to load vehicle types list.");
        }
    };

    // 2. Open Edit Modal
    const handleEditClick = (type) => {
        setFormError("");
        setFormMessage("");
        setEditingTypeId(type.vehicle_type_id);
        setForm({
            type_name: type.type_name || "",
            description: type.description || ""
        });
        setIsModalOpen(true);
    };

    // 3. Open Custom Confirmation Dialog for Deletion
    const promptDeleteType = (type) => {
        setTypeToDelete(type);
        setDeleteModalOpen(true);
    };

    // 4. Execute Vehicle Type Deletion
    const confirmDeleteType = async () => {
        if (!typeToDelete) return;

        try {
            const response = await fetch("http://localhost:8000/api/vehicle_type/delete_type.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vehicle_type_id: typeToDelete.vehicle_type_id })
            });
            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || "Vehicle type removed successfully.";
                if (setApiMessage) setApiMessage(successMsg);
                fetchVehicleTypes();
            } else {
                const errorMsg = result.message || "Failed to delete vehicle type.";
                if (setApiError) setApiError(errorMsg);
            }
        } catch (error) {
            if (setApiError) setApiError("Server communication error.");
        } finally {
            setDeleteModalOpen(false);
            setTypeToDelete(null);
        }
    };

    // 5. Handle Save / Update Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormMessage("");

        const isEditing = editingTypeId !== null;
        const endpoint = isEditing 
            ? "http://localhost:8000/api/vehicle_type/update_type.php" 
            : "http://localhost:8000/api/vehicle_type/create_type.php";

        const requestBody = isEditing 
            ? { ...form, vehicle_type_id: editingTypeId } 
            : form;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || (isEditing ? "Vehicle type updated!" : "New vehicle type created successfully!");
                showModalMessage(successMsg);
                if (setApiMessage) setApiMessage(successMsg);

                setTimeout(() => {
                    closeModal();
                    fetchVehicleTypes();
                }, 1200);
            } else {
                const errorMsg = result.message || "Failed to save vehicle type.";
                showModalError(errorMsg);
            }
        } catch (error) {
            showModalError("Server communication error.");
        }
    };

    const openAddModal = () => {
        setEditingTypeId(null);
        setFormError("");
        setFormMessage("");
        setForm({
            type_name: "",
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
                <h3>Vehicle Types</h3>
                <button className="btn-login" onClick={openAddModal}>
                    ➕ Add Vehicle Type
                </button>
            </div>

            <div className="responsive-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Type ID</th>
                            <th>Type Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicleTypes.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)" }}>No vehicle types found.</td>
                            </tr>
                        ) : (
                            vehicleTypes.map((vt) => (
                                <tr key={vt.vehicle_type_id}>
                                    <td>{vt.vehicle_type_id}</td>
                                    <td><strong>{vt.type_name}</strong></td>
                                    <td>{vt.description}</td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(vt)}>✏️ Edit</button>
                                        <button className="action-btn delete" onClick={() => promptDeleteType(vt)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD / EDIT VEHICLE TYPE MODAL DIALOG */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingTypeId ? "✏️ Edit Vehicle Type" : "🚜 Create Vehicle Type"}</h3>
                            <button className="close-modal-btn" onClick={closeModal}>&times;</button>
                        </div>

                        {/* POP-UP ALERT INSIDE MODAL */}
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
                                    <label>Type Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Tow Tractor / Container Handler"
                                        value={form.type_name}
                                        onChange={(e) => setForm({ ...form, type_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        required
                                        rows="3"
                                        placeholder="Describe vehicle type purpose or specifications..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-login" style={{ width: "auto", margin: 0, padding: "10px 20px" }}>
                                        {editingTypeId ? "Update Type" : "Save Type"}
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
                        <h3>Confirm Deletion</h3>
                        <p>
                            Are you sure you want to delete vehicle type <strong>{typeToDelete?.type_name}</strong>?
                        </p>
                        <div className="modal-actions" style={{ marginTop: "24px" }}>
                            <button className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="action-btn delete" style={{ padding: "10px 20px", fontSize: "14px" }} onClick={confirmDeleteType}>
                                Yes, Delete Type
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageVehicleTypes;