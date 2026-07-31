import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

import SystemOverview from "./SystemOverview";
//import ManageVehicle from "./ManageVehicle";
//import ManageGate from "./manageAirportGates";
//import ManageFlight from "./manageFlights";

function DriverDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [apiMessage, setApiMessageState] = useState("");
    const [apiError, setApiErrorState] = useState("");

    const showMessage = (msg) => {
        setApiMessageState(msg);
        if (msg) setTimeout(() => setApiMessageState(""), 2000);
    };

    const showError = (err) => {
        setApiErrorState(err);
        if (err) setTimeout(() => setApiErrorState(""), 2000);
    };

    const [currentUser, setCurrentUser] = useState({
        username: "",   
        roleName: "Driver"
    });

    useEffect(() => {
        const userId = sessionStorage.getItem("user_id");
        const roleId = sessionStorage.getItem("role_id");
        const username = sessionStorage.getItem("username");

        
        if (!userId || parseInt(roleId, 10) !== 6) {
            sessionStorage.clear();
            navigate("/", { replace: true });
        } else {
            setCurrentUser({
                username: username || "Driver",
                roleName: "Driver"
            });
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/", { replace: true });
    };

    return (
        <div className="admin-container">
            
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>🔍 GSE Smart System</h3>
                </div>
                <div className="sidebar-menu">
                    <button 
                        className={activeTab === "overview" ? "active" : ""} 
                        onClick={() => setActiveTab("overview")}
                    >
                        📊 Overview & Status
                    </button>
                    <button 
                        className={activeTab === "vehicles" ? "active" : ""} 
                        onClick={() => setActiveTab("vehicles")}
                    >
                        🚜 Inspect Vehicles
                    </button>
                    <button 
                        className={activeTab === "flights" ? "active" : ""} 
                        onClick={() => setActiveTab("flights")}
                    >
                        ✈️ Flight Schedule
                    </button>
                    <button 
                        className={activeTab === "gates" ? "active" : ""} 
                        onClick={() => setActiveTab("gates")}
                    >
                        🚧 Gate Operations
                    </button>
                </div>

                <button className="btn-logout" onClick={handleLogout}>
                    🚪 Logout
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="admin-content">
                <header className="content-header">
                    <div>
                        <h1>Driver Dashboard</h1>
                        <p className="welcome-text">Monitor equipment health and manage ground operations</p>
                    </div>

                    <div className="user-profile-badge">
                        <div className="user-avatar">
                            {(currentUser.username || "I").charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{currentUser.username || "Driver"}</div>
                            <div className="user-role">{currentUser.roleName}</div>
                        </div>
                    </div>
                </header>

                {/* Status Messages */}
                {apiMessage && <div className="dashboard-alert success">{apiMessage}</div>}
                {apiError && <div className="dashboard-alert error">{apiError}</div>}

                {/* Content Views */}
                <div className="table-section">
                    {activeTab === "overview" && (
                        <SystemOverview setApiMessage={showMessage} setApiError={showError} />
                    )}

                    {activeTab === "vehicles" && (
                        <ManageVehicle setApiMessage={showMessage} setApiError={showError} />
                    )}

                    {activeTab === "flights" && (
                        <ManageFlight setApiMessage={showMessage} setApiError={showError} />
                    )}

                    {activeTab === "gates" && (
                        <ManageGate setApiMessage={showMessage} setApiError={showError} />
                    )}
                </div>
            </main>
        </div>
    );
}

export default DriverDashboard;