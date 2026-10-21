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
  Area,
  AreaChart,
} from "recharts";
import api from "../../services/api";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]); // state for alerts
  const [showModal, setShowModal] = useState(false); // Modal toggle
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [dashRes, alertsRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/inventory/alerts"), // Fetch alerts concurrently
        ]);
        setData(dashRes.data);
        setAlerts(alertsRes.data.items);
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
        position: "relative",
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
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <h1 style={{ margin: 0, color: "#333", fontSize: "24px" }}>
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
            onClick={() => setShowModal(true)}
            style={{
              position: "relative",
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
            {alerts.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  backgroundColor: "#ff4d4f",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "2px 8px",
                  fontSize: "12px",
                }}
              >
                {alerts.length}
              </span>
            )}
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
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
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

          {/* Hourly Orders Chart */}
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>
              Orders Per Hour (Today)
            </h3>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.ordersPerHour}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#faad14"
                    fill="#fffbe6"
                    strokeWidth={3}
                  />
                </AreaChart>
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

      {/* Notifications Modal Overlay */}
      {showModal && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "8px",
              width: "500px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, color: "#333" }}>System Notifications</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {alerts.length === 0 ? (
              <p
                style={{
                  color: "#52c41a",
                  fontWeight: "bold",
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                ✅ All systems nominal. No low stock alerts.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {alerts.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      padding: "15px",
                      border: "1px solid #ffccc7",
                      backgroundColor: "#fff2f0",
                      borderRadius: "4px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold", color: "#cf1322" }}>
                        Low Stock Alert: {item.name}
                      </div>
                      <div style={{ fontSize: "13px", color: "#555" }}>
                        Category: {item.category}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold", fontSize: "18px" }}>
                        {item.quantity} left
                      </div>
                      <div style={{ fontSize: "12px", color: "#888" }}>
                        Min req: {item.minThreshold}
                      </div>
                    </div>
                  </div>
                ))}
                <Link
                  to="/admin/inventory"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: "15px",
                    padding: "10px",
                    backgroundColor: "#1890ff",
                    color: "#fff",
                    borderRadius: "4px",
                    textDecoration: "none",
                  }}
                >
                  Go to Inventory to Restock
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
