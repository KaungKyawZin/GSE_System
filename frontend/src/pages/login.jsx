import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Automatically redirect authenticated users
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
        setMessage("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success && result.data) {
                setMessage("Login Success! Redirecting...");
                const user = result.data; 
                
                sessionStorage.setItem("user_id", user.user_id);
                sessionStorage.setItem("username", user.username);
                sessionStorage.setItem("role_id", user.role_id);

                setTimeout(() => {
                    redirectUserByRole(parseInt(user.role_id, 10));
                }, 600);
            } else {
                setMessage(result.message || "Invalid credentials");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Login Navigation Error:", error);
            setMessage("Server Connection Error");
            setIsLoading(false);
        }
    };

    return (
        <div className="login-screen-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <div className="brand-badge">🛠️</div>
                    <h2>GSE Smart System</h2>
                    <p className="login-subtitle">Sign in to access your dashboard</p>
                </div>

                {message && (
                    <div className={`feedback-alert ${message.includes("Success") ? "success" : "error"}`}>
                        {message.includes("Success") ? "✓ " : "⚠️ "}{message}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="login-username">Username</label>
                        <input
                            id="login-username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex="-1"
                            >
                                {showPassword ? "👁️" : "🙈"}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-login" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="btn-spinner-container">
                                <span className="spinner"></span> Signing In...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;