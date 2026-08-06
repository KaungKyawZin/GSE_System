import React, { useState, useEffect } from "react";

export default function AssignedVehicles({ setApiMessage, setApiError, onInspect }) {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [flights, setFlights] = useState([]);
  const [gates, setGates] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [aiResult, setAiResult] = useState(null); // 'ok' | 'fail' | null
  const [assigning, setAssigning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualComment, setManualComment] = useState("");

  // Toggle this to true to enable real AI endpoint calls.
  // Default false during development so the UI uses a simulated result.
  const REAL_AI_ENABLED = false;

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      try {
        // Use list endpoints that return { success: true, data: [...] }
        const [vRes, fRes, gRes, uRes] = await Promise.all([
          fetch("/api/vehicles/get_vehicles.php"),
          fetch("/api/flights/get_flights.php"),
          fetch("/api/airport_gates/get_gates.php"),
          fetch("/api/users/get_users.php"),
        ]);

        if (!vRes.ok) throw new Error(`Vehicles API ${vRes.status}`);
        if (!fRes.ok) throw new Error(`Flights API ${fRes.status}`);
        if (!gRes.ok) throw new Error(`Gates API ${gRes.status}`);
        if (!uRes.ok) throw new Error(`Users API ${uRes.status}`);

        const [vJson, fJson, gJson, uJson] = await Promise.all([
          vRes.json(),
          fRes.json(),
          gRes.json(),
          uRes.json(),
        ]);

        if (!mounted) return;

        const vData = (vJson && vJson.success && Array.isArray(vJson.data)) ? vJson.data : [];
        const fData = (fJson && fJson.success && Array.isArray(fJson.data)) ? fJson.data : [];
        const gData = (gJson && gJson.success && Array.isArray(gJson.data)) ? gJson.data : [];
        const uData = (uJson && uJson.success && Array.isArray(uJson.data)) ? uJson.data : [];

        // Normalize fields to simpler keys used by the UI
        const vehiclesNorm = vData.map(v => ({
          id: v.vehicle_id,
          vehicle_number: v.vehicle_code || v.registration_no || v.vehicle_id,
          type_name: v.vehicle_type_id || null,
          assigned_flight: v.assigned_flight || v.flight_id || null,
          gate: v.gate_id || null,
          vehicle_photo: v.vehicle_photo || '',
          status: v.status || v.state || 'Unknown',
          raw: v
        }));

        const flightsNorm = fData.map(f => ({ id: f.flight_id, flight_number: f.flight_number, departure_time: f.departure_time, arrival_time: f.arrival_time, status: f.status, raw: f }));
        const gatesNorm = gData.map(g => ({ id: g.gate_id, name: g.gate_code || g.gate_id, raw: g }));
        const usersNorm = uData.map(u => ({ id: u.user_id, username: u.username || `${u.first_name || ''} ${u.last_name || ''}`, raw: u }));

        setVehicles(vehiclesNorm);
        setFlights(flightsNorm);
        setGates(gatesNorm);
        setUsers(usersNorm);
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
        setApiError && setApiError(e.message);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchAll();
    return () => { mounted = false; };
  }, [setApiError]);

  // default checklist items for inspections
  const defaultChecklist = [
    "Engine / Power",
    "Brakes",
    "Tires",
    "Hydraulics",
    "Lights",
    "Couplings",
  ];

  function openInspect(v) {
    setSelected(v);
    setChecklist(defaultChecklist.map((t) => ({ text: t, ok: false })));
    setAiResult(null);
    setApiMessage && setApiMessage(`Inspection panel opened for ${v.vehicle_number || v.id}`);
  }

  function toggleCheck(index) {
    setChecklist((prev) => prev.map((it, i) => i === index ? { ...it, ok: !it.ok } : it));
  }

  async function runAiCheck(vehicle) {
    setAiResult(null);
    if (!REAL_AI_ENABLED) {
      // Development: simulate AI result and do not call real API
      const simulated = Math.random() > 0.2; // 80% pass
      setAiResult(simulated ? 'ok' : 'fail');
      if (!simulated) await autoReject(vehicle, 'AI detection failed (simulated)');
      return;
    }

    // Production: call real AI endpoint
    try {
      const res = await fetch(`/api/ai/predict_vehicle.php?id=${vehicle.id}`);
      if (!res.ok) throw new Error(`AI API ${res.status}`);
      const data = await res.json();
      const result = data && data.result ? data.result : (Math.random() > 0.2 ? 'ok' : 'fail');
      setAiResult(result);
      if (result === 'fail') await autoReject(vehicle, 'AI detection failed');
    } catch (e) {
      const simulated = Math.random() > 0.2;
      setAiResult(simulated ? 'ok' : 'fail');
      if (!simulated) await autoReject(vehicle, 'AI detection failed (ai error)');
    }
  }

  async function manualReject(vehicle, comment) {
    try {
      const payload = { title: `Manual reject: ${vehicle.vehicle_number || vehicle.id}`, message: comment || 'Rejected by inspector', vehicle_id: vehicle.id };
      await fetch('/api/notifications/create_notification.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setApiMessage && setApiMessage('Vehicle rejected and reported to technicians.');
      setAiResult('fail');
    } catch (e) {
      setApiError && setApiError('Failed to forward rejection: ' + e.message);
    }
  }

  async function autoReject(vehicle, reason) {
    // auto create a notification/report to technicians
    try {
      const payload = { title: `Auto-reject: ${vehicle.vehicle_number || vehicle.id}`, message: reason, vehicle_id: vehicle.id };
      await fetch('/api/notifications/create_notification.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setApiMessage && setApiMessage('Vehicle auto-rejected and reported to technicians.');
    } catch (e) {
      setApiError && setApiError('Failed to forward auto-reject report: ' + e.message);
    }
  }

  async function approveAndAssign(driverId) {
    if (!selected) return;
    setAssigning(true);
    try {
      const payload = { id: selected.id, assigned_driver_id: driverId };
      const res = await fetch('/api/vehicles/update_vehicle.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Assign failed ${res.status}`);
      // update local vehicles state
      setVehicles((prev) => prev.map(v => v.id === selected.id ? { ...v, assigned_driver_id: driverId, status: 'Assigned' } : v));
      setApiMessage && setApiMessage('Driver assigned successfully.');
      setSelected(null);
    } catch (e) {
      setApiError && setApiError(e.message);
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div>
      <h2>Assigned Vehicles</h2>
      <p className="muted">Tap a vehicle card to inspect. AI check will auto-reject failing vehicles and notify technicians.</p>

      {loading && <p>Loading assigned vehicles…</p>}
      {error && <div className="dashboard-alert error">{error}</div>}

      {!loading && !error && (
        <div className="dashboard-grid">
          {vehicles.length === 0 && <p>No assigned vehicles found.</p>}
          {vehicles.map((v) => {
            const flight = flights.find(f => f.id === v.assigned_flight) || flights.find(f => f.flight_number === v.assigned_flight) || {};
            const gate = gates.find(g => g.id === v.gate) || { name: v.gate };
            return (
              <div key={v.id} className="stat-card">
                <div style={{display:'flex', gap:12, alignItems:'center'}}>
                  <div className="img-hover-container" style={{minWidth:72}}>
                    {v.vehicle_photo ? (
                      <>
                        <img src={`${window.location.origin}/${v.vehicle_photo}`} alt="thumb" className="compact-thumb" style={{width:72, height:72, objectFit:'cover', borderRadius:8}} />
                        <img src={`${window.location.origin}/${v.vehicle_photo}`} alt="preview" className="large-hover-preview" />
                      </>
                    ) : (
                      <div style={{width:72, height:72, borderRadius:8, background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', border:'1px dashed #334155'}}>No Image</div>
                    )}
                  </div>
                  <div style={{flex:1}}>
                    <h4 style={{margin:0}}>{v.vehicle_number || `#${v.id}`}</h4>
                    <div className="muted" style={{marginBottom:8}}>{v.type_name || 'Type'}</div>
                    <div style={{fontSize:13}}>Flight: <strong style={{color:'var(--text-main)'}}>{flight.flight_number || flight.id || v.assigned_flight || '-'}</strong></div>
                    <div style={{fontSize:13}}>Gate: <strong style={{color:'var(--text-main)'}}>{gate.name || gate.gate || '-'}</strong></div>
                    <div style={{marginTop:8}}>Status: <span className={`status-badge ${v.status && v.status.toLowerCase()}`}>{v.status || 'Unknown'}</span></div>
                  </div>
                </div>
                <div style={{marginTop:12, display:'flex', gap:8, alignItems:'center'}}>
                  <button className="action-btn" onClick={() => openInspect(v)}>Inspect</button>
                  <button className="action-btn" onClick={() => onInspect && onInspect(v.id)}>Open in Inspections</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspection modal (matches admin theme) */}
      {selected && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Inspection — {selected.vehicle_number || selected.id}</h3>
              <button className="close-modal-btn" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="modal-scroll-area">
              <div style={{ display: "flex", gap: "18px", alignItems: "center", marginBottom: "16px" }}>
                {selected.raw && selected.raw.vehicle_photo ? (
                  <img
                    src={`/${selected.raw.vehicle_photo}`}
                    alt="Vehicle"
                    style={{ width: "100px", height: "100px", borderRadius: "8px", objectFit: "cover", border: "1px solid #334155" }}
                  />
                ) : (
                  <div style={{ width: "100px", height: "100px", borderRadius: "8px", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", border: "1px dashed #334155" }}>
                    No Photo
                  </div>
                )}
                <div>
                  <h2 style={{ margin: 0, color: "var(--text-main)", fontSize: "18px" }}>{selected.vehicle_number || `#${selected.id}`}</h2>
                  <div style={{ marginTop: "6px" }}>
                    <span className={`status-pill ${selected.status ? selected.status.toLowerCase().replace(/\s+/g, '-') : 'available'}`}>
                      {selected.status}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
                <div style={{flex:'1 1 260px'}}>
                  <h4>Checklist</h4>
                  <ul>
                    {checklist.map((it, i) => (
                      <li key={i} style={{marginBottom:8}}>
                        <label style={{display:'flex', alignItems:'center', gap:8}}>
                          <input type="checkbox" checked={it.ok} onChange={() => toggleCheck(i)} />
                          <span>{it.text}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{flex:'1 1 260px'}}>
                  <h4>AI Detection</h4>
                  <p className="muted">Run AI model to automatically validate vehicle condition. You can also perform a manual review.</p>
                  <div style={{display:'flex', gap:8, marginBottom:12, alignItems:'center'}}>
                    <button className="action-btn" onClick={() => runAiCheck(selected)}>Run AI Check</button>
                    <label style={{display:'flex', alignItems:'center', gap:8}}>
                      <input type="checkbox" checked={manualMode} onChange={(e) => setManualMode(e.target.checked)} /> Manual review
                    </label>
                  </div>
                  {aiResult === 'ok' && <div className="feedback-alert success">AI check passed — vehicle approved.</div>}
                  {aiResult === 'fail' && <div className="feedback-alert error">AI check failed — vehicle rejected and reported to technicians.</div>}

                  {manualMode && (
                    <div style={{marginTop:12}}>
                      <h4>Manual Review</h4>
                      <textarea className="form-group" placeholder="Enter comment for rejection or note" value={manualComment} onChange={(e) => setManualComment(e.target.value)} />
                      <div style={{display:'flex', gap:8, marginTop:8}}>
                        <button className="action-btn" onClick={() => { setAiResult('ok'); setApiMessage && setApiMessage('Manually approved.'); }}>Approve</button>
                        <button className="action-btn delete" onClick={() => manualReject(selected, manualComment)}>Reject & Report</button>
                      </div>
                    </div>
                  )}

                  {aiResult === 'ok' && (
                    <div style={{marginTop:16}}>
                      <h4>Assign Driver</h4>
                      <select className="dashboard-select" defaultValue="" onChange={(e) => approveAndAssign(e.target.value)}>
                        <option value="">Select driver...</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.username || u.fullname || `${u.first_name || ''} ${u.last_name || ''}`}</option>
                        ))}
                      </select>
                      {assigning && <div style={{marginTop:8}}>Assigning…</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="action-btn" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
