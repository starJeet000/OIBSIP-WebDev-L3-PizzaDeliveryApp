import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Global Components
import Navigation from "./components/Navigation";
import CartDrawer from "./components/CartDrawer";

// Feature 3.1: Auth Components
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

// Feature 3.2 & 3.6: Dashboards & Profile
import UserDashboard from "./components/UserDashboard";
import UserProfile from "./pages/UserProfile";
import OrderHistory from "./pages/OrderHistory";

// Feature 3.3, 3.4 & 3.5: Ordering Flow
import PizzaBuilder from "./components/PizzaBuilder";
import OrderSummary from "./components/OrderSummary";
import OrderTracking from "./pages/OrderTracking";

// Feature 4.1 & 4.2: Admin Panel
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InventoryDashboard from "./pages/admin/InventoryDashboard";

// Layout wrapper to completely separate Admin UI from User UI
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // If we are on an admin page, return ONLY the admin component.
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Otherwise, render the standard User UI layout
  return (
    <>
      <Navigation />
      <CartDrawer />
      <main
        style={{
          minHeight: "calc(100vh - 70px)",
          backgroundColor: "#f0f2f5",
          paddingBottom: "40px",
        }}
      >
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* User Routes */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders" element={<OrderHistory />} />

          {/* Order & Checkout Routes */}
          <Route path="/builder" element={<PizzaBuilder />} />
          <Route path="/checkout" element={<OrderSummary />} />
          <Route path="/orders/:id/success" element={<OrderTracking />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/inventory" element={<InventoryDashboard />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
