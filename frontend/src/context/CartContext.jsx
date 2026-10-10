import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage if available
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add pizza to cart with customizations
  const addToCart = (pizza, customizations = null, quantity = 1) => {
    setCartItems((prev) => {
      // Create a unique ID based on pizza ID and customizations to allow multiple variations of the same pizza
      const cartItemId = `${pizza._id}-${JSON.stringify(customizations)}`;

      const existingItem = prev.find((item) => item.cartItemId === cartItemId);
      if (existingItem) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...prev, { ...pizza, cartItemId, customizations, quantity }];
    });

    // Show confirmation toast: "Pizza added to cart!"
    alert("Pizza added to cart!");
  };

  // Remove item button for each pizza[cite: 1]
  const removeFromCart = (cartItemId) => {
    setCartItems((prev) =>
      prev.filter((item) => item.cartItemId !== cartItemId),
    );
  };

  // Quantity +/- buttons[cite: 1]
  const updateQuantity = (cartItemId, amount) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQuantity = item.quantity + amount;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }),
    );
  };

  // Subtotal calculation[cite: 1]
  const getSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getSubtotal,
        getCartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
