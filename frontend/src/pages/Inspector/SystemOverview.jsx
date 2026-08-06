import React, { useState, useEffect } from "react";

export default function DashboardView({ setApiError, setActiveMenu }) {
  const [summary, setSummary] = useState({ today: 0, pending: 0, completed: 0, failed: 0 });
  const [upcomingFlights, setUpcomingFlights] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData(); 
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, fltRes, notifRes] = await Promise.all([
        fetch("http://localhost:8000/api/dashboard/summary.php"),
        fetch("http://localhost:8000/api/flights/upcoming.php"),
        fetch("http://localhost:8000/api/notifications/recent.php")
      ]);

      const sumData = await sumRes.json();
      const fltData = await fltRes.json();
      const notifData = await notifRes.json();

      if (sumData.success) setSummary(sumData.data);
      if (fltData.success) setUpcomingFlights(fltData.data || []);
      if (notifData.success) setRecentNotifications(notifData.data || []);
    } catch (err) {
      setApiError("Failed to sync dashboard telemetry.");
    }
  };

  return (
    <div>
      <h3>📊 Inspector Operational Dashboard</h3>
      
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", margin: "20px 0" }}>
        <div className="card" style={{ background: "#1e1e1e", padding: "16px", borderRadius: "8px" }}>
          <small>Today's Inspections</small>
          <h2>{summary.today}</h2>
        </div>
        <div className="card" style={{ background: "#1e1e1e", padding: "16px", borderRadius: "8px" }}>
          <small>Pending Jobs</small>
          <h2 style={{ color: "#ffb74d" }}>{summary.pending}</h2>
        </div>
        <div className="card" style={{ background: "#1e1e1e", padding: "16px", borderRadius: "8px" }}>
          <small>Completed</small>
          <h2 style={{ color: "#81c784" }}>{summary.completed}</h2>
        </div>
        <div className="card" style={{ background: "#1e1e1e", padding: "16px", borderRadius: "8px" }}>
          <small>Failed / Issues</small>
          <h2 style={{ color: "#e57373" }}>{summary.failed}</h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* Upcoming Flights */}
        <div style={{ background: "#1e1e1e", padding: "16px", borderRadius: "8px" }}>
          <h4>✈️ Upcoming Flight Assignments</h4>
          <table style={{ width: "100%", color: "#fff", marginTop: "10px" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #333" }}>
                <th>Flight</th><th>Gate</th><th>Time</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingFlights.map((f, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #222" }}>
                  <td>{f.flight}</td><td>{f.gate}</td><td>{f.time}</td><td>{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Notifications Summary */}
        <div style={{ background: "#1e1e1e", padding: "16px", borderRadius: "8px" }}>
          <h4>🔔 Live Alerts</h4>
          <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
            {recentNotifications.map((n, i) => (
              <li key={i} style={{ marginBottom: "8px" }}><small>{n.type}: {n.message}</small></li>
            ))}
          </ul>
          <button style={{ marginTop: "10px" }} onClick={() => setActiveMenu("notifications")}>View All Alerts</button>
        </div>
      </div>
    </div>
  );
}