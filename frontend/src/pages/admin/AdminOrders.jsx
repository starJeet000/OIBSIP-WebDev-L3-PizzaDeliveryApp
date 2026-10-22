import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = `/orders/admin?page=${page}&limit=15&sort=${sortOrder}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (searchQuery) query += `&search=${searchQuery}`;

      const res = await api.get(query);
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/admin/login");
      } else {
        showMessage("Failed to fetch orders", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [page, statusFilter, sortOrder]);

  // Handle Search Submission
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    fetchOrders();
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      showMessage(`Order status updated to ${newStatus}`, "success");
      fetchOrders();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Failed to update status",
        "error",
      );
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason)
      return showMessage("Please select a cancellation reason", "error");

    try {
      await api.put(`/orders/${selectedOrder._id}/cancel`, {
        reason: cancelReason,
        refund: true, // Assuming auto-refund is true for now
      });
      showMessage(
        "Order successfully cancelled and inventory restocked",
        "success",
      );
      setShowCancelForm(false);
      fetchOrders();
      setSelectedOrder({ ...selectedOrder, status: "Cancelled" });
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Failed to cancel order",
        "error",
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#52c41a"; // Green
      case "Sent to Delivery":
        return "#1890ff"; // Blue
      case "In Kitchen":
        return "#faad14"; // Orange
      case "Cancelled":
        return "#ff4d4f"; // Red
      default:
        return "#8c8c8c"; // Gray for Order Received
    }
  };

  // Helper to generate available next statuses based on current status
  const getAvailableStatuses = (currentStatus) => {
    const transitions = {
      "Order Received": ["In Kitchen"],
      "In Kitchen": ["Sent to Delivery"],
      "Sent to Delivery": ["Delivered"],
      Delivered: [],
      Cancelled: [],
    };
    return transitions[currentStatus] || [];
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      {/* Sidebar */}
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
              color: "#a6adb4",
              textDecoration: "none",
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
              color: "#fff",
              textDecoration: "none",
              backgroundColor: "#1890ff",
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
        <h1 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "24px" }}>
          Order Management
        </h1>

        {message.text && (
          <div
            style={{
              padding: "12px 15px",
              marginBottom: "20px",
              borderRadius: "4px",
              color: "#fff",
              backgroundColor:
                message.type === "success" ? "#52c41a" : "#ff4d4f",
            }}
          >
            {message.text}
          </div>
        )}

        {/* Toolbar: Filters & Search */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9",
              }}
            >
              <option value="">All Statuses</option>
              <option value="Order Received">Order Received</option>
              <option value="In Kitchen">In Kitchen</option>
              <option value="Sent to Delivery">Sent to Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => {
                setPage(1);
                setSortOrder(e.target.value);
              }}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9",
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          <form
            onSubmit={handleSearch}
            style={{ display: "flex", gap: "10px" }}
          >
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9",
                width: "250px",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#1890ff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  fetchOrders();
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #d9d9d9",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Orders Table */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {loading ? (
            <div>Loading orders...</div>
          ) : (
            <>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid #f0f0f0",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <th style={{ padding: "12px" }}>Order ID</th>
                    <th style={{ padding: "12px" }}>Date</th>
                    <th style={{ padding: "12px" }}>Customer</th>
                    <th style={{ padding: "12px" }}>Total</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    <th style={{ padding: "12px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      style={{ borderBottom: "1px solid #f0f0f0" }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          fontFamily: "monospace",
                          fontSize: "13px",
                        }}
                      >
                        {order._id}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {order.user?.name || "Unknown"}
                      </td>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>
                        ₹{order.totalPrice.toFixed(2)}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            backgroundColor: getStatusColor(order.status),
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowCancelForm(false);
                          }}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#fff",
                            border: "1px solid #d9d9d9",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#888",
                        }}
                      >
                        No orders found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "20px",
                }}
              >
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  style={{
                    padding: "8px 16px",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((prev) => prev + 1)}
                  style={{
                    padding: "8px 16px",
                    cursor:
                      page === totalPages || totalPages === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Order Details Modal Overlay */}
      {selectedOrder && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "8px",
              width: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
              margin: "40px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid #eee",
                paddingBottom: "15px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 5px 0" }}>Order Details</h2>
                <span style={{ fontFamily: "monospace", color: "#888" }}>
                  ID: {selectedOrder._id}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", gap: "30px" }}>
              {/* Left Column: Details */}
              <div style={{ flex: 2 }}>
                <h4
                  style={{
                    margin: "0 0 10px 0",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "5px",
                  }}
                >
                  Customer Info
                </h4>
                <p style={{ margin: "5px 0" }}>
                  <strong>Name:</strong> {selectedOrder.user?.name}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Email:</strong> {selectedOrder.user?.email}
                </p>

                <h4
                  style={{
                    margin: "20px 0 10px 0",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "5px",
                  }}
                >
                  Delivery Address
                </h4>
                <p style={{ margin: "5px 0" }}>
                  {selectedOrder.shippingAddress.address},{" "}
                  {selectedOrder.shippingAddress.city},{" "}
                  {selectedOrder.shippingAddress.postalCode}
                </p>
                {selectedOrder.shippingAddress.instructions && (
                  <p
                    style={{
                      margin: "5px 0",
                      color: "#d48806",
                      fontStyle: "italic",
                    }}
                  >
                    Note: {selectedOrder.shippingAddress.instructions}
                  </p>
                )}

                <h4
                  style={{
                    margin: "20px 0 10px 0",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "5px",
                  }}
                >
                  Order Items
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {selectedOrder.orderItems.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "10px",
                        backgroundColor: "#fafafa",
                        borderRadius: "4px",
                        border: "1px solid #eee",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: "bold",
                        }}
                      >
                        <span>
                          {item.qty}x {item.name}
                        </span>
                        <span>₹{(item.price * item.qty).toFixed(2)}</span>
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginTop: "5px",
                        }}
                      >
                        {item.base && <span>Base: {item.base} | </span>}
                        {item.sauce && <span>Sauce: {item.sauce} | </span>}
                        {item.cheese && <span>Cheese: {item.cheese} </span>}
                        {item.veggies?.length > 0 && (
                          <div>Veggies: {item.veggies.join(", ")}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Actions & Summary */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#fafafa",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              >
                <h4 style={{ margin: "0 0 15px 0" }}>Summary</h4>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span>Subtotal:</span>{" "}
                  <span>₹{selectedOrder.itemsPrice.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span>Tax:</span>{" "}
                  <span>₹{selectedOrder.taxPrice.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                  }}
                >
                  <span>Delivery:</span>{" "}
                  <span>₹{selectedOrder.shippingPrice.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "bold",
                    fontSize: "18px",
                    borderTop: "1px solid #ddd",
                    paddingTop: "10px",
                  }}
                >
                  <span>Total:</span>{" "}
                  <span>₹{selectedOrder.totalPrice.toFixed(2)}</span>
                </div>

                <div
                  style={{
                    margin: "20px 0",
                    padding: "15px 0",
                    borderTop: "1px dashed #ccc",
                  }}
                >
                  <h4 style={{ margin: "0 0 10px 0" }}>Current Status</h4>
                  <span
                    style={{
                      backgroundColor: getStatusColor(selectedOrder.status),
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      display: "inline-block",
                      marginBottom: "15px",
                    }}
                  >
                    {selectedOrder.status}
                  </span>

                  {/* Status Progression Buttons */}
                  {getAvailableStatuses(selectedOrder.status).map(
                    (nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() =>
                          handleUpdateStatus(selectedOrder._id, nextStatus)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          marginBottom: "10px",
                          backgroundColor: "#1890ff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Mark as "{nextStatus}"
                      </button>
                    ),
                  )}

                  {/* Cancel Button (Only if not delivered/cancelled/sent to delivery) */}
                  {["Order Received", "In Kitchen"].includes(
                    selectedOrder.status,
                  ) &&
                    !showCancelForm && (
                      <button
                        onClick={() => setShowCancelForm(true)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          backgroundColor: "#fff",
                          color: "#ff4d4f",
                          border: "1px solid #ff4d4f",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Cancel Order
                      </button>
                    )}

                  {/* Cancellation Form */}
                  {showCancelForm && (
                    <div
                      style={{
                        marginTop: "15px",
                        padding: "15px",
                        backgroundColor: "#fff2f0",
                        border: "1px solid #ffccc7",
                        borderRadius: "4px",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          fontWeight: "bold",
                          color: "#cf1322",
                          fontSize: "14px",
                        }}
                      >
                        Cancellation Reason
                      </label>
                      <select
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginBottom: "10px",
                          borderRadius: "4px",
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        <option value="">Select a reason...</option>
                        <option value="Out of stock ingredients">
                          Out of stock ingredients
                        </option>
                        <option value="Customer request">
                          Customer request
                        </option>
                        <option value="Kitchen capacity full">
                          Kitchen capacity full
                        </option>
                        <option value="Delivery unavailable">
                          Delivery unavailable
                        </option>
                      </select>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#888",
                          marginBottom: "10px",
                        }}
                      >
                        This will return items to inventory and initiate a
                        refund.
                      </p>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={handleCancelOrder}
                          style={{
                            flex: 1,
                            padding: "8px",
                            backgroundColor: "#ff4d4f",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowCancelForm(false)}
                          style={{
                            flex: 1,
                            padding: "8px",
                            backgroundColor: "#fff",
                            border: "1px solid #d9d9d9",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => window.print()}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#f0f2f5",
                    border: "1px solid #d9d9d9",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🖨️ Print for Kitchen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
