import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Navigation = () => {
  const navigate = useNavigate();
  const { getCartCount, setIsCartOpen } = useCart(); // Consume cart context

  // Retrieve user data to check auth status and get name
  const userStr =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "15px 30px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Navigation bar: Logo */}
      <div className="logo">
        <Link
          to="/dashboard"
          style={{
            textDecoration: "none",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#ff4d4f",
          }}
        >
          🍕 PizzaDash
        </Link>
      </div>

      <div
        className="nav-links"
        style={{ display: "flex", alignItems: "center", gap: "20px" }}
      >
        {/* Cart icon in navigation bar showing item count */}
        <button
          onClick={() => setIsCartOpen(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            position: "relative",
            fontSize: "20px",
          }}
        >
          🛒
          {getCartCount() > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-8px",
                right: "-12px",
                backgroundColor: "#ff4d4f",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {getCartCount()}
            </span>
          )}
        </button>

        {user ? (
          <>
            {/* Navigation bar: Order History, Profile Menu, Logout */}
            <Link
              to="/orders"
              style={{ textDecoration: "none", color: "#333" }}
            >
              Order History
            </Link>
            <Link
              to="/profile"
              style={{ textDecoration: "none", color: "#333" }}
            >
              Profile
            </Link>

            {user.role === "admin" && (
              <Link
                to="/admin/dashboard"
                style={{
                  textDecoration: "none",
                  color: "#1890ff",
                  fontWeight: "bold",
                }}
              >
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 15px",
                backgroundColor: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: "none", color: "#333" }}>
              Login
            </Link>
            <Link
              to="/register"
              style={{
                textDecoration: "none",
                color: "#ff4d4f",
                fontWeight: "bold",
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
