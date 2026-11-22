import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";

const OrderTracking = () => {
  const { id } = useParams(); // The order ID from the URL
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Define the strict order of statuses for the visual timeline
  const timelineSteps = [
    "Order Received",
    "In Kitchen",
    "Sent to Delivery",
    "Delivered",
  ];

  const fetchOrderStatus = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrderData(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch order status");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // 1. Initial fetch from database
    fetchOrderStatus();

    // 2. Poll every 10 seconds for order status updates
    const pollInterval = setInterval(() => {
      fetchOrderStatus();
    }, 10000);

    // 3. Initialize WebSocket Connection for instant updates
    const socket = io(
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5000",
    );

    // Join the specific order's private room
    socket.emit("joinOrderRoom", id);

    // Listen for real-time broadcasts from the admin panel
    socket.on("orderStatusUpdated", (data) => {
      if (data.orderId === id) {
        setOrderData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: data.status,
            statusTimeline: data.timeline || prev.statusTimeline,
            deliveryPerson: data.deliveryPerson || prev.deliveryPerson,
            estimatedDelivery: data.estimatedDelivery || prev.estimatedDelivery,
          };
        });
      }
    });

    // Clean up polling interval and socket connection on unmount or ID change
    return () => {
      clearInterval(pollInterval);
      socket.disconnect();
    };
  }, [id, fetchOrderStatus]);

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
  const isCancelled = orderData.status === "Cancelled";
  const isDelivered = orderData.status === "Delivered";

  // Time formatting helper
  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Estimated delivery time: uses backend estimatedDelivery or defaults to createdAt + 45 mins
  const getEstimatedDeliveryDisplay = () => {
    if (isCancelled) return "Cancelled";
    if (isDelivered) {
      const deliveredEntry = orderData.statusTimeline?.find(
        (h) => h.status === "Delivered",
      );
      return deliveredEntry
        ? `Delivered at ${formatTime(deliveredEntry.timestamp)}`
        : "Delivered";
    }

    const etaDate = orderData.estimatedDelivery
      ? new Date(orderData.estimatedDelivery)
      : orderData.createdAt
        ? new Date(new Date(orderData.createdAt).getTime() + 45 * 60 * 1000)
        : null;

    if (!etaDate || Number.isNaN(etaDate.getTime())) return "~45 mins";
    return `${formatTime(etaDate)} (Est. 45 mins)`;
  };

  // Delivery partner info when shipped (Sent to Delivery / Delivered)
  const rider = orderData.deliveryPerson || {
    name: "Rajesh Kumar",
    phone: "+91 9876543210",
    vehicle: "Delivery Bike",
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
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "30px",
          borderBottom: "1px solid #eaeaea",
          paddingBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 5px 0" }}>Order Tracking</h2>
          <p style={{ margin: 0, color: "#666" }}>
            Order ID: {orderData.orderId || id}
          </p>
          <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#444" }}>
            <strong>Estimated Delivery:</strong> {getEstimatedDeliveryDisplay()}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", color: "#666" }}>Current Status</div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: isCancelled ? "#ff4d4f" : "#52c41a",
            }}
          >
            {orderData.status}
          </div>
          {!isCancelled && !isDelivered && (
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
              Live updates via Socket &amp; 10s sync
            </div>
          )}
        </div>
      </div>

      {/* Visual Timeline - Hidden if Cancelled */}
      {!isCancelled && (
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
              width: `calc(${(Math.max(0, currentStepIndex) / (timelineSteps.length - 1)) * 100}% - 40px)`,
              transition: "width 0.5s ease-in-out",
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

              // Match with the MongoDB backend schema array `statusTimeline`
              const historyItem = orderData.statusTimeline?.find(
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
                      transition: "all 0.3s ease",
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
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      marginTop: "5px",
                    }}
                  >
                    {historyItem ? formatTime(historyItem.timestamp) : "--:--"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancellation Notice */}
      {isCancelled && (
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
          <strong>Order Cancelled:</strong> This order has been cancelled by the
          restaurant. If a payment was made, a refund will be initiated to your
          original payment method shortly.
        </div>
      )}

      {/* Delivery Person Details (When shipped: Sent to Delivery or Delivered) */}
      {currentStepIndex >= 2 && !isCancelled && (
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "40px" }}>🛵</div>
            <div>
              <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>
                {isDelivered
                  ? "Delivered by your delivery partner"
                  : "Your delivery partner is on the way!"}
              </h4>
              <p
                style={{ margin: "0 0 4px 0", color: "#444", fontSize: "14px" }}
              >
                <strong>Rider:</strong> {rider.name}
                {rider.vehicle ? ` (${rider.vehicle})` : ""}
              </p>
              <p style={{ margin: 0, color: "#555", fontSize: "14px" }}>
                <strong>Phone:</strong> {rider.phone} — Keep your phone nearby.
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <Link
          to="/orders"
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
          Back to My Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderTracking;
