import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

const OrderTracking = () => {
  const { id } = useParams(); // The order ID from the URL
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Define the strict order of statuses for the visual timeline[cite: 1]
  const timelineSteps = [
    "Order Received",
    "In Kitchen",
    "Sent to Delivery",
    "Delivered",
  ];

  const fetchOrderStatus = async () => {
    try {
      const { data } = await api.get(`/orders/${id}/status`);
      setOrderData(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch order status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchOrderStatus();

    // OPTION A - Polling: Fetch order status every 10 seconds[cite: 1]
    const interval = setInterval(() => {
      fetchOrderStatus();
    }, 10000);

    return () => clearInterval(interval); // Clean up on unmount
  }, [id]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Loading tracking details...
      </div>
    );
  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", padding: "50px" }}>
        {error}
      </div>
    );
  if (!orderData) return null;

  const currentStepIndex = timelineSteps.indexOf(orderData.status);

  // Time formatting helper
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "30px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          borderBottom: "1px solid #eaeaea",
          paddingBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 5px 0" }}>Order Tracking</h2>
          <p style={{ margin: 0, color: "#666" }}>Order ID: {id}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", color: "#666" }}>
            Estimated Delivery
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#ff4d4f" }}
          >
            {formatTime(orderData.estimatedDelivery)}
          </div>
        </div>
      </div>

      {/* Visual Timeline[cite: 1] */}
      <div
        style={{ position: "relative", margin: "40px 0", padding: "0 20px" }}
      >
        {/* Connecting Background Line */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "40px",
            right: "40px",
            height: "4px",
            backgroundColor: "#eaeaea",
            zIndex: 1,
          }}
        ></div>
        {/* Active Connecting Line */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "40px",
            height: "4px",
            backgroundColor: "#52c41a",
            zIndex: 1,
            width: `calc(${(currentStepIndex / (timelineSteps.length - 1)) * 100}% - 40px)`,
          }}
        ></div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 2,
          }}
        >
          {timelineSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            // Find timestamp if the step is completed
            const historyItem = orderData.statusHistory.find(
              (h) => h.status === step,
            );

            return (
              <div
                key={step}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "120px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isCompleted ? "#52c41a" : "#fff",
                    border: isCompleted ? "none" : "4px solid #eaeaea",
                    color: isCompleted ? "#fff" : "#ccc",
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                    boxShadow: isCurrent
                      ? "0 0 0 4px rgba(82, 196, 26, 0.2)"
                      : "none",
                  }}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: isCurrent ? "bold" : "normal",
                    color: isCompleted ? "#333" : "#999",
                    textAlign: "center",
                  }}
                >
                  {step}
                </div>
                <div
                  style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}
                >
                  {historyItem ? formatTime(historyItem.timestamp) : "--:--"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Person Details (Shows once Sent to Delivery)[cite: 1] */}
      {orderData.deliveryPerson && (
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div style={{ fontSize: "40px" }}>🛵</div>
          <div>
            <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>
              Your delivery partner is on the way!
            </h4>
            <p style={{ margin: 0, color: "#555" }}>
              <strong>{orderData.deliveryPerson.name}</strong> •{" "}
              {orderData.deliveryPerson.phone}
            </p>
          </div>
        </div>
      )}

      {orderData.status === "Cancelled" && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#fff2f0",
            border: "1px solid #ffccc7",
            borderRadius: "8px",
            color: "#cf1322",
          }}
        >
          <strong>Order Cancelled:</strong> This order has been cancelled. If a
          payment was made, a refund will be initiated shortly.
        </div>
      )}

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <Link
          to="/dashboard"
          style={{
            padding: "12px 24px",
            backgroundColor: "#f5f5f5",
            color: "#333",
            textDecoration: "none",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontWeight: "bold",
          }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default OrderTracking;
