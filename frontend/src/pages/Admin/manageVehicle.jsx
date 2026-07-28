import React, { useState, useEffect } from "react";

function ManageVehicles({ setApiMessage, setApiError }) {
    const [vehicles, setVehicles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);

    // Modal Control States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Selected Vehicle Data States
    const [selectedDetailVehicle, setSelectedDetailVehicle] = useState(null);
    const [editingVehicleId, setEditingVehicleId] = useState(null);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    // Photo Upload States
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    // In-Modal Alert Notification States
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    // Form State
    const [form, setForm] = useState({
        vehicle_type_id: "",
        vehicle_code: "",
        registration_no: "",
        manufacturer: "",
        model: "",
        vehicle_photo: "",
        year_manufactured: "",
        purchase_date: "",
        status: "Available",
        mileage: "",
        engine_hours: ""
    });

    useEffect(() => {
        fetchVehicles();
        fetchVehicleTypes();
    }, []);

    // Helper functions for alerts inside form modal
    const showModalError = (err) => {
        setFormError(err);
        setTimeout(() => setFormError(""), 3000);
    };

    const showModalMessage = (msg) => {
        setFormMessage(msg);
        setTimeout(() => setFormMessage(""), 3000);
    };

    // Handle image file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    // 1. Fetch Vehicles List
    const fetchVehicles = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/vehicles/get_vehicles.php");
            const result = await response.json();
            if (result.success) {
                setVehicles(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            if (setApiError) setApiError("Failed to load vehicles list.");
        }
    };

    // 2. Fetch Vehicle Types
    const fetchVehicleTypes = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/vehicle_type/get_type.php");
            const result = await response.json();
            if (result.success) {
                setVehicleTypes(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            if (setApiError) setApiError("Failed to load vehicle types dropdown.");
        }
    };

    // 3. Open Details View (Full 10 Columns / Specs)
    const handleViewDetail = (v) => {
        setSelectedDetailVehicle(v);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedDetailVehicle(null);
    };

    // 4. Open Edit Form Modal
    const handleEditClick = (v) => {
        setFormError("");
        setFormMessage("");
        setEditingVehicleId(v.vehicle_id);

        setPhotoFile(null);
        setPhotoPreview("");

        setForm({
            vehicle_type_id: v.vehicle_type_id || "",
            vehicle_code: v.vehicle_code || "",
            registration_no: v.registration_no || "",
            manufacturer: v.manufacturer || "",
            model: v.model || "",
            vehicle_photo: v.vehicle_photo || "",
            year_manufactured: v.year_manufactured || "",
            purchase_date: v.purchase_date || "",
            status: v.status || "Available",
            mileage: v.mileage || "",
            engine_hours: v.engine_hours || ""
        });
        setIsEditModalOpen(true);
    };

    const openAddModal = () => {
        setEditingVehicleId(null);
        setFormError("");
        setFormMessage("");
        setPhotoFile(null);
        setPhotoPreview("");
        setForm({
            vehicle_type_id: "",
            vehicle_code: "",
            registration_no: "",
            manufacturer: "",
            model: "",
            vehicle_photo: "",
            year_manufactured: "",
            purchase_date: "",
            status: "Available",
            mileage: "",
            engine_hours: ""
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setFormError("");
        setFormMessage("");
        setPhotoFile(null);
        setPhotoPreview("");
    };

    // 5. Prompt & Confirm Delete
    const promptDeleteVehicle = (v) => {
        setVehicleToDelete(v);
        setDeleteModalOpen(true);
    };

    const confirmDeleteVehicle = async () => {
        if (!vehicleToDelete) return;

        try {
            const response = await fetch("http://localhost:8000/api/vehicles/delete_vehicle.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vehicle_id: vehicleToDelete.vehicle_id })
            });
            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || "Vehicle deleted successfully.";
                if (setApiMessage) setApiMessage(successMsg);
                fetchVehicles();
            } else {
                const errorMsg = result.message || "Failed to delete vehicle.";
                if (setApiError) setApiError(errorMsg);
            }
        } catch (error) {
            if (setApiError) setApiError("Server communication error.");
        } finally {
            setDeleteModalOpen(false);
            setVehicleToDelete(null);
        }
    };

    // 6. Handle Form Submit (Create / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormMessage("");

        const isEditing = editingVehicleId !== null;
        const endpoint = isEditing
            ? "http://localhost:8000/api/vehicles/update_vehicle.php"
            : "http://localhost:8000/api/vehicles/create_vehicle.php";

        const formData = new FormData();
        if (isEditing) {
            formData.append("vehicle_id", editingVehicleId);
        }

        formData.append("vehicle_type_id", form.vehicle_type_id || "");
        formData.append("vehicle_code", form.vehicle_code || "");
        formData.append("registration_no", form.registration_no || "");
        formData.append("manufacturer", form.manufacturer || "");
        formData.append("model", form.model || "");
        formData.append("year_manufactured", form.year_manufactured || "");
        formData.append("purchase_date", form.purchase_date || "");
        formData.append("status", form.status || "Available");
        formData.append("mileage", form.mileage || "");
        formData.append("engine_hours", form.engine_hours || "");

        if (photoFile) {
            formData.append("vehicle_photo_file", photoFile);
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || (isEditing ? "Vehicle updated!" : "Vehicle created!");
                showModalMessage(successMsg);
                if (setApiMessage) setApiMessage(successMsg);

                setTimeout(() => {
                    closeEditModal();
                    fetchVehicles();
                }, 1200);
            } else {
                showModalError(result.message || "Failed to save vehicle.");
            }
        } catch (error) {
            showModalError("Server communication error.");
        }
    };

    const getPhotoSrc = () => {
        if (photoPreview) return photoPreview;
        if (form.vehicle_photo) return `http://localhost:8000/${form.vehicle_photo}`;
        return null;
    };

    return (
        <div className="management-card">
            <div className="content-header">
                <h3>Fleet Vehicles</h3>
                <button className="btn-login" style={{ width: "auto" }} onClick={openAddModal}>
                    ➕ Add New Vehicle
                </button>
            </div>

         
            <div className="responsive- wrapper">
                <table className="admin-table">
                    <colgroup>
                        <col style={{ width: "80px" }} />  
                        <col style={{ width: "220px" }} /> 
                        <col style={{ width: "120px" }} />
                        <col style={{ width: "200px" }} /> 
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="text-center">Photo</th>
                            <th>Vehicle Code / Reg</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                                    No vehicles found.
                                </td>
                            </tr>
                        ) : (
                            vehicles.map((v) => (
                                <tr key={v.vehicle_id}>
                                    <td className="text-center">
                                        {v.vehicle_photo ? (
                                            <div className="img-hover-container">
                                                <img
                                                    src={`http://localhost:8000/${v.vehicle_photo}`}
                                                    alt="Vehicle"
                                                    className="compact-thumb"
                                                />
                                                <img
                                                    src={`http://localhost:8000/${v.vehicle_photo}`}
                                                    alt="Vehicle Preview"
                                                    className="large-hover-preview"
                                                />
                                            </div>
                                        ) : (
                                            <span className="no-photo-badge">No Image</span>
                                        )}
                                    </td>
                                    <td>
                                        <strong className="vehicle-code-text">{v.vehicle_code}</strong>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                            Reg: {v.registration_no || "-"}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`status-pill ${v.status ? v.status.toLowerCase().replace(/\s+/g, '-') : 'available'}`}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="action-btn-group" style={{ justifyContent: "center", gap: "6px" }}>
                                            <button 
                                                className="action-btn edit-sm" 
                                                style={{ background: "rgba(56, 189, 248, 0.15)", color: "var(--primary)", borderColor: "rgba(56, 189, 248, 0.3)" }}
                                                onClick={() => handleViewDetail(v)} 
                                                title="View Full Details"
                                            >
                                                👁️ Detail
                                            </button>                                         
                                            <button 
                                                className="action-btn edit-sm" 
                                                onClick={() => handleEditClick(v)} 
                                                title="Edit Record"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className="action-btn delete-sm" 
                                                onClick={() => promptDeleteVehicle(v)} 
                                                title="Delete Record"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {isDetailModalOpen && selectedDetailVehicle && (
                <div className="modal-overlay" onClick={closeDetailModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
                        <div className="modal-header" style={{ borderBottom: "1px solid #334155", paddingBottom: "12px" }}>
                            <button 
                                type="button" 
                                onClick={closeDetailModal}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--primary)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: "pointer"
                                }}
                            >
                                ← Back to Vehicle List
                            </button>
                            <button className="close-modal-btn" onClick={closeDetailModal}>&times;</button>
                        </div>

                        <div className="modal-scroll-area" style={{ paddingTop: "16px" }}>
                            <div style={{ display: "flex", gap: "18px", alignItems: "center", marginBottom: "20px" }}>
                                {selectedDetailVehicle.vehicle_photo ? (
                                    <img 
                                        src={`http://localhost:8000/${selectedDetailVehicle.vehicle_photo}`} 
                                        alt="Vehicle" 
                                        style={{ width: "100px", height: "100px", borderRadius: "8px", objectFit: "cover", border: "1px solid #334155" }} 
                                    />
                                ) : (
                                    <div style={{ width: "100px", height: "100px", borderRadius: "8px", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", border: "1px dashed #334155" }}>
                                        No Photo
                                    </div>
                                )}
                                <div>
                                    <h2 style={{ margin: 0, color: "var(--text-main)", fontSize: "20px" }}>
                                        {selectedDetailVehicle.vehicle_code}
                                    </h2>
                                    <div style={{ marginTop: "6px" }}>
                                        <span className={`status-pill ${selectedDetailVehicle.status ? selectedDetailVehicle.status.toLowerCase().replace(/\s+/g, '-') : 'available'}`}>
                                            {selectedDetailVehicle.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Full 10 Specifications Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", background: "rgba(15, 23, 42, 0.4)", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
                                <div>
                                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Registration Number</label>
                                    <p style={{ margin: "2px 0 0", color: "var(--text-main)", fontWeight: "500" }}>{selectedDetailVehicle.registration_no || "-"}</p>
                                </div>

                                <div>
                                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Vehicle Type</label>
                                    <p style={{ margin: "2px 0 0", color: "var(--text-main)", fontWeight: "500" }}>{selectedDetailVehicle.type_name || selectedDetailVehicle.vehicle_type_id || "-"}</p>
                                </div>

                                <div>
                                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Manufacturer</label>
                                    <p style={{ margin: "2px 0 0", color: "var(--text-main)", fontWeight: "500" }}>{selectedDetailVehicle.manufacturer || "-"}</p>
                                </div>

                                <div>
                                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Model</label>
                                    <p style={{ margin: "2px 0 0", color: "var(--text-main)", fontWeight: "500" }}>{selectedDetailVehicle.model || "-"}</p>
                                </div>

                                <div>
                                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Year Manufactured</label>
                                    <p style={{ margin: "2px 0 0", color: "var(--text-main)", fontWeight: "500" }}>{selectedDetailVehicle.year_manufactured || "-"}</p>
                                </div>

                                <div>
                                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Purchase Date</label>
                                    <p style={{ margin: "2px 0 0", color: "var(--text-main)", fontWeight: "500" }}>{selectedDetailVehicle.purchase_date || "-"}</p>
                                </div>

                                <div>
                                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Current Mileage</label>
                                    <p style={{ margin: "2px 0 0", color: "var(--text-main)", fontWeight: "500" }}>
                                        {selectedDetailVehicle.mileage ? `${parseFloat(selectedDetailVehicle.mileage).toLocaleString()} km` : "0 km"}
                                    </p>
                                </div>

                                <div>
                                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Engine Hours</label>
                                    <p style={{ margin: "2px 0 0", color: "var(--text-main)", fontWeight: "500" }}>
                                        {selectedDetailVehicle.engine_hours ? `${parseFloat(selectedDetailVehicle.engine_hours).toLocaleString()} hrs` : "0 hrs"}
                                    </p>
                                </div>
                            </div>

                            <div className="modal-actions" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button 
                                    className="action-btn edit-sm" 
                                    style={{ padding: "8px 16px" }}
                                    onClick={() => {
                                        closeDetailModal();
                                        handleEditClick(selectedDetailVehicle);
                                    }}
                                >
                                    ✏️ Switch to Edit Mode
                                </button>
                                <button className="btn-logout" style={{ margin: 0, padding: "8px 16px" }} onClick={closeDetailModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. EDIT / CREATE FORM MODAL */}
            {isEditModalOpen && (
                <div className="modal-overlay" onClick={closeEditModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingVehicleId ? `✏️ Edit Vehicle: ${form.vehicle_code}` : "🚜 Register New Vehicle"}</h3>
                            <button className="close-modal-btn" onClick={closeEditModal}>&times;</button>
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
                                    <label>Vehicle Type</label>
                                    <select
                                        required
                                        value={form.vehicle_type_id}
                                        onChange={(e) => setForm({ ...form, vehicle_type_id: e.target.value })}
                                    >
                                        <option value="">-- Select Vehicle Type --</option>
                                        {vehicleTypes.map((vt) => (
                                            <option key={vt.vehicle_type_id} value={vt.vehicle_type_id}>
                                                {vt.type_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Vehicle Code (Unique)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. TOW-001"
                                        value={form.vehicle_code}
                                        onChange={(e) => setForm({ ...form, vehicle_code: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Registration Number</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. YGN-1234"
                                        value={form.registration_no}
                                        onChange={(e) => setForm({ ...form, registration_no: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Vehicle Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ padding: "8px 0" }}
                                    />

                                    {getPhotoSrc() && (
                                        <div style={{ marginTop: "10px", textAlign: "center" }}>
                                            <img
                                                src={getPhotoSrc()}
                                                alt="Vehicle Preview"
                                                style={{
                                                    width: "120px",
                                                    height: "120px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px",
                                                    border: "1px solid #374151"
                                                }}
                                            />
                                            <br />
                                            <button
                                                type="button"
                                                style={{
                                                    marginTop: "6px",
                                                    background: "transparent",
                                                    color: "#f87171",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    fontSize: "0.85rem"
                                                }}
                                                onClick={() => {
                                                    setPhotoFile(null);
                                                    setPhotoPreview("");
                                                    setForm({ ...form, vehicle_photo: "" });
                                                }}
                                            >
                                                ✖ Remove Photo
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Manufacturer</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Toyota / Kalmar"
                                        value={form.manufacturer}
                                        onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Model</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. TD25"
                                        value={form.model}
                                        onChange={(e) => setForm({ ...form, model: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Year Manufactured</label>
                                    <input
                                        type="number"
                                        placeholder="YYYY (e.g. 2022)"
                                        min="1900"
                                        max="2099"
                                        value={form.year_manufactured}
                                        onChange={(e) => setForm({ ...form, year_manufactured: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Purchase Date</label>
                                    <input
                                        type="date"
                                        value={form.purchase_date}
                                        onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Operating Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Assigned">Assigned</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Inspection">Inspection</option>
                                        <option value="Out of Service">Out of Service</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Mileage (km)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={form.mileage}
                                        onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Engine Hours</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={form.engine_hours}
                                        onChange={(e) => setForm({ ...form, engine_hours: e.target.value })}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={closeEditModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-login" style={{ width: "auto", margin: 0, padding: "10px 20px" }}>
                                        {editingVehicleId ? "Update Vehicle" : "Save Vehicle"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. DELETE CONFIRMATION MODAL */}
            {deleteModalOpen && (
                <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
                    <div className="custom-confirm-card" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">⚠️</div>
                        <h3>Confirm Vehicle Deletion</h3>
                        <p>
                            Are you sure you want to delete vehicle <strong>{vehicleToDelete?.vehicle_code}</strong>? This action cannot be undone.
                        </p>
                        <div className="modal-actions" style={{ marginTop: "24px" }}>
                            <button className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="action-btn delete" style={{ padding: "10px 20px", fontSize: "14px" }} onClick={confirmDeleteVehicle}>
                                Yes, Delete Vehicle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageVehicles;