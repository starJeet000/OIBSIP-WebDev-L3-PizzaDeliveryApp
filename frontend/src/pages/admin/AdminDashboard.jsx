import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import api from "../../services/api";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setData(res.data);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [navigate]);

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading Admin Workspace...
      </div>
    );
  if (!data) return null;

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      {/* Navigation Sidebar */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "#001529",
          color: "#fff",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ padding: "0 20px", color: "#fff", marginBottom: "30px" }}>
          🍕 PizzaDash Admin
        </h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <Link
            to="/admin/dashboard"
            style={{
              padding: "12px 20px",
              color: "#fff",
              textDecoration: "none",
              backgroundColor: "#1890ff",
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/inventory"
            style={{
              padding: "12px 20px",
              color: "#a6adb4",
              textDecoration: "none",
            }}
          >
            Inventory
          </Link>
          <Link
            to="/admin/orders"
            style={{
              padding: "12px 20px",
              color: "#a6adb4",
              textDecoration: "none",
            }}
          >
            Orders
          </Link>
          <button
            onClick={() => {
              sessionStorage.removeItem("token");
              navigate("/admin/login");
            }}
            style={{
              padding: "12px 20px",
              color: "#ff4d4f",
              textDecoration: "none",
              background: "none",
              border: "none",
              textAlign: "left",
              cursor: "pointer",
              marginTop: "auto",
            }}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ margin: 0, color: "#333" }}>
            Admin Dashboard - {dateStr}
          </h1>
        </div>

        {/* Key Metrics Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {[
            {
              label: "Orders Today",
              value: data.metrics.totalOrdersToday,
              color: "#1890ff",
            },
            {
              label: "Revenue Today",
              value: `₹${data.metrics.totalRevenueToday}`,
              color: "#52c41a",
            },
            {
              label: "Avg Order Value",
              value: `₹${data.metrics.averageOrderValue}`,
              color: "#722ed1",
            },
            {
              label: "Active Orders",
              value: data.metrics.activeOrdersCount,
              color: "#faad14",
            },
            {
              label: "New Users",
              value: data.metrics.newSignupsToday,
              color: "#eb2f96",
            },
          ].map((metric, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderLeft: `4px solid ${metric.color}`,
              }}
            >
              <div
                style={{
                  color: "#8c8c8c",
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              >
                {metric.label}
              </div>
              <div
                style={{ fontSize: "28px", fontWeight: "bold", color: "#333" }}
              >
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
          <Link
            to="/admin/inventory"
            style={{
              padding: "10px 20px",
              backgroundColor: "#fff",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              textDecoration: "none",
              color: "#333",
              fontWeight: "bold",
            }}
          >
            📦 View Inventory
          </Link>
          <Link
            to="/admin/orders"
            style={{
              padding: "10px 20px",
              backgroundColor: "#fff",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              textDecoration: "none",
              color: "#333",
              fontWeight: "bold",
            }}
          >
            📋 Manage Orders
          </Link>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#fff",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              color: "#333",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🔔 View Notifications
          </button>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#fff",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              color: "#333",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            📊 User Reports
          </button>
        </div>

        {/* Charts Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
          }}
        >
          {/* Revenue Chart */}
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>
              Daily Revenue Trend (Last 7 Days)
            </h3>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.dailyRevenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1890ff"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Pizzas Chart */}
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>
              Top Ordered Pizzas
            </h3>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.charts.topPizzas}
                  layout="vertical"
                  margin={{ left: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#52c41a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
