
import React, { useState, useEffect } from "react";

function ManageFlights({ setApiMessage, setApiError }) {
    // =========================
    // State
    // =========================
    const [flights, setFlights] = useState([]);
    const [gates, setGates] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFlightId, setEditingFlightId] = useState(null);

    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [flightToDelete, setFlightToDelete] = useState(null);

    const [form, setForm] = useState({
        flight_number: "",
        airline: "",
        gate_id: "",
        arrival_time: "",
        departure_time: "",
        status: "Scheduled"
    });

    // =========================
    // Load Flights & Gates
    // =========================
    useEffect(() => {
        fetchFlights();
        fetchGates();
    }, []);

    // =========================
    // Messages
    // =========================
    const showModalError = (err) => {
        setFormError(err);
        setTimeout(() => setFormError(""), 3000);
    };

    const showModalMessage = (msg) => {
        setFormMessage(msg);
        setTimeout(() => setFormMessage(""), 3000);
    };

    // =========================
    // Format DateTime
    // =========================
    const formatForInput = (dtStr) => {
        if (!dtStr) return "";

        return dtStr
            .replace(" ", "T")
            .substring(0, 16);
    };

    // =========================
    // 1. Fetch Flights
    // =========================
    const fetchFlights = async () => {
        try {
            const response = await fetch(
                "http://localhost:8000/api/flights/get_flights.php"
            );

            const result = await response.json();

            if (result.success) {
                setFlights(
                    Array.isArray(result.data)
                        ? result.data
                        : []
                );
            } else {
                if (setApiError) {
                    setApiError(
                        result.message || "Failed to load flights."
                    );
                }
            }
        } catch (error) {
            console.error("Fetch flights error:", error);

            if (setApiError) {
                setApiError("Failed to load flights list.");
            }
        }
    };

    // =========================
    // 2. Fetch Gates
    // =========================
    const fetchGates = async () => {
        try {
            const response = await fetch(
                "http://localhost:8000/api/airport_gates/get_gates.php"
            );

            const result = await response.json();

            if (result.success) {
                setGates(
                    Array.isArray(result.data)
                        ? result.data
                        : []
                );
            } else {
                console.error(
                    result.message || "Failed to load gates."
                );

                if (setApiError) {
                    setApiError(
                        result.message || "Failed to load gates."
                    );
                }
            }
        } catch (error) {
            console.error("Fetch gates error:", error);

            if (setApiError) {
                setApiError("Failed to load gates list.");
            }
        }
    };

    // =========================
    // 3. Get Gate Code
    // =========================
    const getGateCode = (gateId) => {
        if (!gateId) {
            return "-";
        }

        const foundGate = gates.find(
            (gate) =>
                String(gate.gate_id) === String(gateId)
        );

        return foundGate
            ? foundGate.gate_code
            : `Gate ${gateId}`;
    };

    // =========================
    // 4. Open Edit Modal
    // =========================
    const handleEditClick = (flight) => {
        setFormError("");
        setFormMessage("");

        setEditingFlightId(flight.flight_id);

        setForm({
            flight_number: flight.flight_number || "",
            airline: flight.airline || "",
            gate_id: flight.gate_id || "",
            arrival_time: formatForInput(
                flight.arrival_time
            ),
            departure_time: formatForInput(
                flight.departure_time
            ),
            status: flight.status || "Scheduled"
        });

        setIsModalOpen(true);
    };

    // =========================
    // 5. Open Add Modal
    // =========================
    const openAddModal = () => {
        setEditingFlightId(null);

        setFormError("");
        setFormMessage("");

        setForm({
            flight_number: "",
            airline: "",
            gate_id: "",
            arrival_time: "",
            departure_time: "",
            status: "Scheduled"
        });

        setIsModalOpen(true);
    };

    // =========================
    // 6. Close Modal
    // =========================
    const closeModal = () => {
        setIsModalOpen(false);

        setFormError("");
        setFormMessage("");

        setEditingFlightId(null);
    };

    // =========================
    // 7. Prompt Delete
    // =========================
    const promptDeleteFlight = (flight) => {
        setFlightToDelete(flight);
        setDeleteModalOpen(true);
    };

    // =========================
    // 8. Confirm Delete
    // =========================
    const confirmDeleteFlight = async () => {
        if (!flightToDelete) {
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:8000/api/flights/delete_flight.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        flight_id:
                            flightToDelete.flight_id
                    })
                }
            );

            const result = await response.json();

            if (result.success) {
                const successMsg =
                    result.message ||
                    "Flight record deleted successfully.";

                if (setApiMessage) {
                    setApiMessage(successMsg);
                }

                fetchFlights();
            } else {
                const errorMsg =
                    result.message ||
                    "Failed to delete flight.";

                if (setApiError) {
                    setApiError(errorMsg);
                }
            }
        } catch (error) {
            console.error(
                "Delete flight error:",
                error
            );

            if (setApiError) {
                setApiError(
                    "Server communication error."
                );
            }
        } finally {
            setDeleteModalOpen(false);
            setFlightToDelete(null);
        }
    };

    // =========================
    // 9. Handle Submit
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormError("");
        setFormMessage("");

        const isEditing =
            editingFlightId !== null;

        const endpoint = isEditing
            ? "http://localhost:8000/api/flights/update_flight.php"
            : "http://localhost:8000/api/flights/create_flight.php";

        const requestBody = isEditing
            ? {
                  ...form,
                  flight_id: editingFlightId
              }
            : form;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (result.success) {
                const successMsg =
                    result.message ||
                    (isEditing
                        ? "Flight updated successfully!"
                        : "Flight created successfully!");

                showModalMessage(successMsg);

                if (setApiMessage) {
                    setApiMessage(successMsg);
                }

                setTimeout(() => {
                    closeModal();
                    fetchFlights();
                    fetchGates();
                }, 1200);
            } else {
                const errorMsg =
                    result.message ||
                    "Failed to save flight record.";

                showModalError(errorMsg);
            }
        } catch (error) {
            console.error(
                "Save flight error:",
                error
            );

            showModalError(
                "Server communication error."
            );
        }
    };

    // =========================
    // Render
    // =========================
    return (
        <div className="management-card">

            {/* =========================
                Header
            ========================= */}
            <div className="content-header">
                <h3>Flight Schedules</h3>

                <button
                    className="btn-login"
                    onClick={openAddModal}
                >
                    ➕ Add Flight
                </button>
            </div>

            {/* =========================
                Flight Table
            ========================= */}
            <div className="responsive-table-wrapper">
                <table className="admin-table">

                    <thead>
                        <tr>
                            <th>Flight No.</th>
                            <th>Airline</th>
                            <th>Gate</th>
                            <th>Arrival Time</th>
                            <th>Departure Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {flights.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="7"
                                    style={{
                                        textAlign:
                                            "center",
                                        color:
                                            "var(--text-muted)"
                                    }}
                                >
                                    No flights found.
                                </td>
                            </tr>

                        ) : (

                            flights.map((flight) => (

                                <tr
                                    key={
                                        flight.flight_id
                                    }
                                >

                                    {/* Flight Number */}
                                    <td>
                                        <strong>
                                            {
                                                flight.flight_number
                                            }
                                        </strong>
                                    </td>

                                    {/* Airline */}
                                    <td>
                                        {
                                            flight.airline ||
                                            "-"
                                        }
                                    </td>

                                    {/* Gate */}
                                    <td>
                                        {getGateCode(
                                            flight.gate_id
                                        )}
                                    </td>

                                    {/* Arrival */}
                                    <td>
                                        {flight.arrival_time
                                            ? new Date(
                                                  flight.arrival_time
                                              ).toLocaleString()
                                            : "-"}
                                    </td>

                                    {/* Departure */}
                                    <td>
                                        {flight.departure_time
                                            ? new Date(
                                                  flight.departure_time
                                              ).toLocaleString()
                                            : "-"}
                                    </td>

                                    {/* Status */}
                                    <td>
                                        {flight.status}
                                    </td>

                                    {/* Actions */}
                                    <td>

                                        <button
                                            className="action-btn edit"
                                            onClick={() =>
                                                handleEditClick(
                                                    flight
                                                )
                                            }
                                        >
                                            ✏️ Edit
                                        </button>

                                        <button
                                            className="action-btn delete"
                                            onClick={() =>
                                                promptDeleteFlight(
                                                    flight
                                                )
                                            }
                                        >
                                            🗑️ Delete
                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>
            </div>

            {/* =========================
                ADD / EDIT FLIGHT MODAL
            ========================= */}
            {isModalOpen && (

                <div
                    className="modal-overlay"
                    onClick={closeModal}
                >

                    <div
                        className="modal-content"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* Modal Header */}
                        <div className="modal-header">

                            <h3>
                                {editingFlightId
                                    ? "✏️ Edit Flight"
                                    : "✈️ Add New Flight"}
                            </h3>

                            <button
                                className="close-modal-btn"
                                onClick={closeModal}
                            >
                                &times;
                            </button>

                        </div>

                        {/* Success Message */}
                        {formMessage && (

                            <div className="modal-top-alert success">
                                <span>
                                    ✓ {formMessage}
                                </span>
                            </div>

                        )}

                        {/* Error Message */}
                        {formError && (

                            <div className="modal-top-alert error">
                                <span>
                                    ⚠️ {formError}
                                </span>
                            </div>

                        )}

                        {/* Form */}
                        <div className="modal-scroll-area">

                            <form onSubmit={handleSubmit}>

                                {/* Flight Number */}
                                <div className="form-group">

                                    <label>
                                        Flight Number
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. SQ-124"
                                        value={
                                            form.flight_number
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                flight_number:
                                                    e.target
                                                        .value
                                            })
                                        }
                                    />

                                </div>

                                {/* Airline */}
                                <div className="form-group">

                                    <label>
                                        Airline
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="e.g. Singapore Airlines"
                                        value={
                                            form.airline
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                airline:
                                                    e.target
                                                        .value
                                            })
                                        }
                                    />

                                </div>

                                {/* Gate */}
                                <div className="form-group">

                                    <label>
                                        Gate
                                    </label>

                                    <select
                                        value={
                                            form.gate_id
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                gate_id:
                                                    e.target
                                                        .value
                                            })
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select Gate
                                        </option>

                                        {gates.length ===
                                        0 ? (

                                            <option
                                                value=""
                                                disabled
                                            >
                                                No gates
                                                available
                                            </option>

                                        ) : (

                                            gates.map(
                                                (gate) => (

                                                    <option
                                                        key={
                                                            gate.gate_id
                                                        }
                                                        value={
                                                            gate.gate_id
                                                        }
                                                    >
                                                        {
                                                            gate.gate_code
                                                        }
                                                    </option>

                                                )
                                            )

                                        )}

                                    </select>

                                </div>

                                {/* Arrival Time */}
                                <div className="form-group">

                                    <label>
                                        Arrival Time
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={
                                            form.arrival_time
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                arrival_time:
                                                    e.target
                                                        .value
                                            })
                                        }
                                    />

                                </div>

                                {/* Departure Time */}
                                <div className="form-group">

                                    <label>
                                        Departure Time
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={
                                            form.departure_time
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                departure_time:
                                                    e.target
                                                        .value
                                            })
                                        }
                                    />

                                </div>

                                {/* Flight Status */}
                                <div className="form-group">

                                    <label>
                                        Flight Status
                                    </label>

                                    <select
                                        value={
                                            form.status
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                status:
                                                    e.target
                                                        .value
                                            })
                                        }
                                    >

                                        <option value="Scheduled">
                                            Scheduled
                                        </option>

                                        <option value="Departed">
                                            Departed
                                        </option>

                                        <option value="Cancelled">
                                            Cancelled
                                        </option>

                                    </select>

                                </div>

                                {/* Modal Actions */}
                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="btn-logout"
                                        style={{
                                            margin: 0,
                                            padding:
                                                "10px 20px"
                                        }}
                                        onClick={
                                            closeModal
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-login"
                                        style={{
                                            width: "auto",
                                            margin: 0,
                                            padding:
                                                "10px 20px"
                                        }}
                                    >
                                        {editingFlightId
                                            ? "Update Flight"
                                            : "Save Flight"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            )}

            {/* =========================
                DELETE CONFIRMATION MODAL
            ========================= */}
            {deleteModalOpen && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setDeleteModalOpen(false)
                    }
                >

                    <div
                        className="custom-confirm-card"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="confirm-icon">
                            ⚠️
                        </div>

                        <h3>
                            Confirm Flight Deletion
                        </h3>

                        <p>
                            Are you sure you want to
                            delete flight{" "}
                            <strong>
                                {
                                    flightToDelete?.flight_number
                                }
                            </strong>
                            ?
                        </p>

                        <div
                            className="modal-actions"
                            style={{
                                marginTop: "24px"
                            }}
                        >

                            <button
                                className="btn-logout"
                                style={{
                                    margin: 0,
                                    padding:
                                        "10px 20px"
                                }}
                                onClick={() =>
                                    setDeleteModalOpen(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="action-btn delete"
                                style={{
                                    padding:
                                        "10px 20px",
                                    fontSize: "14px"
                                }}
                                onClick={
                                    confirmDeleteFlight
                                }
                            >
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

