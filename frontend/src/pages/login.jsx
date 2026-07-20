import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    // Automatically boot authenticated users out of login back to their respective landing zone
    useEffect(() => {
        const storedRoleId = localStorage.getItem("role_id");
        if (storedRoleId) {
            redirectUserByRole(parseInt(storedRoleId, 10));
        }
    }, []);

    const redirectUserByRole = (roleId) => {
        if (roleId === 1) navigate("/admin");
        else if (roleId === 3) navigate("/supervisor");
        else if (roleId === 4) navigate("/inspector");
        else if (roleId === 5) navigate("/technician");
        else if (roleId === 6) navigate("/driver");
        else navigate("/dashboard");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/api/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success && result.data) {
                setMessage("Login Success");
                const user = result.data; 
                
                // Keep tokens and security items inside storage
                localStorage.setItem("user_id", user.user_id);
                localStorage.setItem("username", user.username);
                localStorage.setItem("role_id", user.role_id); // Save role for verification check

                const roleId = parseInt(user.role_id, 10); 
                redirectUserByRole(roleId);
            } else {
                setMessage(result.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login Navigation Error:", error);
            setMessage("Server Error");
        }
    };

    return (
        <div className="login-screen-wrapper">
            <div className="login-card">
                <h2>GSE Smart System</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-login">Login</button>
                </form>

                {message && (
                    <p className={`feedback-msg ${message.includes("Success") ? "success" : "error"}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;