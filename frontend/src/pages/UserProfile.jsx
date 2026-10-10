import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const UserProfile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: { street: "", city: "", postalCode: "" },
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState({ message: "", error: "" });
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Password Change States
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdStatus, setPwdStatus] = useState({ message: "", error: "" });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setUser({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || { street: "", city: "", postalCode: "" },
        });
        setOrders(data.orders || []);
      } catch (error) {
        setStatus({ error: "Failed to load profile data", message: "" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/users/profile", {
        name: user.name,
        phone: user.phone,
        address: user.address,
      });
      setUser({ ...user, ...data.user });
      setIsEditing(false);
      setStatus({ message: "Profile updated successfully!", error: "" });

      // Update local storage name
      const storedUser = JSON.parse(
        localStorage.getItem("user") || sessionStorage.getItem("user"),
      );
      if (storedUser) {
        storedUser.name = data.user.name;
        localStorage.getItem("token")
          ? localStorage.setItem("user", JSON.stringify(storedUser))
          : sessionStorage.setItem("user", JSON.stringify(storedUser));
      }
    } catch (error) {
      setStatus({
        error: error.response?.data?.message || "Update failed",
        message: "",
      });
    }
  };

  // Handle Password Change[cite: 1]
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPwdStatus({ error: "New passwords do not match", message: "" });
    }
    try {
      await api.put("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPwdStatus({ message: "Password updated successfully!", error: "" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPwdStatus({
        error: error.response?.data?.message || "Password update failed",
        message: "",
      });
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        Loading profile...
      </div>
    );

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        gap: "30px",
      }}
    >
      {/* LEFT COLUMN: Profile & Password */}
      <div>
        {/* Profile Details Section[cite: 1] */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #eaeaea",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2 style={{ margin: 0 }}>Profile Details</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                background: "none",
                border: "none",
                color: "#1890ff",
                cursor: "pointer",
              }}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {status.message && (
            <div style={{ color: "green", marginBottom: "10px" }}>
              {status.message}
            </div>
          )}
          {status.error && (
            <div style={{ color: "red", marginBottom: "10px" }}>
              {status.error}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div style={{ marginBottom: "10px" }}>
              <label>Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Email (Cannot be changed)</label>
              <input
                type="email"
                disabled
                value={user.email}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  backgroundColor: "#f5f5f5",
                }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Phone</label>
              <input
                type="text"
                disabled={!isEditing}
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>

            <h4 style={{ marginTop: "15px", marginBottom: "5px" }}>
              Delivery Address
            </h4>
            <div style={{ marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="Street"
                disabled={!isEditing}
                value={user.address.street}
                onChange={(e) =>
                  setUser({
                    ...user,
                    address: { ...user.address, street: e.target.value },
                  })
                }
                style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="City"
                  disabled={!isEditing}
                  value={user.address.city}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, city: e.target.value },
                    })
                  }
                  style={{ width: "50%", padding: "8px" }}
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  disabled={!isEditing}
                  value={user.address.postalCode}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      address: { ...user.address, postalCode: e.target.value },
                    })
                  }
                  style={{ width: "50%", padding: "8px" }}
                />
              </div>
            </div>

            {isEditing && (
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#ff4d4f",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Save Changes
              </button>
            )}
          </form>
        </div>

        {/* Change Password Section[cite: 1] */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #eaeaea",
          }}
        >
          <h2 style={{ margin: "0 0 15px 0" }}>Change Password</h2>

          {pwdStatus.message && (
            <div style={{ color: "green", marginBottom: "10px" }}>
              {pwdStatus.message}
            </div>
          )}
          {pwdStatus.error && (
            <div style={{ color: "red", marginBottom: "10px" }}>
              {pwdStatus.error}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Current Password"
              required
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <input
              type="password"
              placeholder="New Password"
              required
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#333",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Order History */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #eaeaea",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0" }}>Order History</h2>

        {orders.length === 0 ? (
          <p style={{ color: "#666" }}>
            You haven't placed any orders yet.{" "}
            <Link to="/dashboard">Order now!</Link>
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {orders.map((order) => (
              <div
                key={order._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  padding: "15px",
                }}
              >
                {/* Order Summary: Order ID, Date, Total Amount, Status[cite: 1] */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: "bold" }}>
                      {order.orderId || order._id.substring(0, 8).toUpperCase()}
                    </span>
                    <span
                      style={{
                        color: "#666",
                        fontSize: "14px",
                        marginLeft: "10px",
                      }}
                    >
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "bold", color: "#ff4d4f" }}>
                      ₹{order.pricing?.grandTotal || 0}
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        backgroundColor:
                          order.status === "Delivered" ? "#f6ffed" : "#e6f7ff",
                        color:
                          order.status === "Delivered" ? "#52c41a" : "#1890ff",
                        border: `1px solid ${order.status === "Delivered" ? "#b7eb8f" : "#91d5ff"}`,
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* View Order Details Toggle[cite: 1] */}
                <button
                  onClick={() =>
                    setExpandedOrderId(
                      expandedOrderId === order._id ? null : order._id,
                    )
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1890ff",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "14px",
                  }}
                >
                  {expandedOrderId === order._id
                    ? "Hide Details"
                    : "View Details"}
                </button>

                {/* Expanded Order Details[cite: 1] */}
                {expandedOrderId === order._id && (
                  <div
                    style={{
                      marginTop: "15px",
                      paddingTop: "15px",
                      borderTop: "1px dashed #ddd",
                      fontSize: "14px",
                    }}
                  >
                    <h5 style={{ margin: "0 0 10px 0" }}>Items:</h5>
                    <ul
                      style={{
                        margin: "0 0 15px 0",
                        paddingLeft: "20px",
                        color: "#555",
                      }}
                    >
                      {order.items?.map((item, index) => (
                        <li key={index}>
                          {item.quantity}x {item.pizzaType} (₹{item.totalPrice})
                        </li>
                      )) || <li>No item details available</li>}
                    </ul>
                    <h5 style={{ margin: "0 0 5px 0" }}>Delivery To:</h5>
                    <p style={{ margin: 0, color: "#555" }}>
                      {order.deliveryAddress?.street || "N/A"},{" "}
                      {order.deliveryAddress?.city || ""}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
