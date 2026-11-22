import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount, setIsCartOpen } = useCart();

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userStr =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    textDecoration: "none",
    color: isActive(path) ? "#ff4d4f" : "#333",
    fontWeight: isActive(path) ? "bold" : "normal",
    borderBottom: isActive(path)
      ? "2px solid #ff4d4f"
      : "2px solid transparent",
    paddingBottom: "4px",
  });

  const cartCount = getCartCount();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 24px",
        }}
      >
        {/* Logo */}
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

        {/* Desktop Nav Links */}
        {!isMobile && (
          <div
            className="nav-links"
            style={{ display: "flex", alignItems: "center", gap: "22px" }}
          >
            <Link to="/dashboard" style={linkStyle("/dashboard")}>
              Menu
            </Link>
            <Link to="/builder" style={linkStyle("/builder")}>
              Pizza Builder
            </Link>

            {/* Cart Button with Item Count */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Cart"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "relative",
                fontSize: "20px",
              }}
            >
              🛒
              {cartCount > 0 && (
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
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <>
                <Link to="/orders" style={linkStyle("/orders")}>
                  Order History
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    style={{
                      textDecoration: "none",
                      color: "#1890ff",
                      fontWeight: "bold",
                      borderBottom: location.pathname.startsWith("/admin")
                        ? "2px solid #1890ff"
                        : "2px solid transparent",
                      paddingBottom: "4px",
                    }}
                  >
                    Admin Panel
                  </Link>
                )}

                {/* User Profile Dropdown */}
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      backgroundColor: "#fafafa",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    <span>👤 {user.name || "Profile"}</span>
                    <span style={{ fontSize: "11px" }}>
                      {profileOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {profileOpen && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "110%",
                        minWidth: "200px",
                        backgroundColor: "#fff",
                        border: "1px solid #eaeaea",
                        borderRadius: "6px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        padding: "8px 0",
                        zIndex: 200,
                      }}
                    >
                      <div
                        style={{
                          padding: "8px 14px",
                          borderBottom: "1px solid #f0f0f0",
                          fontSize: "13px",
                          color: "#666",
                        }}
                      >
                        Signed in as{" "}
                        <strong style={{ color: "#333" }}>
                          {user.name || "User"}
                        </strong>
                      </div>
                      <Link
                        to="/profile"
                        style={{
                          display: "block",
                          padding: "9px 14px",
                          textDecoration: "none",
                          color: isActive("/profile") ? "#ff4d4f" : "#333",
                          fontWeight: isActive("/profile") ? "bold" : "normal",
                        }}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        style={{
                          display: "block",
                          padding: "9px 14px",
                          textDecoration: "none",
                          color: isActive("/orders") ? "#ff4d4f" : "#333",
                          fontWeight: isActive("/orders") ? "bold" : "normal",
                        }}
                      >
                        Order History
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "9px 14px",
                          background: "none",
                          border: "none",
                          borderTop: "1px solid #f0f0f0",
                          color: "#ff4d4f",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" style={linkStyle("/login")}>
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    textDecoration: "none",
                    color: "#fff",
                    backgroundColor: "#ff4d4f",
                    padding: "7px 14px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}

        {/* Mobile Cart + Hamburger Button */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Cart"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "relative",
                fontSize: "20px",
              }}
            >
              🛒
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-10px",
                    backgroundColor: "#ff4d4f",
                    color: "white",
                    borderRadius: "50%",
                    padding: "1px 6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              style={{
                background: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "6px 10px",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "16px 24px 20px",
            borderTop: "1px solid #f0f0f0",
            backgroundColor: "#fff",
          }}
        >
          <Link to="/dashboard" style={linkStyle("/dashboard")}>
            Menu
          </Link>
          <Link to="/builder" style={linkStyle("/builder")}>
            Pizza Builder
          </Link>

          {user ? (
            <>
              <Link to="/orders" style={linkStyle("/orders")}>
                Order History
              </Link>
              <Link to="/profile" style={linkStyle("/profile")}>
                Profile ({user.name || "Account"})
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
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "10px",
                  backgroundColor: "#fff2f0",
                  color: "#ff4d4f",
                  border: "1px solid #ffccc7",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  textAlign: "left",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle("/login")}>
                Login
              </Link>
              <Link to="/register" style={linkStyle("/register")}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navigation;
