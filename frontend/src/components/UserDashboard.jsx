import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const UserDashboard = () => {
  const [stats, setStats] = useState({
    recentOrders: 0,
    totalSpent: 0,
    memberSince: "",
  });
  const [loading, setLoading] = useState(true);

  // Retrieve user data from storage
  const userStr =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { name: "Guest" };

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // We will build this backend endpoint shortly to aggregate these specific stats
        const response = await api.get("/users/profile");

        // Mocking the stats calculation for the layout until the orders backend is built
        setStats({
          recentOrders: response.data.orders?.length || 0,
          totalSpent: response.data.totalSpent || 0,
          memberSince: new Date(response.data.createdAt).toLocaleDateString(
            "en-US",
            { month: "long", year: "numeric" },
          ),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading dashboard...
      </div>
    );

  return (
    <div
      className="dashboard-container"
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}
    >
      {/* Welcome banner: "Hello, [User's Name]!"[cite: 1] */}
      <div
        className="welcome-banner"
        style={{
          backgroundColor: "#fff0f0",
          padding: "30px",
          borderRadius: "8px",
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 10px 0", color: "#333" }}>
            Hello, {user.name}! 👋
          </h1>
          <p style={{ margin: 0, color: "#666" }}>
            Ready for your next delicious pizza?
          </p>
        </div>

        {/* Call-to-action button: "Order Now"[cite: 1] */}
        <Link
          to="/builder"
          style={{
            padding: "12px 24px",
            backgroundColor: "#ff4d4f",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Order Now
        </Link>
      </div>

      {/* Quick stats: Recent orders, Total spent, Member since date[cite: 1] */}
      <h2 style={{ marginBottom: "20px", color: "#333" }}>Your Overview</h2>
      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        <div
          className="stat-card"
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #eaeaea",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              color: "#888",
              fontSize: "14px",
              textTransform: "uppercase",
            }}
          >
            Recent Orders
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {stats.recentOrders}
          </p>
        </div>

        <div
          className="stat-card"
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #eaeaea",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              color: "#888",
              fontSize: "14px",
              textTransform: "uppercase",
            }}
          >
            Total Spent
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            ₹{stats.totalSpent}
          </p>
        </div>

        <div
          className="stat-card"
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #eaeaea",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              color: "#888",
              fontSize: "14px",
              textTransform: "uppercase",
            }}
          >
            Member Since
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {stats.memberSince}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
