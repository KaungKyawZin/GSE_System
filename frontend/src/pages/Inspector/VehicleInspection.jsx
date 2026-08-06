import React, { useState } from "react";

export default function VehicleInspectionView({ selectedJob, setApiMessage, setApiError }) {
  // Vehicle Info State
  const [vehicleInfo, setVehicleInfo] = useState(selectedJob || {
    vehicle_id: "GSE-104", type: "Baggage Tractor", plate_no: "BGG-8821", gate: "Gate 04", flight: "SQ-702"
  });

  // Physical Checklist State
  const [checklist, setChecklist] = useState({
    Tire: false, Brake: false, Engine: false, Battery: false, Fuel: false, Lights: false, Safety: false
  });

  // Image Upload State
  const [photos, setPhotos] = useState({ front: null, rear: null, left: null, right: null, damage: null });

  // AI State
  const [aiResult, setAiResult] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleChecklistToggle = (item) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleFileChange = (angle, file) => {
    setPhotos(prev => ({ ...prev, [angle]: file }));
  };

  // Run AI Prediction Call
  const runAiPrediction = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch(`http://localhost:8000/api/ai/predict.php?vehicle_id=${vehicleInfo.vehicle_id}`);
      const data = await res.json();
      if (data.success) {
        setAiResult(data.prediction); // Expects: confidence, detected_issue, recommendation, status
      }
    } catch (err) {
      setApiError("AI diagnosis model timeout.");
    } finally {
      setLoadingAi(false);
    }
  };

  // Submit Final Decision (Approve / Reject)
  const handleDecision = async (decision) => {
    const formData = new FormData();
    formData.append("vehicle_id", vehicleInfo.vehicle_id);
    formData.append("decision", decision); // 'Approve' or 'Reject'
    formData.append("checklist", JSON.stringify(checklist));
    formData.append("ai_result", JSON.stringify(aiResult));
    
    Object.keys(photos).forEach(key => {
      if (photos[key]) formData.append(`photo_${key}`, photos[key]);
    });

    try {
      const res = await fetch("http://localhost:8000/api/inspections/submit.php", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setApiMessage(`Inspection finalized with decision: ${decision}`);
      } else {
        setApiError(data.message || "Failed to complete inspection.");
      }
    } catch (err) {
      setApiError("Server upload failed.");
    }
  };

  return (
    <div style={{ background: "#1e1e1e", padding: "20px", borderRadius: "8px" }}>
      <h3>🔍 Vehicle Inspection Workflow</h3>

      {/* 1. Vehicle Info Section */}
      <div style={{ background: "#2a2a2a", padding: "12px", borderRadius: "6px", margin: "16px 0" }}>
        <h4>Vehicle Information</h4>
        <p><strong>Vehicle ID:</strong> {vehicleInfo.vehicle_id} | <strong>Type:</strong> {vehicleInfo.type} | <strong>Plate:</strong> {vehicleInfo.plate_no}</p>
        <p><strong>Gate:</strong> {vehicleInfo.gate} | <strong>Flight:</strong> {vehicleInfo.flight}</p>
      </div>

      {/* 2. Checklist Section */}
      <div style={{ margin: "16px 0" }}>
        <h4>Safety Checklist</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "8px" }}>
          {Object.keys(checklist).map((item) => (
            <label key={item} style={{ display: "flex", gap: "6px", cursor: "pointer" }}>
              <input type="checkbox" checked={checklist[item]} onChange={() => handleChecklistToggle(item)} />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* 3. Upload Section */}
      <div style={{ margin: "16px 0" }}>
        <h4>Inspection Photos Upload</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginTop: "8px" }}>
          {["front", "rear", "left", "right", "damage"].map((angle) => (
            <div key={angle} style={{ background: "#2a2a2a", padding: "10px", borderRadius: "4px" }}>
              <small style={{ textTransform: "capitalize" }}>{angle} Photo</small>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(angle, e.target.files[0])} style={{ width: "100%", fontSize: "11px" }} />
            </div>
          ))}
        </div>
      </div>

      {/* 4. AI Prediction Section */}
      <div style={{ background: "#252525", padding: "16px", borderRadius: "6px", margin: "16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>🤖 AI Predictive Diagnostic</h4>
          <button onClick={runAiPrediction} style={{ background: "#0288d1", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "4px" }}>
            {loadingAi ? "Running Analysis..." : "Run AI Prediction"}
          </button>
        </div>

        {aiResult && (
          <div style={{ marginTop: "12px", borderTop: "1px solid #444", paddingTop: "12px" }}>
            <p><strong>Confidence:</strong> {aiResult.confidence}%</p>
            <p><strong>Detected Issue:</strong> {aiResult.detected_issue}</p>
            <p><strong>Recommendation:</strong> {aiResult.recommendation}</p>
            <p><strong>AI Status:</strong> <span style={{ color: aiResult.status === "Pass" ? "#81c784" : "#e57373" }}>{aiResult.status}</span></p>
          </div>
        )}
      </div>

      {/* 5. Decision Section */}
      <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
        <button style={{ flex: 1, padding: "14px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold" }} onClick={() => handleDecision("Approve")}>
          ✅ Approve Vehicle
        </button>
        <button style={{ flex: 1, padding: "14px", background: "#c62828", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold" }} onClick={() => handleDecision("Reject")}>
          ❌ Reject / Issue Alert
        </button>
      </div>
    </div>
  );
}