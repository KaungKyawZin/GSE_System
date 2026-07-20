import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css"; // Uses our dark palette definitions

function AdminDashboard() {
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState("Admin");

    // Sample local state data for GSE tracking tables
    const [equipment, setEquipment] = useState([
        { id: "GSE-101", name: "Baggage Tow Tractor", status: "Active", fuel: "85%", lastCheck: "Today" },
        { id: "GSE-204", name: "Belt Loader", status: "Maintenance", fuel: "40%", lastCheck: "Yesterday" },
        { id: "GSE-309", name: "Pushback Tractor", status: "Active", fuel: "92%", lastCheck: "Today" },
        { id: "GSE-402", name: "Air Start Unit", status: "Standby", fuel: "65%", lastCheck: "3 days ago" },
    ]);

    // Secure screen entry verification checking localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("username");
        if (storedUser) {
            setAdminName(storedUser);
        }
    }, []);

    // Session log out wiping system tracking keys
    const handleLogout = () => {
        localStorage.removeItem("user_id");
        localStorage.removeItem("username");
        navigate("/");
    };

    return (
        <div className="admin-container">
            {/* 1. Dashboard Sidebar Navigation */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>GSE Control Panel</h3>
                </div>
                <nav className="sidebar-menu">
                    <a href="#overview" className="active">📊 System Overview</a>
                    <a href="#equipment">🚜 Equipment List</a>
                    <a href="#users">👥 Manage Accounts</a>
                    <a href="#reports">📈 Analytics Logs</a>
                </nav>
                <button onClick={handleLogout} className="btn-logout">
                    🚪 Sign Out
                </button>
            </aside>

            {/* 2. Main Content Canvas */}
            <main className="admin-content">
                <header className="content-header">
                    <div>
                        <h1>System Dashboard</h1>
                        <p className="welcome-text">Welcome back, <strong>{adminName}</strong></p>
                    </div>
                    <div className="system-status-indicator">
                        <span className="dot online"></span> System Live
                    </div>
                </header>

                {/* 3. Analytical Overview Metric Grid */}
                <section className="metrics-grid">
                    <div className="metric-card">
                        <span className="metric-label">Total Assets</span>
                        <h2 className="metric-value">48 Units</h2>
                    </div>
                    <div className="metric-card active-gse">
                        <span className="metric-label">In Service</span>
                        <h2 className="metric-value">36 Fleet</h2>
                    </div>
                    <div className="metric-card warning-gse">
                        <span className="metric-label">In Workshop</span>
                        <h2 className="metric-value">8 Alerts</h2>
                    </div>
                </section>

                {/* 4. Equipment Management Data Table */}
                <section className="table-section">
                    <div className="section-title">
                        <h3>GSE Deployment Status</h3>
                    </div>
                    <div className="responsive-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Asset ID</th>
                                    <th>Equipment Name</th>
                                    <th>Operational Status</th>
                                    <th>Fuel/Charge</th>
                                    <th>Last Inspected</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipment.map((item) => (
                                    <tr key={item.id}>
                                        <td><code>{item.id}</code></td>
                                        <td><strong>{item.name}</strong></td>
                                        <td>
                                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>{item.fuel}</td>
                                        <td>{item.lastCheck}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;
