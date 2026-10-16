import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const OrderHistory = () => {
  const { addToCart, setIsCartOpen } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination & Query States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let queryParams = `?page=${page}&limit=10&sortBy=${sortBy}`;
        if (search) queryParams += `&search=${search}`;
        if (statusFilter !== "All") queryParams += `&status=${statusFilter}`;
        if (dateRange.start && dateRange.end) {
          queryParams += `&startDate=${dateRange.start}&endDate=${dateRange.end}`;
        }

        const { data } = await api.get(`/orders/myorders${queryParams}`);
        setOrders(data.orders);
        setTotalPages(data.totalPages);
        setError("");
      } catch (err) {
        setError("Failed to load order history");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [page, search, statusFilter, dateRange, sortBy]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1); // Reset to first page on filter change
  };

  // Reorder functionality: Maps past items directly back into the cart context
  const handleReorder = (order) => {
    order.items.forEach((item) => {
      // Reconstruct a base pizza object for the cart
      const pizzaObj = {
        _id: item._id || `reorder-${Date.now()}`,
        name: item.pizzaType,
        price: item.unitPrice,
        image: "https://via.placeholder.com/300x200?text=Pizza",
      };
      addToCart(pizzaObj, item.customizations, item.quantity);
    });
    setIsCartOpen(true);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Order History</h2>

      {/* Control Panel: Filters, Search, Sort */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "15px",
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          border: "1px solid #eaeaea",
          marginBottom: "30px",
        }}
      >
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={search}
          onChange={(e) => handleFilterChange(setSearch, e.target.value)}
          style={{
            flex: "1 1 200px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Delivered">Delivered</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          <option value="recent">Most Recent</option>
          <option value="dateAsc">Oldest First</option>
          <option value="amountDesc">Amount (High to Low)</option>
        </select>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              handleFilterChange(setDateRange, {
                ...dateRange,
                start: e.target.value,
              })
            }
            style={{
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <span style={{ color: "#666" }}>to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              handleFilterChange(setDateRange, {
                ...dateRange,
                end: e.target.value,
              })
            }
            style={{
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      {/* Order List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          Loading history...
        </div>
      ) : error ? (
        <div style={{ color: "red", textAlign: "center" }}>{error}</div>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#666",
            border: "1px solid #eaeaea",
            borderRadius: "8px",
          }}
        >
          No orders found matching your criteria.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: "1px solid #eaeaea",
                borderRadius: "8px",
                padding: "20px",
                backgroundColor: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "18px",
                    marginBottom: "5px",
                  }}
                >
                  {order.orderId}
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    marginBottom: "10px",
                  }}
                >
                  {new Date(order.createdAt).toLocaleString()}
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#ff4d4f",
                    fontSize: "16px",
                  }}
                >
                  ₹{order.pricing.grandTotal}
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  alignItems: "flex-end",
                }}
              >
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    backgroundColor:
                      order.status === "Delivered"
                        ? "#f6ffed"
                        : order.status === "Cancelled"
                          ? "#fff2f0"
                          : "#e6f7ff",
                    color:
                      order.status === "Delivered"
                        ? "#52c41a"
                        : order.status === "Cancelled"
                          ? "#cf1322"
                          : "#1890ff",
                    border: `1px solid ${order.status === "Delivered" ? "#b7eb8f" : order.status === "Cancelled" ? "#ffccc7" : "#91d5ff"}`,
                  }}
                >
                  {order.status}
                </span>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Link
                    to={`/orders/${order._id}/success`}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#fff",
                      color: "#1890ff",
                      border: "1px solid #1890ff",
                      borderRadius: "4px",
                      textDecoration: "none",
                      fontSize: "14px",
                    }}
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleReorder(order)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#ff4d4f",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Reorder
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "40px",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={{
              padding: "8px 16px",
              border: "1px solid #ddd",
              backgroundColor: page === 1 ? "#f5f5f5" : "#fff",
              cursor: page === 1 ? "not-allowed" : "pointer",
              borderRadius: "4px",
            }}
          >
            Previous
          </button>
          <span
            style={{
              padding: "8px 16px",
              backgroundColor: "#ff4d4f",
              color: "#fff",
              borderRadius: "4px",
            }}
          >
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              padding: "8px 16px",
              border: "1px solid #ddd",
              backgroundColor: page === totalPages ? "#f5f5f5" : "#fff",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              borderRadius: "4px",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
