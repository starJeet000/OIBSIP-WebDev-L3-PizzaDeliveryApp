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

  const fetchOrders = async (overrideSearch) => {
    const activeSearch =
      overrideSearch !== undefined ? overrideSearch : searchQuery;
    try {
      setLoading(true);
      let query = `/orders/admin?page=${page}&limit=15&sort=${sortOrder}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (activeSearch) query += `&search=${encodeURIComponent(activeSearch)}`;

      const res = await api.get(query);
      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
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
    setPage(1);
    fetchOrders();
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      showMessage(`Order status updated to ${newStatus}`, "success");
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(
          res.data.order || { ...selectedOrder, status: newStatus },
        );
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
      const res = await api.put(`/orders/${selectedOrder._id}/cancel`, {
        reason: cancelReason,
        refund: true,
      });
      showMessage(
        "Order successfully cancelled and inventory restocked",
        "success",
      );
      setShowCancelForm(false);
      await fetchOrders();
      setSelectedOrder(
        res.data.order || { ...selectedOrder, status: "Cancelled" },
      );
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
        return "#52c41a";
      case "Sent to Delivery":
        return "#1890ff";
      case "In Kitchen":
        return "#faad14";
      case "Cancelled":
        return "#ff4d4f";
      default:
        return "#8c8c8c";
    }
  };

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

  // Safe helpers to read Order.js schema fields cleanly
  const getCustomer = (order) =>
    typeof order.userId === "object" && order.userId !== null
      ? order.userId
      : {};
  const getGrandTotal = (order) =>
    Number(order.pricing?.grandTotal ?? order.totalPrice ?? 0);
  const getSubtotal = (order) =>
    Number(order.pricing?.subtotal ?? order.itemsPrice ?? 0);
  const getTax = (order) => Number(order.pricing?.tax ?? order.taxPrice ?? 0);
  const getDeliveryFee = (order) =>
    Number(order.pricing?.deliveryFee ?? order.shippingPrice ?? 0);
  const getAddress = (order) =>
    order.deliveryAddress || order.shippingAddress || {};
  const getItems = (order) => order.items || order.orderItems || [];

  const formatCustomizationSummary = (item) => {
    const cust = item.customizations || {};
    const parts = [];
    const baseLabel = cust.base?.name || cust.base || item.base;
    const sauceLabel = cust.sauce?.name || cust.sauce || item.sauce;
    const cheeseLabel = cust.cheese?.name || cust.cheese || item.cheese;
    const veggies = cust.vegetables || item.veggies || [];

    if (baseLabel) parts.push(`Base: ${baseLabel}`);
    if (sauceLabel) parts.push(`Sauce: ${sauceLabel}`);
    if (cheeseLabel) parts.push(`Cheese: ${cheeseLabel}`);

    return {
      summary: parts.join(" | "),
      veggies,
    };
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
              sessionStorage.removeItem("user");
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
                  setPage(1);
                  fetchOrders("");
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
                  {orders.map((order) => {
                    const customer = getCustomer(order);
                    return (
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
                          {order.orderId || order._id}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {customer.name || "Unknown"}
                        </td>
                        <td style={{ padding: "12px", fontWeight: "bold" }}>
                          ₹{getGrandTotal(order).toFixed(2)}
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
                    );
                  })}
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
            position: "fixed",
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
              maxWidth: "95%",
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
                  Order: {selectedOrder.orderId || selectedOrder._id} (ID:{" "}
                  {selectedOrder._id})
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

            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
              {/* Left Column: Details */}
              <div style={{ flex: 2, minWidth: "280px" }}>
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
                  <strong>Name:</strong>{" "}
                  {getCustomer(selectedOrder).name || "N/A"}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Email:</strong>{" "}
                  {getCustomer(selectedOrder).email || "N/A"}
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
                {(() => {
                  const addr = getAddress(selectedOrder);
                  const streetLine = addr.street || addr.address || "";
                  return (
                    <>
                      <p style={{ margin: "5px 0" }}>
                        {[streetLine, addr.city, addr.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {addr.instructions && (
                        <p
                          style={{
                            margin: "5px 0",
                            color: "#d48806",
                            fontStyle: "italic",
                          }}
                        >
                          Note: {addr.instructions}
                        </p>
                      )}
                    </>
                  );
                })()}

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
                  {getItems(selectedOrder).map((item, index) => {
                    const qty = Number(item.quantity ?? item.qty ?? 1);
                    const name = item.pizzaType || item.name || "Pizza";
                    const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
                    const lineTotal = Number(
                      item.totalPrice ?? unitPrice * qty,
                    );
                    const { summary, veggies } =
                      formatCustomizationSummary(item);

                    return (
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
                            {qty}x {name}
                          </span>
                          <span>₹{lineTotal.toFixed(2)}</span>
                        </div>
                        {(summary || veggies.length > 0) && (
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              marginTop: "5px",
                            }}
                          >
                            {summary && <div>{summary}</div>}
                            {veggies.length > 0 && (
                              <div>Veggies: {veggies.join(", ")}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Actions & Summary */}
              <div
                style={{
                  flex: 1,
                  minWidth: "240px",
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
                  <span>₹{getSubtotal(selectedOrder).toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span>Tax:</span>{" "}
                  <span>₹{getTax(selectedOrder).toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                  }}
                >
                  <span>Delivery:</span>{" "}
                  <span>₹{getDeliveryFee(selectedOrder).toFixed(2)}</span>
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
                  <span>₹{getGrandTotal(selectedOrder).toFixed(2)}</span>
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

                  {/* Cancel Button */}
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
