import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const ResetPassword = () => {
  const { token } = useParams(); // Gets the token from the /reset-password/:token route
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState({
    message: "",
    error: "",
    loading: false,
  });

  const validatePassword = (password) => {
    // Password validation: min 8 chars, 1 uppercase, 1 number, 1 special char[cite: 1]
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_=+-]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setStatus({
        error: "Passwords do not match",
        message: "",
        loading: false,
      });
    }

    if (!validatePassword(passwords.newPassword)) {
      return setStatus({
        error:
          "Password must be at least 8 characters long, contain 1 uppercase letter, 1 number, and 1 special character.",
        message: "",
        loading: false,
      });
    }

    setStatus({ message: "", error: "", loading: true });

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword: passwords.newPassword,
      });

      // Confirmation message: "Password reset successful!"[cite: 1]
      setStatus({ message: response.data.message, error: "", loading: false });

      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setStatus({
        message: "",
        error: error.response?.data?.message || "Invalid or expired token",
        loading: false,
      });
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Reset Password</h2>
      {status.error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{status.error}</div>
      )}
      {status.message && (
        <div style={{ color: "green", marginBottom: "10px" }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>New Password</label>
          <input
            type="password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Confirm New Password</label>
          <input
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, confirmPassword: e.target.value })
            }
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <button
          type="submit"
          disabled={status.loading}
          style={{ width: "100%", padding: "10px" }}
        >
          {status.loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
