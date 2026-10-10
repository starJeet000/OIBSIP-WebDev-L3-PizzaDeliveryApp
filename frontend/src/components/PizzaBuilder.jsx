import React, { useState } from "react";
import { useCart } from "../context/CartContext"; // Import useCart
import { useNavigate } from "react-router-dom"; // Import useNavigate

const PizzaBuilder = () => {
  const { addToCart, setIsCartOpen } = useCart(); // Consume cart context
  const navigate = useNavigate();

  // Pizza Builder State Management[cite: 1]
  const [currentStep, setCurrentStep] = useState(1);
  const [pizzaConfig, setPizzaConfig] = useState({
    base: null,
    sauce: null,
    cheese: null,
    vegetables: [],
  });

  // Step 1: 5 base options with varying prices and descriptions[cite: 1]
  const bases = [
    {
      id: "thin",
      name: "Thin Crust",
      price: 150,
      desc: "Crispy and thin, perfect for toppings",
    },
    {
      id: "thick",
      name: "Thick Crust",
      price: 180,
      desc: "Soft and chewy with a satisfying bite",
    },
    {
      id: "stuffed",
      name: "Stuffed Crust",
      price: 220,
      desc: "Oozing with cheese baked right into the crust",
    },
    {
      id: "wheat",
      name: "Whole Wheat",
      price: 160,
      desc: "A healthier, earthy alternative",
    },
    {
      id: "glutenFree",
      name: "Gluten-Free",
      price: 200,
      desc: "Light and crispy, 100% gluten-free",
    },
  ];

  // Step 2: 5 sauce options[cite: 1]
  const sauces = [
    {
      id: "tomato",
      name: "Tomato",
      price: 0,
      desc: "Classic tangy marinara flavor profile",
    },
    {
      id: "white",
      name: "White Cream",
      price: 30,
      desc: "Rich, creamy Alfredo style sauce",
    },
    {
      id: "bbq",
      name: "BBQ",
      price: 50,
      desc: "Smoky, sweet, and tangy barbecue base",
    },
    {
      id: "pesto",
      name: "Pesto",
      price: 40,
      desc: "Fresh basil, garlic, and parmesan blend",
    },
    {
      id: "garlic",
      name: "Garlic",
      price: 20,
      desc: "Roasted garlic and olive oil infusion",
    },
  ];

  // Step 3: Cheese options[cite: 1]
  const cheeses = [
    {
      id: "regular",
      name: "Regular Mozzarella",
      price: 0,
      desc: "Classic stretchy cheese",
      calories: "250 kcal",
    },
    {
      id: "extra",
      name: "Extra Mozzarella",
      price: 80,
      desc: "Double the classic stretchy cheese",
      calories: "350 kcal",
    },
    {
      id: "mixed",
      name: "Mixed Cheese",
      price: 100,
      desc: "Cheddar, Parmesan, and Mozzarella blend",
      calories: "320 kcal",
    },
    {
      id: "vegan",
      name: "Vegan Cheese",
      price: 120,
      desc: "100% plant-based dairy-free melt",
      calories: "200 kcal",
    },
  ];

  // Step 4: Available vegetables (15+)[cite: 1]
  const vegetablesList = [
    "Onions",
    "Bell Peppers",
    "Mushrooms",
    "Tomatoes",
    "Olives",
    "Pineapple",
    "Spinach",
    "Broccoli",
    "Corn",
    "Jalapenos",
    "Basil",
    "Garlic",
    "Black Olives",
    "Green Peppers",
    "Sun-dried Tomatoes",
  ];

  const handleBaseSelect = (base) => setPizzaConfig({ ...pizzaConfig, base });
  const handleSauceSelect = (sauce) =>
    setPizzaConfig({ ...pizzaConfig, sauce });
  const handleCheeseSelect = (cheese) =>
    setPizzaConfig({ ...pizzaConfig, cheese });

  const handleVegetableToggle = (veg) => {
    const isSelected = pizzaConfig.vegetables.includes(veg);
    if (isSelected) {
      setPizzaConfig({
        ...pizzaConfig,
        vegetables: pizzaConfig.vegetables.filter((v) => v !== veg),
      });
    } else {
      // Max 5 vegetables can be selected[cite: 1]
      if (pizzaConfig.vegetables.length < 5) {
        setPizzaConfig({
          ...pizzaConfig,
          vegetables: [...pizzaConfig.vegetables, veg],
        });
      } else {
        alert("Maximum of 5 vegetables allowed.");
      }
    }
  };

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handlePrevious = () => setCurrentStep((prev) => prev - 1); // Previous button should preserve data[cite: 1]

  // Calculate cumulative price at each step[cite: 1]
  const calculateTotal = () => {
    let total = 0;
    if (pizzaConfig.base) total += pizzaConfig.base.price;
    if (pizzaConfig.sauce) total += pizzaConfig.sauce.price;
    if (pizzaConfig.cheese) total += pizzaConfig.cheese.price;
    if (pizzaConfig.vegetables.length > 0) {
      total += pizzaConfig.vegetables.length * 20; // Each vegetable adds ₹20 to price[cite: 1]
    }
    return total;
  };

  const handleCompleteOrder = () => {
    // Generate a temporary mock pizza object for the custom creation
    const customPizza = {
      _id: `custom-${Date.now()}`,
      name: "Custom Built Pizza",
      price: calculateTotal(),
      isVegetarian: true, // Customizable pizzas can be assumed veg based on ingredients, or flagged
      image: "https://via.placeholder.com/300x200?text=Custom+Pizza",
    };

    // On completion, store pizza config in Order state or Context[cite: 1]
    addToCart(customPizza, pizzaConfig, 1);
    setIsCartOpen(true); // Open the drawer
    navigate("/dashboard"); // Redirect to a generic page like dashboard while drawer is open
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        Build Your Custom Pizza
      </h2>

      {/* Multi-step form progress indicator[cite: 1] */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "40px",
          position: "relative",
        }}
      >
        {["Base", "Sauce", "Cheese", "Veggies"].map((stepName, index) => (
          <div
            key={index}
            style={{
              textAlign: "center",
              flex: 1,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                margin: "0 auto 10px auto",
                borderRadius: "50%",
                backgroundColor:
                  currentStep >= index + 1 ? "#ff4d4f" : "#e8e8e8",
                color: currentStep >= index + 1 ? "white" : "#666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                transition: "all 0.3s",
              }}
            >
              {index + 1}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: currentStep >= index + 1 ? "#ff4d4f" : "#666",
                fontWeight: currentStep >= index + 1 ? "bold" : "normal",
              }}
            >
              {stepName}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Choose Pizza Base[cite: 1] */}
      {currentStep === 1 && (
        <div className="step-container">
          <h3 style={{ marginBottom: "20px" }}>Step 1: Choose Your Base</h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}
          >
            {bases.map((base) => (
              <div
                key={base.id}
                onClick={() => handleBaseSelect(base)}
                style={{
                  padding: "20px",
                  border:
                    pizzaConfig.base?.id === base.id
                      ? "2px solid #ff4d4f"
                      : "1px solid #ddd", // Current selection highlighted[cite: 1]
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor:
                    pizzaConfig.base?.id === base.id ? "#fff0f0" : "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>
                    {base.name}
                  </h4>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                    {base.desc}
                  </p>
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#ff4d4f",
                    fontSize: "16px",
                  }}
                >
                  ₹{base.price}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "30px",
            }}
          >
            <button
              onClick={handleNext}
              disabled={!pizzaConfig.base} // Prevent proceeding without selection[cite: 1]
              style={{
                padding: "12px 30px",
                backgroundColor: pizzaConfig.base ? "#ff4d4f" : "#ffa3a5",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: pizzaConfig.base ? "pointer" : "not-allowed",
                fontWeight: "bold",
              }}
            >
              Next: Choose Sauce
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Choose Sauce[cite: 1] */}
      {currentStep === 2 && (
        <div className="step-container">
          <h3 style={{ marginBottom: "20px" }}>Step 2: Choose Your Sauce</h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}
          >
            {sauces.map((sauce) => (
              <div
                key={sauce.id}
                onClick={() => handleSauceSelect(sauce)}
                style={{
                  padding: "20px",
                  border:
                    pizzaConfig.sauce?.id === sauce.id
                      ? "2px solid #ff4d4f"
                      : "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor:
                    pizzaConfig.sauce?.id === sauce.id ? "#fff0f0" : "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>
                    {sauce.name}
                  </h4>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                    {sauce.desc}
                  </p>
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#ff4d4f",
                    fontSize: "16px",
                  }}
                >
                  {sauce.price === 0 ? "Free" : `+₹${sauce.price}`}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
            }}
          >
            <button
              onClick={handlePrevious}
              style={{
                padding: "12px 30px",
                backgroundColor: "#fff",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!pizzaConfig.sauce}
              style={{
                padding: "12px 30px",
                backgroundColor: pizzaConfig.sauce ? "#ff4d4f" : "#ffa3a5",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: pizzaConfig.sauce ? "pointer" : "not-allowed",
                fontWeight: "bold",
              }}
            >
              Next: Choose Cheese
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Choose Cheese Type[cite: 1] */}
      {currentStep === 3 && (
        <div className="step-container">
          <h3 style={{ marginBottom: "20px" }}>Step 3: Choose Your Cheese</h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}
          >
            {cheeses.map((cheese) => (
              <div
                key={cheese.id}
                onClick={() => handleCheeseSelect(cheese)}
                style={{
                  padding: "20px",
                  border:
                    pizzaConfig.cheese?.id === cheese.id
                      ? "2px solid #ff4d4f"
                      : "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor:
                    pizzaConfig.cheese?.id === cheese.id ? "#fff0f0" : "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>
                    {cheese.name}
                  </h4>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                    {cheese.desc} | {cheese.calories}
                  </p>
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#ff4d4f",
                    fontSize: "16px",
                  }}
                >
                  {cheese.price === 0 ? "Free" : `+₹${cheese.price}`}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
            }}
          >
            <button
              onClick={handlePrevious}
              style={{
                padding: "12px 30px",
                backgroundColor: "#fff",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!pizzaConfig.cheese}
              style={{
                padding: "12px 30px",
                backgroundColor: pizzaConfig.cheese ? "#ff4d4f" : "#ffa3a5",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: pizzaConfig.cheese ? "pointer" : "not-allowed",
                fontWeight: "bold",
              }}
            >
              Next: Choose Veggies
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Choose Vegetables[cite: 1] */}
      {currentStep === 4 && (
        <div className="step-container">
          <h3 style={{ marginBottom: "10px" }}>
            Step 4: Choose Vegetables (Max 5)
          </h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            +₹20 for each vegetable selected.
          </p>

          {/* Show selected vegetables in a tag/chip format[cite: 1] */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {pizzaConfig.vegetables.map((veg) => (
              <span
                key={veg}
                style={{
                  padding: "5px 12px",
                  backgroundColor: "#ff4d4f",
                  color: "#fff",
                  borderRadius: "16px",
                  fontSize: "14px",
                }}
              >
                {veg} &times;
              </span>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "15px",
            }}
          >
            {vegetablesList.map((veg) => (
              <label
                key={veg}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: pizzaConfig.vegetables.includes(veg)
                    ? "#fff0f0"
                    : "#fff",
                }}
              >
                <input
                  type="checkbox"
                  checked={pizzaConfig.vegetables.includes(veg)}
                  onChange={() => handleVegetableToggle(veg)}
                  style={{ cursor: "pointer" }}
                />
                {veg}
              </label>
            ))}
          </div>

          {/* Order preview: Summary of Base + Sauce + Cheese + Veggies + Total Price[cite: 1] */}
          <div
            style={{
              marginTop: "40px",
              padding: "20px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
            }}
          >
            <h4 style={{ margin: "0 0 15px 0", color: "#166534" }}>
              Order Preview
            </h4>
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                margin: 0,
                color: "#15803d",
              }}
            >
              <li style={{ marginBottom: "8px" }}>
                <strong>Base:</strong> {pizzaConfig.base?.name} (₹
                {pizzaConfig.base?.price})
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Sauce:</strong> {pizzaConfig.sauce?.name} (₹
                {pizzaConfig.sauce?.price})
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Cheese:</strong> {pizzaConfig.cheese?.name} (₹
                {pizzaConfig.cheese?.price})
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Veggies:</strong>{" "}
                {pizzaConfig.vegetables.length > 0
                  ? pizzaConfig.vegetables.join(", ")
                  : "None"}
                {pizzaConfig.vegetables.length > 0 &&
                  ` (+₹${pizzaConfig.vegetables.length * 20})`}
              </li>
            </ul>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
            }}
          >
            <button
              onClick={handlePrevious}
              style={{
                padding: "12px 30px",
                backgroundColor: "#fff",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Back
            </button>
            <button
              onClick={handleCompleteOrder}
              style={{
                padding: "12px 30px",
                backgroundColor: "#52c41a",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Complete Order
            </button>
          </div>
        </div>
      )}

      {/* Cumulative price displayed at each step[cite: 1] */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          textAlign: "right",
          fontWeight: "bold",
          fontSize: "18px",
          border: "1px solid #eaeaea",
        }}
      >
        Running Total: ₹{calculateTotal()}
      </div>
    </div>
  );
};

export default PizzaBuilder;
