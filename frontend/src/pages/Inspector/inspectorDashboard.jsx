import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

import SystemOverview from "./SystemOverview";
import StartInspection from "./StartInspection";
import VehicleInspection from "./VehicleInspection";
import AssignedVehicles from "./AssignedVehicles";
import ScheduleView from "./ScheduleView";
import ReportsView from "./ReportsView";
import NotificationsView from "./NotificationsView";

function InspectorDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("SystemOverview");
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
        roleName: "Inspector"
    });

    useEffect(() => {
        const userId = sessionStorage.getItem("user_id");
        const roleId = sessionStorage.getItem("role_id");
        const username = sessionStorage.getItem("username");

        
        if (!userId || parseInt(roleId, 10) !== 4) {
            sessionStorage.clear();
            navigate("/", { replace: true });
        } else {
            setCurrentUser({
                username: username || "Inspector",
                roleName: "Inspector"
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
                        className={activeTab === "SystemOverview" ? "active" : ""}
                        onClick={() => setActiveTab("SystemOverview")}
                    >
                        📊 Overview
                    </button>
                    <button
                        className={activeTab === "assigned" ? "active" : ""}
                        onClick={() => setActiveTab("assigned")}
                    >
                        🚚 Assigned Vehicles
                    </button>
                    <button
                        className={activeTab === "schedule" ? "active" : ""}
                        onClick={() => setActiveTab("schedule")}
                    >
                        🗓️ Schedule
                    </button>
                    <button
                        className={activeTab === "inspection" ? "active" : ""}
                        onClick={() => setActiveTab("inspection")}
                    >
                        🛠️ Inspections
                    </button>
                    <button
                        className={activeTab === "reports" ? "active" : ""}
                        onClick={() => setActiveTab("reports")}
                    >
                        📁 Reports
                    </button>
                    <button
                        className={activeTab === "notifications" ? "active" : ""}
                        onClick={() => setActiveTab("notifications")}
                    >
                        🔔 Notifications
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
                        <h1>Inspector Dashboard</h1>
                        <p className="welcome-text">Monitor equipment health and manage ground operations</p>
                    </div>

                    <div className="user-profile-badge">
                        <div className="user-avatar">
                            {(currentUser.username || "I").charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{currentUser.username || "Inspector"}</div>
                            <div className="user-role">{currentUser.roleName}</div>
                        </div>
                    </div>
                </header>

                {/* Status Messages */}
                {apiMessage && <div className="dashboard-alert success">{apiMessage}</div>}
                {apiError && <div className="dashboard-alert error">{apiError}</div>}

                {/* Content Views */}
                <div className="table-section">
                    {activeTab === "SystemOverview" && (
                        <SystemOverview setApiMessage={showMessage} setApiError={showError} />
                    )}

                    {activeTab === "assigned" && (
                        <AssignedVehicles setApiMessage={showMessage} setApiError={showError} onInspect={(vehicleId) => { try { sessionStorage.setItem('inspect_vehicle_id', vehicleId); } catch(e){}; setActiveTab('inspection'); }} />
                    )}

                    {activeTab === "schedule" && (
                        <ScheduleView setApiMessage={showMessage} setApiError={showError} onPrepare={(vehicleId) => { try { if(vehicleId) sessionStorage.setItem('inspect_vehicle_id', vehicleId); } catch(e){}; setActiveTab('inspection'); }} />
                    )}

                    {activeTab === "inspection" && (
                        <StartInspection setApiMessage={showMessage} setApiError={showError} />
                    )}

                    {activeTab === "VehicleInspection" && (
                        <VehicleInspection setApiMessage={showMessage} setApiError={showError} />
                    )}

                    {activeTab === "reports" && (
                        <ReportsView setApiMessage={showMessage} setApiError={showError} />
                    )}

                    {activeTab === "notifications" && (
                        <NotificationsView setApiMessage={showMessage} setApiError={showError} />
                    )}
                </div>
            </main>
        </div>
    );
}

export default InspectorDashboard;