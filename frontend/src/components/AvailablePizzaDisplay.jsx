import React, { useState, useEffect } from "react";
import api from "../services/api";
import PizzaCard from "./PizzaCard";

const AvailablePizzaDisplay = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [priceRange, setPriceRange] = useState(1000); // max price filter

  useEffect(() => {
    const fetchPizzas = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/pizzas?search=${search}&type=${type}&maxPrice=${priceRange}&pageNumber=${page}`,
        );
        setPizzas(data.pizzas);
        setTotalPages(data.pages);
      } catch (error) {
        console.error("Error fetching pizzas:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce fetch slightly to prevent spamming the API while typing
    const delayDebounce = setTimeout(() => {
      fetchPizzas();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, type, priceRange, page]);

  // Reset page to 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h2 style={{ color: "#333", marginBottom: "20px" }}>Our Menu</h2>

      {/* Controls: Search and Filters[cite: 1] */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        <input
          type="text"
          placeholder="Search by pizza name..."
          value={search}
          onChange={(e) => handleFilterChange(setSearch, e.target.value)}
          style={{
            flex: "1 1 250px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />

        <select
          value={type}
          onChange={(e) => handleFilterChange(setType, e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          <option value="All">All Types</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Non-Vegetarian">Non-Vegetarian</option>
        </select>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "14px", color: "#555" }}>
            Max Price: ₹{priceRange}
          </label>
          <input
            type="range"
            min="100"
            max="1500"
            step="50"
            value={priceRange}
            onChange={(e) => handleFilterChange(setPriceRange, e.target.value)}
          />
        </div>
      </div>

      {/* Grid View[cite: 1] */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          Loading menu...
        </div>
      ) : pizzas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No pizzas found matching your criteria.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {pizzas.map((pizza) => (
            <PizzaCard key={pizza._id} pizza={pizza} />
          ))}
        </div>
      )}

      {/* Pagination[cite: 1] */}
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
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AvailablePizzaDisplay;
