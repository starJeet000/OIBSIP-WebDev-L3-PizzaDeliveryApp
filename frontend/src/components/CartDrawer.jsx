import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const AVAILABLE_COUPONS = {
  PIZZA10: {
    code: "PIZZA10",
    type: "percent",
    value: 10,
    maxDiscount: 150,
    minOrder: 0,
    label: "10% OFF (up to ₹150)",
  },
  WELCOME50: {
    code: "WELCOME50",
    type: "flat",
    value: 50,
    minOrder: 250,
    label: "₹50 OFF on ₹250+",
  },
  FEAST100: {
    code: "FEAST100",
    type: "flat",
    value: 100,
    minOrder: 500,
    label: "₹100 OFF on ₹500+",
  },
};

export const calculateCouponDiscount = (couponObj, subtotal) => {
  if (!couponObj || subtotal <= 0) return 0;
  if (subtotal < (couponObj.minOrder || 0)) return 0;

  if (couponObj.type === "percent") {
    const raw = Math.round((subtotal * couponObj.value) / 100);
    return couponObj.maxDiscount ? Math.min(raw, couponObj.maxDiscount) : raw;
  }
  return Math.min(couponObj.value, subtotal);
};

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

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = sessionStorage.getItem("appliedCoupon");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [couponFeedback, setCouponFeedback] = useState({ text: "", type: "" });

  const subtotal = Number(getSubtotal()) || 0;
  const discount = calculateCouponDiscount(appliedCoupon, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - discount);

  // Clear or warn if subtotal drops below coupon minimum
  useEffect(() => {
    if (!appliedCoupon) return;
    if (subtotal === 0) {
      setAppliedCoupon(null);
      sessionStorage.removeItem("appliedCoupon");
      setCouponFeedback({ text: "", type: "" });
    } else if (subtotal < appliedCoupon.minOrder) {
      setCouponFeedback({
        text: `Add ₹${appliedCoupon.minOrder - subtotal} more to keep ${appliedCoupon.code} active.`,
        type: "error",
      });
    } else {
      setCouponFeedback({
        text: `${appliedCoupon.code} applied (${appliedCoupon.label})`,
        type: "success",
      });
    }
  }, [subtotal, appliedCoupon]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const normalized = couponInput.trim().toUpperCase();
    if (!normalized) {
      setCouponFeedback({ text: "Please enter a coupon code.", type: "error" });
      return;
    }

    const found = AVAILABLE_COUPONS[normalized];
    if (!found) {
      setCouponFeedback({
        text: "Invalid code. Try PIZZA10, WELCOME50, or FEAST100.",
        type: "error",
      });
      return;
    }

    if (subtotal < found.minOrder) {
      setCouponFeedback({
        text: `${found.code} requires a minimum subtotal of ₹${found.minOrder}.`,
        type: "error",
      });
      return;
    }

    setAppliedCoupon(found);
    sessionStorage.setItem("appliedCoupon", JSON.stringify(found));
    setCouponInput("");
    setCouponFeedback({
      text: `${found.code} applied (${found.label})`,
      type: "success",
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    sessionStorage.removeItem("appliedCoupon");
    setCouponFeedback({ text: "", type: "" });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
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
            {/* Coupon Code Input */}
            <form
              onSubmit={handleApplyCoupon}
              style={{ display: "flex", marginBottom: "8px" }}
            >
              <input
                type="text"
                placeholder="Coupon Code (e.g. PIZZA10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px 0 0 4px",
                }}
              />
              <button
                type="submit"
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
            </form>

            {couponFeedback.text && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                  marginBottom: "12px",
                  color:
                    couponFeedback.type === "success" ? "#389e0d" : "#cf1322",
                }}
              >
                <span>{couponFeedback.text}</span>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4d4f",
                      cursor: "pointer",
                      fontSize: "12px",
                      textDecoration: "underline",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: discount > 0 ? "8px" : "20px",
                fontSize: "16px",
                color: "#555",
              }}
            >
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>

            {discount > 0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "15px",
                    color: "#389e0d",
                    fontWeight: "bold",
                  }}
                >
                  <span>Discount ({appliedCoupon.code}):</span>
                  <span>-₹{discount}</span>
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
                  <span>Estimated Total:</span>
                  <span>₹{discountedSubtotal}</span>
                </div>
              </>
            )}

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
