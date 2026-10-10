import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    getSubtotal,
  } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout"); // Proceed to Checkout button[cite: 1]
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 999,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "400px",
          maxWidth: "100%",
          height: "100vh",
          backgroundColor: "#fff",
          zIndex: 1000,
          boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px",
            borderBottom: "1px solid #eaeaea",
          }}
        >
          <h2 style={{ margin: 0 }}>Your Cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {cartItems.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#666", marginTop: "50px" }}
            >
              Your cart is empty.
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.cartItemId}
                style={{
                  display: "flex",
                  borderBottom: "1px solid #eaeaea",
                  paddingBottom: "15px",
                  marginBottom: "15px",
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* Each item: Pizza name, customizations, quantity, price[cite: 1] */}
                  <h4 style={{ margin: "0 0 5px 0" }}>{item.name}</h4>

                  {item.customizations && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      <div>Base: {item.customizations.base?.name}</div>
                      <div>Sauce: {item.customizations.sauce?.name}</div>
                      <div>Cheese: {item.customizations.cheese?.name}</div>
                      {item.customizations.vegetables?.length > 0 && (
                        <div>
                          Veggies: {item.customizations.vegetables.join(", ")}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ fontWeight: "bold", color: "#ff4d4f" }}>
                    ₹{item.price * item.quantity}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4d4f",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Remove
                  </button>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "4px",
                      padding: "2px",
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        width: "25px",
                        height: "25px",
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        width: "25px",
                        height: "25px",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div
            style={{
              padding: "20px",
              borderTop: "1px solid #eaeaea",
              backgroundColor: "#f9f9f9",
            }}
          >
            {/* Apply coupon code field (optional feature)[cite: 1] */}
            <div style={{ display: "flex", marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="Coupon Code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px 0 0 4px",
                }}
              />
              <button
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "0 4px 4px 0",
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              <span>Subtotal:</span>
              <span>₹{getSubtotal()}</span>
            </div>

            <button
              onClick={handleCheckout}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#ff4d4f",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
