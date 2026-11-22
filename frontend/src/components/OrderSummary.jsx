import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

// Helper to load Razorpay SDK dynamically
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const OrderSummary = () => {
  const navigate = useNavigate();
  const { cartItems, getSubtotal, setIsCartOpen } = useCart();

  // Safely calculate pricing to prevent NaN errors from crashing Razorpay
  const subtotal = Number(getSubtotal()) || 0;
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const grandTotal = subtotal + tax + deliveryFee;

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    postalCode: "",
    phone: "",
    instructions: "",
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userStr =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setFormData((prev) => ({
        ...prev,
        phone: user.phone || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        postalCode: user.address?.postalCode || "",
      }));
    }

    if (cartItems.length === 0) {
      navigate("/dashboard");
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleBackToCart = () => {
    setIsCartOpen(true);
    navigate(-1);
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    if (grandTotal <= 0) {
      return setError("Your cart total is invalid.");
    }

    if (
      !formData.street ||
      !formData.city ||
      !formData.postalCode ||
      !formData.phone
    ) {
      return setError("Please fill in all required delivery fields.");
    }

    setLoading(true);

    try {
      // 1. Save Address if requested
      if (saveAddress) {
        await api.put("/users/profile", {
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            postalCode: formData.postalCode,
          },
        });

        const userStr =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.phone = formData.phone;
          user.address = {
            street: formData.street,
            city: formData.city,
            postalCode: formData.postalCode,
          };
          localStorage.getItem("token")
            ? localStorage.setItem("user", JSON.stringify(user))
            : sessionStorage.setItem("user", JSON.stringify(user));
        }
      }

      // 2. Load Razorpay Script
      const isRazorpayLoaded = await loadRazorpay();
      if (!isRazorpayLoaded) {
        setError("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // 3. Generate a secure Razorpay Order ID from your backend to prevent iframe loops
      const { data: paymentData } = await api.post("/payments/razorpay/order", {
        amount: Math.round(grandTotal * 100),
      });

      // 4. Initialize Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_ToHdrm13xItaG7",
        amount: Math.round(grandTotal * 100),
        currency: "INR",
        name: "PizzaDash",
        description: "Pizza Order Checkout",
        order_id: paymentData.razorpayOrderId, // Secure ID handshake
        handler: async function (response) {
          try {
            // Payment Successful -> Create Order in Database
            const orderPayload = {
              items: cartItems,
              deliveryAddress: {
                address: formData.street,
                city: formData.city,
                postalCode: formData.postalCode,
                instructions: formData.instructions,
              },
              pricing: { subtotal, tax, deliveryFee, grandTotal },
              payment: {
                method: "Razorpay",
                transactionId: response.razorpay_payment_id,
              },
            };

            const createRes = await api.post("/orders/create", orderPayload);

            if (createRes.data.success) {
              navigate(`/orders/${createRes.data._id}/success`);
            }
          } catch (err) {
            setError(
              "Payment successful, but failed to save order to database. Please contact support.",
            );
            setLoading(false); // Stop loading on API failure
          }
        },
        modal: {
          ondismiss: function () {
            // Stop the loading spinner if the user closes the payment window
            setLoading(false);
          },
        },
        prefill: {
          contact: formData.phone,
        },
        theme: {
          color: "#52c41a",
        },
      };

      // 5. Open Razorpay Window
      const paymentObject = new window.Razorpay(options);

      // Catch modal errors so loading state resets cleanly
      paymentObject.on("payment.failed", function (response) {
        setError("Payment failed: " + response.error.description);
        setLoading(false);
      });

      paymentObject.open();
    } catch (err) {
      setError("Failed to process checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "0 20px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "40px",
      }}
    >
      {/* LEFT COLUMN: Delivery Details */}
      <div>
        <h2 style={{ marginBottom: "20px" }}>Checkout</h2>

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#ffe6e6",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleProceedToPayment}>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #eaeaea",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: "0 0 15px 0" }}>Delivery Address</h3>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Street Address *
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Delivery Instructions (Optional)
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows="3"
                placeholder="E.g., Leave at the front door"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
              />
              Save this address for future orders
            </label>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #eaeaea",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: "0 0 15px 0" }}>Payment Method</h3>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "15px",
                border: "1px solid #ff4d4f",
                borderRadius: "4px",
                backgroundColor: "#fff0f0",
              }}
            >
              <input
                type="radio"
                name="payment"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                readOnly
              />
              <strong>Razorpay (Credit/Debit, UPI, NetBanking)</strong>
            </label>
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <button
              type="button"
              onClick={handleBackToCart}
              style={{
                flex: 1,
                padding: "15px",
                backgroundColor: "#fff",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: "15px",
                backgroundColor: "#52c41a",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? "Processing..."
                : `Proceed to Payment (₹${grandTotal})`}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Order Review */}
      <div>
        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "25px",
            borderRadius: "8px",
            border: "1px solid #eaeaea",
            position: "sticky",
            top: "90px",
          }}
        >
          <h3
            style={{
              margin: "0 0 20px 0",
              borderBottom: "2px solid #ddd",
              paddingBottom: "10px",
            }}
          >
            Order Review
          </h3>

          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              marginBottom: "20px",
            }}
          >
            {cartItems.map((item) => (
              <div
                key={item.cartItemId || item.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  paddingBottom: "15px",
                  borderBottom: "1px dashed #ddd",
                }}
              >
                <div style={{ flex: 1, paddingRight: "15px" }}>
                  <div style={{ fontWeight: "bold" }}>{item.name}</div>
                  {item.customizations && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "5px",
                      }}
                    >
                      {item.customizations.base?.name},{" "}
                      {item.customizations.sauce?.name},{" "}
                      {item.customizations.cheese?.name}
                      {item.customizations.vegetables?.length > 0 &&
                        ` + ${item.customizations.vegetables.join(", ")}`}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      marginBottom: "5px",
                    }}
                  >
                    Qty: {item.quantity}
                  </div>
                  <div style={{ fontWeight: "bold" }}>
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              color: "#555",
            }}
          >
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              color: "#555",
            }}
          >
            <span>Tax (5%)</span>
            <span>₹{tax}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
              color: "#555",
            }}
          >
            <span>Delivery Fee</span>
            <span>₹{deliveryFee}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "2px solid #ddd",
              paddingTop: "15px",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ff4d4f",
            }}
          >
            <span>Grand Total</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
