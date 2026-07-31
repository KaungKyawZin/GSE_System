import React, { useState, useEffect } from "react";

function ManageFlights({ setApiMessage, setApiError }) {
    const [flights, setFlights] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFlightId, setEditingFlightId] = useState(null);

    // In-Modal Alert Notification States
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    // Custom Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [flightToDelete, setFlightToDelete] = useState(null);

    const [form, setForm] = useState({
        flight_number: "",
        airline: "",
        arrival_time: "",
        departure_time: "",
        status: "Scheduled"
    });

    useEffect(() => {
        fetchFlights();
    }, []);

    const showModalError = (err) => {
        setFormError(err);
        setTimeout(() => setFormError(""), 2000);
    };

    const showModalMessage = (msg) => {
        setFormMessage(msg);
        setTimeout(() => setFormMessage(""), 2000);
    };

    // Format SQL DATETIME (YYYY-MM-DD HH:MM:SS) to datetime-local input format (YYYY-MM-DDTHH:MM)
    const formatForInput = (dtStr) => {
        if (!dtStr) return "";
        return dtStr.replace(" ", "T").substring(0, 16);
    };

    // 1. Fetch Flights List
    const fetchFlights = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/flight/get_flight.php");
            const result = await response.json();
            if (result.success) {
                setFlights(Array.isArray(result.data) ? result.data : []);
            }
        } catch (error) {
            if (setApiError) setApiError("Failed to load flights list.");
        }
    };

    // 2. Open Edit Modal
    const handleEditClick = (f) => {
        setFormError("");
        setFormMessage("");
        setEditingFlightId(f.flight_id);
        setForm({
            flight_number: f.flight_number || "",
            airline: f.airline || "",
            arrival_time: formatForInput(f.arrival_time),
            departure_time: formatForInput(f.departure_time),
            status: f.status || "Scheduled"
        });
        setIsModalOpen(true);
    };

    // 3. Prompt Custom Delete Modal
    const promptDeleteFlight = (f) => {
        setFlightToDelete(f);
        setDeleteModalOpen(true);
    };

    // 4. Execute Flight Deletion
    const confirmDeleteFlight = async () => {
        if (!flightToDelete) return;

        try {
            const response = await fetch("http://localhost:8000/api/flight/delete_flight.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ flight_id: flightToDelete.flight_id })
            });
            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || "Flight record deleted successfully.";
                if (setApiMessage) setApiMessage(successMsg);
                fetchFlights();
            } else {
                const errorMsg = result.message || "Failed to delete flight.";
                if (setApiError) setApiError(errorMsg);
            }
        } catch (error) {
            if (setApiError) setApiError("Server communication error.");
        } finally {
            setDeleteModalOpen(false);
            setFlightToDelete(null);
        }
    };

    // 5. Handle Submit (Create / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormMessage("");

        const isEditing = editingFlightId !== null;
        const endpoint = isEditing
            ? "http://localhost:8000/api/flight/update_flight.php"
            : "http://localhost:8000/api/flight/create_flight.php";

        const requestBody = isEditing
            ? { ...form, flight_id: editingFlightId }
            : form;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (result.success) {
                const successMsg = result.message || (isEditing ? "Flight updated!" : "Flight created successfully!");
                showModalMessage(successMsg);
                if (setApiMessage) setApiMessage(successMsg);

                setTimeout(() => {
                    closeModal();
                    fetchFlights();
                }, 1200);
            } else {
                const errorMsg = result.message || "Failed to save flight record.";
                showModalError(errorMsg);
            }
        } catch (error) {
            showModalError("Server communication error.");
        }
    };

    const openAddModal = () => {
        setEditingFlightId(null);
        setFormError("");
        setFormMessage("");
        setForm({
            flight_number: "",
            airline: "",
            arrival_time: "",
            departure_time: "",
            status: "Scheduled"
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
                <h3>Flight Schedules</h3>
                <button className="btn-login" onClick={openAddModal}>
                    ➕ Add Flight
                </button>
            </div>

            <div className="responsive-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Flight No.</th>
                            <th>Airline</th>
                            <th>Arrival Time</th>
                            <th>Departure Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flights.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)" }}>No flights found.</td>
                            </tr>
                        ) : (
                            flights.map((f) => (
                                <tr key={f.flight_id}>
                                    <td><strong>{f.flight_number}</strong></td>
                                    <td>{f.airline || "-"}</td>
                                    <td>{f.arrival_time ? new Date(f.arrival_time).toLocaleString() : "-"}</td>
                                    <td>{f.departure_time ? new Date(f.departure_time).toLocaleString() : "-"}</td>
                                    <td>{f.status}</td>
                                    <td>
                                        <button className="action-btn edit" onClick={() => handleEditClick(f)}>✏️ Edit</button>
                                        <button className="action-btn delete" onClick={() => promptDeleteFlight(f)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD / EDIT FLIGHT MODAL */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingFlightId ? "✏️ Edit Flight" : "✈️ Add New Flight"}</h3>
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
                                    <label>Flight Number</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. SQ-124"
                                        value={form.flight_number}
                                        onChange={(e) => setForm({ ...form, flight_number: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Airline</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Singapore Airlines"
                                        value={form.airline}
                                        onChange={(e) => setForm({ ...form, airline: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Arrival Time</label>
                                    <input
                                        type="datetime-local"
                                        value={form.arrival_time}
                                        onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Departure Time</label>
                                    <input
                                        type="datetime-local"
                                        value={form.departure_time}
                                        onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Flight Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Boarding">Boarding</option>
                                        <option value="Arrived">Arrived</option>
                                        <option value="Departed">Departed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-login" style={{ width: "auto", margin: 0, padding: "10px 20px" }}>
                                        {editingFlightId ? "Update Flight" : "Save Flight"}
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
                        <h3>Confirm Flight Deletion</h3>
                        <p>
                            Are you sure you want to delete flight <strong>{flightToDelete?.flight_number}</strong>?
                        </p>
                        <div className="modal-actions" style={{ marginTop: "24px" }}>
                            <button className="btn-logout" style={{ margin: 0, padding: "10px 20px" }} onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="action-btn delete" style={{ padding: "10px 20px", fontSize: "14px" }} onClick={confirmDeleteFlight}>
                                Yes, Delete Flight
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageFlights;