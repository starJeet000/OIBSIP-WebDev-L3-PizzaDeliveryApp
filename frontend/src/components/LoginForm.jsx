import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false, // Remember Me checkbox (optional)[cite: 1]
  });
  const [status, setStatus] = useState({ error: "", loading: false });
  const navigate = useNavigate();

  const { email, password, rememberMe } = formData;

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setStatus({ ...status, error: "" }); // Clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return setStatus({ error: "Please fill in all fields", loading: false });
    }

    setStatus({ ...status, loading: true });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        },
      );

      // Store token in localStorage/sessionStorage based on remember me[cite: 1]
      const { token, user } = response.data;
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      // Redirect to Dashboard on successful login[cite: 1]
      navigate("/dashboard");
    } catch (error) {
      // Expecting "Invalid credentials" from backend[cite: 1]
      setStatus({
        error: error.response?.data?.message || "Invalid credentials",
        loading: false,
      });
    }
  };

  return (
    <div
      className="login-container"
      style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}
    >
      <h2>Login to Your Account</h2>

      {status.error && (
        <div
          style={{
            color: "red",
            marginBottom: "10px",
            padding: "10px",
            backgroundColor: "#ffe6e6",
            borderRadius: "4px",
          }}
        >
          {status.error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email / Username</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={rememberMe}
              onChange={handleChange}
            />
            Remember Me
          </label>
          {/* Forgot Password link[cite: 1] */}
          <Link
            to="/forgot-password"
            style={{ color: "#1890ff", textDecoration: "none" }}
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={status.loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#ff4d4f",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {status.loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "15px", textAlign: "center" }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginForm;
