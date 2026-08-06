import React, { useState, useEffect } from "react";

export default function ReportsView({ setApiMessage, setApiError }) {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchReports() {
      try {
        // inspections may not exist yet — attempt fetch and handle shapes {success,data}
        const res = await fetch("/api/inspections/get_reports.php");
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        const list = (json && json.success && Array.isArray(json.data)) ? json.data : [];
        // normalize report fields
        const normalized = list.map(r => ({ id: r.report_id || r.id, vehicle: r.vehicle_code || r.vehicle_number || r.vehicle_id || r.vehicle, inspector: r.inspector_name || r.inspector || r.user_id, status: r.status || r.result || 'Unknown', raw: r }));
        setReports(normalized);
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
        setApiError && setApiError(e.message);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    fetchReports();
    return () => { mounted = false; };
  }, [setApiError]);

  const forwardToTech = async (report) => {
    try {
      const payload = { report_id: report.id };
      const res = await fetch("/api/notifications/create_notification.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Notify failed ${res.status}`);
      setApiMessage && setApiMessage("Report forwarded to technicians.");
    } catch (e) {
      setApiError && setApiError(e.message);
    }
  };

  return (
    <div>
      <h2>Inspection Reports</h2>
      <p className="muted">Completed inspection reports. Use this to escalate failed items to technicians.</p>

      {loading && <p>Loading reports…</p>}
      {error && <div className="dashboard-alert error">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive">
          {reports.length === 0 ? (
            <p>No reports yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle</th>
                  <th>Inspector</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.vehicle || r.vehicle_number || '-'}</td>
                    <td>{r.inspector || '-'}</td>
                    <td>{r.status || '-'}</td>
                    <td>
                      {r.status !== 'OK' && (
                        <button className="btn btn-primary" onClick={() => forwardToTech(r)}>Forward to Technician</button>
                      )}
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
