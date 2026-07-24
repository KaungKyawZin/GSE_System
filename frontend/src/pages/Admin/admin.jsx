import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import ManageUser from "./manageUser";
import ManageRole from "./manageRole";
import SystemOverview from "./SystemOverview";

function AdminDashboard() {
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
        roleName: "Administrator"
    });

    useEffect(() => {
        // Changed from localStorage to sessionStorage
        const userId = sessionStorage.getItem("user_id");
        const roleId = sessionStorage.getItem("role_id");
        const username = sessionStorage.getItem("username");

        // Redirects to Login if a new tab is opened without an active tab session
        if (!userId || parseInt(roleId, 10) !== 1) {
            sessionStorage.clear(); 
            navigate("/", { replace: true });
        } else {
            setCurrentUser({
                username: username || "Admin",
                roleName: "Administrator"
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
                    <h3>🛠️ GSE Smart System</h3>
                </div>
                <div className="sidebar-menu">
                    <button className={activeTab === "SystemOverview" ? "active" : ""} onClick={() => setActiveTab("SystemOverview")}>📊 System Overview</button>
                    <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>👥 Manage Users</button>
                    <button className={activeTab === "roles" ? "active" : ""} onClick={() => setActiveTab("roles")}>🛡️ Manage Roles</button>
                    <button className={activeTab === "vehicles" ? "active" : ""} onClick={() => setActiveTab("vehicles")}>🚜 Manage Vehicles</button>
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

                    <div className="user-profile-badge">
                        <div className="user-avatar">
                            {currentUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{currentUser.username}</div>
                            <div className="user-role">{currentUser.roleName}</div>
                        </div>
                    </div>
                </header>

                {apiMessage && <div className="dashboard-alert success">{apiMessage}</div>}
                {apiError && <div className="dashboard-alert error">{apiError}</div>}

                <div className="table-section">
                    {activeTab === "SystemOverview" && (
                        <SystemOverview setApiMessage={showMessage} setApiError={showError}/>
                    )}
                    
                    {activeTab === "users" && (
                        <ManageUser setApiMessage={showMessage} setApiError={showError} />
                    )}

                    {activeTab === "roles" && (
                        <ManageRole setApiMessage={showMessage} setApiError={showError} />
                    )}
                    
                    {activeTab === "vehicles" && <div><h3>🚜 Vehicles Management</h3></div>}
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;