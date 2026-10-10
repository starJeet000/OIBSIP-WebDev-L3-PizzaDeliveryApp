import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState({
    error: "",
    success: "",
    loading: false,
  });

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user types
    setStatus({ ...status, error: "", success: "" });
  };

  // Password strength logic
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculateStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "#ff4d4f",
    "#ff4d4f",
    "#faad14",
    "#1890ff",
    "#52c41a",
  ];

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      return "All fields are required."; // Form validation: no empty fields[cite: 1]
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address."; // Email format check[cite: 1]
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters."; // Min 8 chars check[cite: 1]
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      return setStatus({ ...status, error: validationError });
    }

    setStatus({ ...status, loading: true });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
        },
      );

      setStatus({
        error: "",
        success: "Registration successful! Check email to verify.", // Exact success message requirement[cite: 1]
        loading: false,
      });

      // Clear form on success
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (error) {
      // Handles duplicate email check with error message from backend[cite: 1]
      setStatus({
        error:
          error.response?.data?.message ||
          "An error occurred during registration",
        success: "",
        loading: false,
      });
    }
  };

  return (
    <div
      className="register-container"
      style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}
    >
      <h2>Create an Account</h2>

      {status.error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{status.error}</div>
      )}
      {status.success && (
        <div style={{ color: "green", marginBottom: "10px" }}>
          {status.success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Email</label>
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
          {/* Password strength indicator (visual feedback)[cite: 1] */}
          {password && (
            <div style={{ marginTop: "8px" }}>
              <div
                style={{
                  display: "flex",
                  height: "5px",
                  gap: "2px",
                  marginBottom: "5px",
                }}
              >
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      backgroundColor:
                        i < strengthScore
                          ? strengthColors[strengthScore]
                          : "#e8e8e8",
                      transition: "background-color 0.3s",
                    }}
                  />
                ))}
              </div>
              <small style={{ color: strengthColors[strengthScore] }}>
                Strength: {strengthLabels[strengthScore]}
              </small>
            </div>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
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
          {status.loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p style={{ marginTop: "15px", textAlign: "center" }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default RegisterForm;
