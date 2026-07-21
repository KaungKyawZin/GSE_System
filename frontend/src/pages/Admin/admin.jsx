import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import ManageUser from "./manageUser";
import ManageRole from "./manageRole";
//import CreateVehicle from "./CreateVehicle";
//import SystemOverview from "./SystemOverview";

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [apiMessage, setApiMessage] = useState("");
    const [apiError, setApiError] = useState("");

    // PROTECTION: Bounce unauthorized direct URL entry out
    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        const roleId = localStorage.getItem("role_id");

      
        if (!userId || parseInt(roleId, 10) !== 1) {
            localStorage.clear(); 
            navigate("/", { replace: true });
        }
    }, [navigate]);

   
    const handleLogout = () => {
        localStorage.clear(); 
        navigate("/", { replace: true }); 
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="sidebar-header"><h3>🛠️ GSE System</h3></div>
                <div className="sidebar-menu">
                    <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>📊 Overview</button>
                    <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>👥 Users</button>
                    <button className={activeTab === "roles" ? "active" : ""} onClick={() => setActiveTab("roles")}>👥 Manage Roles</button>
                    <button className={activeTab === "vehicles" ? "active" : ""} onClick={() => setActiveTab("vehicles")}>🚜 Vehicles</button>
                </div>
                
             
                <button className="btn-logout" onClick={handleLogout}>
                    🚪 Logout
                </button>
            </aside>
            
           <main className="admin-content">
    <header className="content-header">
        <div>
            <h1>Admin Dashboard</h1>
            <p className="welcome-text">Manage your system configurations and operations</p>
        </div>
        <div className="system-status-indicator">
            <span className="dot online"></span> System Live
        </div>
    </header>

    {apiMessage && <div className="dashboard-alert success">{apiMessage}</div>}
    {apiError && <div className="dashboard-alert error">{apiError}</div>}

    {/* Form target section boundary */}
    <div className="table-section">
        {activeTab === "overview" && <div><h3>📊 Overview Context Panel</h3></div>}
        
        {/* Users view triggers here */}
        {activeTab === "users" && (
            <ManageUser setApiMessage={setApiMessage} setApiError={setApiError} />
        )}
          {activeTab === "roles" && (
            <ManageRole setApiMessage={setApiMessage} setApiError={setApiError} />
        )}
        
        {activeTab === "vehicles" && <div><h3>🚜 Vehicles Management</h3></div>}
    </div>
</main>
        </div>
    );
}

export default AdminDashboard;