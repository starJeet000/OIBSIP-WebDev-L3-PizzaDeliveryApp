# Changelog

## [Unreleased] - 2026/10/21

### Added

- **Feature 4.4: Automated Stock Notifications**
  - **Email Engine:** Configured `nodemailer` with a Gmail SMTP transport to dispatch professional HTML low-stock alerts directly to the admin.
  - **Cron Scheduling:** Integrated `node-cron` to execute a background inventory audit every hour (`0 * * * *`), utilizing a `lastNotificationSentAt` timestamp to prevent email spam.
  - **Order Depletion Engine:** Engineered the `depleteStockForOrder` controller to parse custom pizza configurations upon successful checkout, automatically deducting the exact bases, sauces, cheeses, and vegetables from the active MongoDB inventory.

- **Feature 4.3: Inventory Management Dashboard**
  - **Tabular Interface:** Built `InventoryDashboard.jsx` to display all ingredients (Bases, Sauces, Cheeses, Veggies) with server-side pagination (20 items/page).
  - **Visual Status Indicators:** Implemented dynamic stock badges (Green=OK, Yellow=Low, Red=Critical) based on individual minimum thresholds.
  - **Stock Update Form:** Created an interactive side-panel to manually Add or Set stock quantities, complete with reason/notes tracking and MongoDB audit trails.
  - **System Alerts UI:** Added a real-time notification bell and modal to the Admin Dashboard to immediately flag ingredients falling below safe levels.

## [Unreleased] - 2026/10/17

### Added

- **Feature 4.2: Admin Dashboard**
  - **Analytics UI:** Built `AdminDashboard.jsx` featuring dynamic metric cards (Revenue, Active Orders, New Users).
  - **Data Visualization:** Integrated `recharts` to render a 7-day revenue line chart, an hourly order volume area chart, and a top-selling pizzas bar chart.
  - **Layout Isolation:** Implemented a clean CSS reset and an `AppLayout` wrapper to completely decouple the Admin UI from the User UI navigation and global wrappers.
  - **Backend Aggregation:** Developed the `getDashboardMetrics` controller to dynamically calculate real-time platform statistics from MongoDB collections.

- **Feature 4.1: Admin Authentication**
  - **Role-Based Access Control:** Implemented backend `admin` middleware to strictly protect administrative routes.
  - **Dedicated Login Flow:** Created `/admin/login` page isolated from user registration, enforcing a 1-hour auto-logout JWT session limit.
  - **Database Seeding:** Created `seedAdmin.js` utility to securely generate initial administrative credentials bypassing standard registration.

## [Unreleased] - 2026/10/16

- **Fix: React Router Import Resolution**
  - Corrected component paths in `App.jsx` to correctly map `LoginForm.jsx`, `RegisterForm.jsx`, and `UserDashboard.jsx` from the `components/` directory instead of `pages/`.

### Added

- **Feature 4.2: Admin Dashboard**
  - **Analytics UI:** Built `AdminDashboard.jsx` featuring dynamic metric cards (Revenue, Active Orders, New Users).
  - **Data Visualization:** Integrated `recharts` to render a 7-day revenue trend line chart and a top-selling pizzas bar chart.
  - **Admin Navigation:** Created a dedicated secure sidebar for routing between Inventory, Orders, and System metrics.
  - **Backend Aggregation:** Developed the `getDashboardMetrics` controller to dynamically calculate real-time platform statistics from MongoDB collections.

- **Feature 4.1: Admin Authentication**
  - **Role-Based Access Control:** Implemented backend `admin` middleware to strictly protect administrative routes.
  - **Dedicated Login Flow:** Created `/admin/login` page isolated from user registration, enforcing a 1-hour auto-logout JWT session limit.

- **Feature 3.6: Real-Time Order Tracking**
  - **Tracking Dashboard:** Created `OrderTracking.jsx` to visualize the exact progress timeline (`Order Received` -> `Delivered`).
  - **Live Polling:** Implemented 10-second `setInterval` polling to fetch live status updates from the backend without page refreshes.
  - **Delivery Integration:** Added dynamic UI rendering for estimated delivery times and assigned delivery person details.
  - **Order History Engine:** Built `OrderHistory.jsx` with server-side pagination (10 per page), dynamic multi-filter arrays (Status, Date range), Order ID search, and a one-click "Reorder" function mapping directly into the CartContext.
  - **Global Routing:** Unified all components in `App.jsx` using `react-router-dom`, persistent `Navigation`, and global `CartDrawer` overlay.

