import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const InventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  // Stock Form State
  const [formData, setFormData] = useState({
    action: "Add",
    amount: "",
    notes: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const fetchInventory = async (currentPage) => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory?page=${currentPage}&limit=20`);
      setItems(res.data.items);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(page);
  }, [page, navigate]);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedItem || !formData.amount) return;

    try {
      await api.put(`/inventory/${selectedItem._id}`, {
        action: formData.action,
        amount: Number(formData.amount),
        notes: formData.notes,
      });

      setMessage({ text: "Stock updated successfully!", type: "success" });
      setFormData({ action: "Add", amount: "", notes: "" });
      setSelectedItem(null);
      fetchInventory(page); // Refresh data

      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to update stock",
        type: "error",
      });
    }
  };

  const getStatusBadge = (qty, min) => {
    if (qty === 0) {
      return (
        <span
          style={{
            backgroundColor: "#ff4d4f",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          Red - Critical
        </span>
      );
    }
    if (qty <= min) {
      return (
        <span
          style={{
            backgroundColor: "#faad14",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          Yellow - Low
        </span>
      );
    }
    return (
      <span
        style={{
          backgroundColor: "#52c41a",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        Green - OK
      </span>
    );
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
              color: "#fff",
              textDecoration: "none",
              backgroundColor: "#1890ff",
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
          Inventory Management
        </h1>

        {message.text && (
          <div
            style={{
              padding: "10px 15px",
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: selectedItem ? "2fr 1fr" : "1fr",
            gap: "20px",
          }}
        >
          {/* Tabular View */}
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {loading ? (
              <div>Loading inventory data...</div>
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
                      <th style={{ padding: "12px" }}>Type</th>
                      <th style={{ padding: "12px" }}>Name</th>
                      <th style={{ padding: "12px" }}>Stock</th>
                      <th style={{ padding: "12px" }}>Min / Max</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item._id}
                        style={{ borderBottom: "1px solid #f0f0f0" }}
                      >
                        <td
                          style={{
                            padding: "12px",
                            fontWeight: "bold",
                            color: "#555",
                          }}
                        >
                          {item.category}
                        </td>
                        <td style={{ padding: "12px" }}>{item.name}</td>
                        <td style={{ padding: "12px", fontWeight: "bold" }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: "12px", color: "#8c8c8c" }}>
                          {item.minThreshold} / {item.maxLevel}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {getStatusBadge(item.quantity, item.minThreshold)}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <button
                            onClick={() => setSelectedItem(item)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#1890ff",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
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
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    style={{
                      padding: "8px 16px",
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Stock Update Panel Form */}
          {selectedItem && (
            <div
              style={{
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                alignSelf: "start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h3 style={{ margin: 0 }}>Update Stock</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ✕
                </button>
              </div>

              <p style={{ marginBottom: "15px", color: "#555" }}>
                <strong>Item:</strong> {selectedItem.name} (
                {selectedItem.category})
              </p>
              <p style={{ marginBottom: "15px", color: "#555" }}>
                <strong>Current Quantity:</strong> {selectedItem.quantity}
              </p>

              <form onSubmit={handleUpdateStock}>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Action
                  </label>
                  <select
                    value={formData.action}
                    onChange={(e) =>
                      setFormData({ ...formData, action: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #d9d9d9",
                    }}
                  >
                    <option value="Add">Add Stock (+)</option>
                    <option value="Set">Set Exact Quantity (=)</option>
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #d9d9d9",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Notes / Reason
                  </label>
                  <textarea
                    rows="3"
                    placeholder="e.g., Supplier shipment received"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #d9d9d9",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#52c41a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Save Stock Changes
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InventoryDashboard;
