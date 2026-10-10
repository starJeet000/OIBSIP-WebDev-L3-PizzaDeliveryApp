import React, { useState } from "react";
import api from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({
    message: "",
    error: "",
    loading: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", error: "", loading: true });

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setStatus({ message: response.data.message, error: "", loading: false });
    } catch (error) {
      setStatus({
        message: "",
        error: error.response?.data?.message || "Something went wrong",
        loading: false,
      });
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Forgot Password</h2>
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
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <button
          type="submit"
          disabled={status.loading}
          style={{ width: "100%", padding: "10px" }}
        >
          {status.loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
