﻿import React, { useState, useEffect } from "react";

export default function StartInspection({ setApiError, selectedVehicle, onStartInspection }) {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchAssignments() {
      try {
        const res = await fetch("/api/vehicles/get_assignments.php");
        if (!res.ok) throw new Error(`Assignments API ${res.status}`);
        const data = await res.json();
        if (!mounted) return;

        const list = (data && data.success && Array.isArray(data.data)) ? data.data : [];
        const normalized = list.map((row) => ({
          assignment_id: row.assignment_id,
          vehicle_id: row.vehicle_id,
          vehicle_number: row.vehicle_code || row.registration_no || `Vehicle ${row.vehicle_id}`,
          type_name: row.vehicle_type_name || row.vehicle_type || 'Unknown',
          flight_number: row.flight_number || 'Unassigned',
          gate: row.gate_code ? `${row.gate_code}${row.terminal ? ` (${row.terminal})` : ''}` : 'Unknown',
          status: row.assignment_status || row.vehicle_status || 'Assigned',
          raw: row,
        }));

        setAssignments(normalized);
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
        setApiError && setApiError(e.message);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchAssignments();
    return () => { mounted = false; };
  }, [setApiError]);

  return (
    <div>
      <h3>📋 Step 1 & 2: Assigned Inspection Jobs</h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "16px" }}>
        {/* Step 1 & 2: View and Select Job */}
        <div style={{ background: "#1e1e1e", padding: "16px", borderRadius: "8px" }}>
          <h4>Assigned Work Orders</h4>
          {jobs.map((job) => (
            <div key={job.job_id} style={{ padding: "12px", border: "1px solid #333", borderRadius: "6px", marginBottom: "10px" }}>
              <strong>Job #{job.job_id} - Vehicle: {job.vehicle_id}</strong>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "#aaa" }}>Gate: {job.gate} | Flight: {job.flight}</p>
              <button onClick={() => setSelectedJobDetail(job)}>Step 3: View Vehicle Detail</button>
            </div>
          ))}
        </div>

        {/* Step 3 & 4: View Vehicle Detail and Start Inspection */}
        <div style={{ background: "#1e1e1e", padding: "16px", borderRadius: "8px" }}>
          <h4>Step 3: Vehicle Detail Card</h4>
          {selectedJobDetail ? (
            <div>
              <p><strong>Vehicle ID:</strong> {selectedJobDetail.vehicle_id}</p>
              <p><strong>Type:</strong> {selectedJobDetail.type}</p>
              <p><strong>Plate No:</strong> {selectedJobDetail.plate_no}</p>
              <p><strong>Assigned Gate:</strong> {selectedJobDetail.gate}</p>
              <p><strong>Associated Flight:</strong> {selectedJobDetail.flight}</p>
              
              <button 
                style={{ marginTop: "16px", background: "#2e7d32", color: "#fff", padding: "10px 16px", border: "none", borderRadius: "4px" }}
                onClick={() => onStartInspection(selectedJobDetail)}
              >
                🚀 Step 4: Start Inspection
              </button>
            </div>
          ) : (
            <p style={{ color: "#888" }}>Select a job from the left list to review vehicle specs.</p>
          )}
        </div>
      </div>
    </div>
  );
}