- **Feature 3.5: Payment Integration**
  - **Razorpay Setup:** Configured Razorpay SDK on the Node.js backend with secure cryptographic signature verification (`crypto.createHmac`).
  - **Checkout Flow:** Built the frontend Razorpay modal initialization in `OrderSummary.jsx`, pre-filling user profiles and handling both success (DB creation, cart clearing) and failure (UI error toasts) states.
  - **Order Persistence:** Developed the robust MongoDB `Order` schema to immutably store cart customizations, transaction IDs, and pricing breakdowns post-verification.
  - **Email Confirmation:** Integrated Nodemailer with Gmail SMTP to automatically dispatch formatted HTML order receipts containing live tracking links upon successful payment verification.

## [Unreleased] - 2026/10/03

### Added

- **Feature 3.4: Order Management**
  - **Shopping Cart System:** Implemented a global `CartContext` for state management, allowing users to add customized pizzas from both the catalog and the builder. Added a dynamic cart icon in the navigation bar reflecting the current item count[cite: 1].
  - **Cart Drawer UI:** Built an interactive slide-out cart drawer featuring item removal, quantity adjustment (+/- buttons), subtotal calculation, and an optional coupon code field[cite: 1].
  - **Checkout & Order Summary:** Created a comprehensive checkout page displaying a full order review (itemized prices, 5% tax calculation, and delivery fees) alongside a delivery address form with a "Save address for future orders" feature updating the user's profile[cite: 1].
  - **Payment Preparation:** Configured the final "Proceed to Payment" flow with Razorpay set as the default, non-editable payment method[cite: 1].

## [Unreleased] - 2026/10/02

### Added

- **Feature 3.3: Custom Pizza Builder**
  - **Multi-Step Architecture:** Engineered a 4-step interactive form (Base -> Sauce -> Cheese -> Vegetables) with a visual progress indicator.
  - **Dynamic Pricing Engine:** Implemented a real-time price calculator that tallies base prices, premium sauce/cheese add-ons, and a ₹20 per-item vegetable surcharge.
  - **State Management & Validation:** Enforced a max-5 vegetable limit, disabled forward navigation until mandatory selections are made, and preserved selections during backward navigation.
  - **Order Preview:** Added a comprehensive summary panel detailing all selections and individual costs before final completion.

- **Feature 3.2: User Dashboard & Profile**
  - **Global Navigation:** Added responsive top navigation with contextual links (Login/Register vs. Profile/Orders/Logout) based on authentication state.
  - **Main Dashboard Layout:** Built personalized welcome banner, quick stat cards (recent orders, total spent, member since), and "Order Now" CTA.
  - **Pizza Catalog (Grid View):** Created a responsive grid displaying pizza cards with 2-line descriptions, dynamic pricing, and vegetarian/non-vegetarian visual indicators.
  - **Search & Filtering:** Implemented debounced real-time search, category filtering (Veg/Non-Veg), and a dynamic max-price range slider.
  - **Pagination:** Added server-side pagination controls limiting the display to 8 pizzas per page.
  - **User Profile Management:** Built an interface to view and edit personal details and delivery addresses, alongside a strict password change form.
  - **Order History:** Implemented a chronological list of past orders featuring status badges, total amounts, and an expandable toggle to view specific item customizations and delivery details.

## [Unreleased] - 2026/10/02

### Added

- **Feature 3.1: User Authentication Complete**
  - **Registration Flow:** Implemented user creation with `bcrypt` password hashing, duplicate email checks, minimum 8-character password validation, and dynamic UI password strength indicator.
  - **Email Verification:** Integrated `nodemailer` to dispatch secure verification links upon signup, updating the MongoDB `isEmailVerified` flag upon validation.
  - **Login & JWT Management:** Implemented authentication endpoint returning a 7-day expiration JWT. Built frontend login UI with conditional `localStorage`/`sessionStorage` usage based on the "Remember Me" toggle.
  - **API Security:** Created an Axios interceptor to globally attach `Authorization: Bearer <token>` headers and automatically force client logout upon intercepting a `401 Unauthorized` response. Built backend `authMiddleware` to protect private routes.
  - **Forgot Password Flow:** Engineered a secure password reset pipeline featuring 1-hour expiring tokens, email link delivery via Nodemailer, and strict regex-based password complexity validation on the frontend reset form.
