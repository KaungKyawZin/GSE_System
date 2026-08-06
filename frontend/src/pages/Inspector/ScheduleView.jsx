import React, { useState, useEffect } from "react";

export default function ScheduleView({ setApiMessage, setApiError, onPrepare }) {
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchSchedule() {
      try {
        // flights endpoint returns { success, data }
        const res = await fetch("/api/flights/get_flights.php");
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        const list = (json && json.success && Array.isArray(json.data)) ? json.data : [];
        // normalize
        const normalized = list.map(f => ({ id: f.flight_id, flight_number: f.flight_number, time: f.departure_time || f.arrival_time, gate: f.gate || null, assigned_vehicle: f.assigned_vehicle || null, status: f.status }));
        setFlights(normalized);
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
        setApiError && setApiError(e.message);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    fetchSchedule();
    return () => { mounted = false; };
  }, [setApiError]);

  return (
    <div>
      <h2>Schedule</h2>
      <p className="muted">Gate and flight timelines. Use this to prepare inspections before the vehicle window.</p>

      {loading && <p>Loading schedule…</p>}
      {error && <div className="dashboard-alert error">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive">
          {flights.length === 0 ? (
            <p>No upcoming flights found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Time</th>
                  <th>Gate</th>
                  <th>Assigned Vehicle</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {flights.map((f) => (
                  <tr key={f.id || f.flight_number}>
                    <td>{f.flight_number || f.id}</td>
                    <td>{f.scheduled_time || f.time || "-"}</td>
                    <td>{f.gate || "-"}</td>
                    <td>{f.assigned_vehicle || "-"}</td>
                    <td>
                        <button className="btn" onClick={() => { if (onPrepare) onPrepare(f.assigned_vehicle || ''); else setApiMessage && setApiMessage(`Inspect vehicle ${f.assigned_vehicle || ''} for ${f.flight_number || ''}`); }}>Prepare</button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
