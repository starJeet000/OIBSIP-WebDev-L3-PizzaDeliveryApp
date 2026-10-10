import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext"; // Import useCart

const PizzaCard = ({ pizza }) => {
  const { addToCart } = useCart(); // Consume cart context

  return (
    <div
      style={{
        border: "1px solid #eaeaea",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <img
        src={pizza.image || "https://via.placeholder.com/300x200?text=Pizza"}
        alt={pizza.name}
        style={{ width: "100%", height: "200px", objectFit: "cover" }}
      />
      <div
        style={{
          padding: "15px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", color: "#333" }}>
            {pizza.name}
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: pizza.isVegetarian ? "green" : "red",
                marginLeft: "8px",
              }}
              title={pizza.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
            />
          </h3>
          <span
            style={{ fontWeight: "bold", color: "#ff4d4f", fontSize: "18px" }}
          >
            ₹{pizza.price}
          </span>
        </div>

        {/* Description restricted to max 2 lines[cite: 1] */}
        <p
          style={{
            margin: "0 0 15px 0",
            color: "#666",
            fontSize: "14px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {pizza.description}
        </p>

        <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
          <button
            onClick={() => addToCart(pizza)} // Add pizza to cart directly[cite: 1]
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: "#fff",
              border: "1px solid #ff4d4f",
              color: "#ff4d4f",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add to Cart
          </button>
          <Link
            to={`/builder?basePizza=${pizza._id}`}
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: "#ff4d4f",
              color: "#fff",
              textDecoration: "none",
              textAlign: "center",
              borderRadius: "4px",
            }}
          >
            Customize
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PizzaCard;
