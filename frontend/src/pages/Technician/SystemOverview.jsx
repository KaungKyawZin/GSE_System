import React, { useState, useEffect } from "react";

function SystemOverview() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRoles: 0,
        activeUsers: 0,
        inactiveUsers: 0
    });

    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        fetchSystemOverviewData();
    }, []);

    // Clean API call without any AI prediction calls
    const fetchSystemOverviewData = async () => {
        try {
            setLoadingStats(true);
            const [usersRes, rolesRes] = await Promise.all([
                fetch("http://localhost:8000/api/users/get_user.php"),
                fetch("http://localhost:8000/api/roles/get_role.php")
            ]);

            const usersData = await usersRes.json();
            const rolesData = await rolesRes.json();

            const userList = Array.isArray(usersData.data) ? usersData.data : [];
            const roleList = Array.isArray(rolesData.data) ? rolesData.data : [];

            const active = userList.filter(
                (u) => u.status === "Active" || u.status === 1 || u.status === "1"
            ).length;

            setStats({
                totalUsers: userList.length,
                totalRoles: roleList.length,
                activeUsers: active,
                inactiveUsers: userList.length - active
            });
        } catch (error) {
            console.error("Error loading overview data:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    if (loadingStats) {
        return <div style={{ color: "var(--text-muted)", padding: "20px" }}>Loading System Telemetry...</div>;
    }

    return (
        <div className="sys-overview-scope">
            <h2>System Overview</h2>

            {/* Metrics Stat Cards */}
            <div className="dashboard-grid">
                <div className="stat-card">
                    <h4>Total Users</h4>
                    <div className="value">{stats.totalUsers}</div>
                </div>
                <div className="stat-card">
                    <h4>Total System Roles</h4>
                    <div className="value">{stats.totalRoles}</div>
                </div>
                <div className="stat-card">
                    <h4>Active Users</h4>
                    <div className="value" style={{ color: "#4ade80" }}>{stats.activeUsers}</div>
                </div>
                <div className="stat-card">
                    <h4>Inactive Users</h4>
                    <div className="value" style={{ color: "#f87171" }}>{stats.inactiveUsers}</div>
                </div>
            </div>

            {/* System Visual Progress Bars */}
            <div className="chart-card">
                <h3>User Account Breakdown</h3>
                <div className="bar-group">
                    <div className="bar-label-group">
                        <span>Active Accounts</span>
                        <span>
                            {stats.activeUsers} ({stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%)
                        </span>
                    </div>
                    <div className="bar-track">
                        <div
                            className="bar-fill active"
                            style={{ width: `${stats.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bar-group">
                    <div className="bar-label-group">
                        <span>Inactive Accounts</span>
                        <span>
                            {stats.inactiveUsers} ({stats.totalUsers ? Math.round((stats.inactiveUsers / stats.totalUsers) * 100) : 0}%)
                        </span>
                    </div>
                    <div className="bar-track">
                        <div
                            className="bar-fill inactive"
                            style={{ width: `${stats.totalUsers ? (stats.inactiveUsers / stats.totalUsers) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SystemOverview;