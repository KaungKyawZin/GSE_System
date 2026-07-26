import React, { useState, useEffect } from "react";

function ManageVehicles({ setApiMessage, setApiError }) {
    const [vehicles, setVehicles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicleId, setEditingVehicleId] = useState(null);

    // Photo State Declarations
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    // In-Modal Alert Notification States (Disappear after 2 seconds)
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    // Custom Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    const [form, setForm] = useState({
        vehicle_type_id: "",
        vehicle_code: "",
        registration_no: "",
        manufacturer: "",
        model: "",
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

    // Helper functions for floating alerts inside modal
    const showModalError = (err) => {
        setFormError(err);
        setTimeout(() => setFormError(""), 2000);
    };

    const showModalMessage = (msg) => {
        setFormMessage(msg);
        setTimeout(() => setFormMessage(""), 2000);
    };

    // Handle file selection and preview generation
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file)); // Immediate preview URL
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

    // 2. Fetch Vehicle Types for Form Dropdown
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

    // 3. Open Edit Modal
    const handleEditClick = (v) => {
        setFormError("");
        setFormMessage("");
        setEditingVehicleId(v.vehicle_id);

        // Reset file upload state & load existing image preview if available
        setPhotoFile(null);
        setPhotoPreview(v.vehicle_photo ? `http://localhost:8000/${v.vehicle_photo}` : "");

        setForm({
            vehicle_type_id: v.vehicle_type_id || "",
            vehicle_code: v.vehicle_code || "",
            registration_no: v.registration_no || "",
            manufacturer: v.manufacturer || "",
            model: v.model || "",
            year_manufactured: v.year_manufactured || "",
            purchase_date: v.purchase_date || "",
            status: v.status || "Available",
            mileage: v.mileage || "",
            engine_hours: v.engine_hours || ""
        });
        setIsModalOpen(true);
    };

    // 4. Prompt Custom Delete Modal
    const promptDeleteVehicle = (v) => {
        setVehicleToDelete(v);
        setDeleteModalOpen(true);
    };

    // 5. Execute Vehicle Deletion
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

    // 6. Handle Form Submit (Create / Update using FormData)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormMessage("");

        const isEditing = editingVehicleId !== null;
        const endpoint = isEditing
            ? "http://localhost:8000/api/vehicles/update_vehicle.php"
            : "http://localhost:8000/api/vehicles/create_vehicle.php";

        // Construct FormData payload for file uploads
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

        // Append photo file if user uploaded a new one
        if (photoFile) {
            formData.append("vehicle_photo", photoFile);
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || (isEditing ? "Vehicle record updated!" : "New vehicle added successfully!");
                showModalMessage(successMsg);
                if (setApiMessage) setApiMessage(successMsg);

                setTimeout(() => {
                    closeModal();
                    fetchVehicles();
                }, 1200);
            } else {
                const errorMsg = result.message || "Failed to save vehicle profile.";
                showModalError(errorMsg);
            }
        } catch (error) {
            showModalError("Server communication error.");
        }
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
            year_manufactured: "",
            purchase_date: "",
            status: "Available",
            mileage: "",
            engine_hours: ""
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError("");
        setFormMessage("");
        setPhotoFile(null);
        setPhotoPreview("");
    };

    return (
        <div className="management-card">
            <div className="content-header">
                <h3>Fleet Vehicles</h3>
                <button className="btn-login" onClick={openAddModal}>
                    ➕ Add New Vehicle
                </button>
            </div>

            <div className="responsive-table-wrapper">
                <table className="admin-table-extend">
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Code</th>
                            <th>Reg. No</th>
                            <th>Type</th>
                            <th>Make & Model</th>
                            <th>Year</th>
                            <th>Status</th>
                            <th>Mileage (km)</th>
                            <th>Engine Hrs</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.length === 0 ? (
                            <tr>
                                <td colSpan="10" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                                    No vehicles found.
                                </td>
                            </tr>
                        ) : (
                            vehicles.map((v) => (
                                <tr key={v.vehicle_id}>
                                    <td>
                                        {v.vehicle_photo ? (
                                            <img
                                                src={`http://localhost:8000/${v.vehicle_photo}`}
                                                alt="Vehicle"
                                                style={{
                                                    width: "48px",
                                                    height: "48px",
                                                    objectFit: "cover",
                                                    borderRadius: "6px"
                                                }}
                                            />
                                        ) : (
                                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No Photo</span>
                                        )}
                                    </td>
                                    <td><strong>{v.vehicle_code}</strong></td>
                                    <td>{v.registration_no || "-"}</td>
                                    <td>{v.type_name || v.vehicle_type_id}</td>
                                    <td>{v.manufacturer} {v.model}</td>
                                    <td>{v.year_manufactured || "-"}</td>
                                    <td>{v.status}</td>
                                    <td>{v.mileage ? parseFloat(v.mileage).toLocaleString() : "0"}</td>
                                    <td>{v.engine_hours ? parseFloat(v.engine_hours).toLocaleString() : "0"}</td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(v)}>✏️ Edit</button>
                                        <button className="action-btn delete" onClick={() => promptDeleteVehicle(v)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingVehicleId ? "✏️ Edit Vehicle Record" : "🚜 Register New Vehicle"}</h3>
                            <button className="close-modal-btn" onClick={closeModal}>&times;</button>
                        </div>

                        {/* POP-UP ALERTS INSIDE MODAL */}
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

                                {/* VEHICLE PHOTO UPLOAD FIELD */}
                                <div className="form-group">
                                    <label>Vehicle Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ padding: "8px 0" }}
                                    />

                                    {/* PHOTO PREVIEW */}
                                    {photoPreview && (
                                        <div style={{ marginTop: "10px", textAlign: "center" }}>
                                            <img
                                                src={photoPreview}
                                                alt="Vehicle Preview"
                                                style={{
                                                    width: "100%",
                                                    maxHeight: "180px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px",
                                                    border: "1px solid var(--border-color, #334155)"
                                                }}
                                            />
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
                                                }}
                                            >
                                                ✖ Remove Selected Photo
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
                                    <button type="button" className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={closeModal}>
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

            {/* CUSTOM DELETE CONFIRMATION MODAL */}
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