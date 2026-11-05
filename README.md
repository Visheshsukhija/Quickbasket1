# QuickBasket

> **Everything You Need, Delivered Fresh and Fast.**

QuickBasket is a commercial-grade, full-stack hyperlocal grocery, food, kitchen essentials, and delivery management platform inspired by Blinkit, Zepto, and Instamart. It features an integrated 10-minute delivery dispatch engine, live route tracking with customer OTP verification, a 300+ item grocery and crockery catalog, a 30-dish Indian recipe book with automatic inventory-to-cart matching, and an executive warehouse management console with predictive demand forecasting.

---

## 🌟 Key Features

### 1. Multi-Role Architecture & RBAC
Three completely separated user roles with dedicated interfaces, permissions, and workflows:
- **Customer**: Browse 17 categories, real-time customer-safe inventory visibility (`In Stock`, `Only 3 left!`, `Out of Stock`), live dynamic search with autocomplete, slide-over cart drawer with promotional coupons (`QUICK50`, `FREEDEL`), 5% GST tax breakdown, and instant checkout (UPI, COD, Card Demo).
- **Delivery Partner**: Shift metrics dashboard (completed orders, distance, earnings), real-time assigned order queue, turn-by-turn navigation map modal, and mandatory customer OTP delivery closure.
- **Admin**: Executive KPIs (gross revenue, order counts, catalog metrics), full inventory CRUD, 1-click stock adjustments, low-stock restock alerts with suggested purchase orders, supplier management, and predictive demand burn-rate forecasting.

### 2. 320+ Realistic Products Across 17 Categories
- Fruits (20 items)
- Vegetables (25 items)
- Dairy (20 items)
- Rice and Grains (20 items)
- Dal and Pulses (20 items)
- Snacks and Chips (25 items)
- Beverages (20 items)
- Bakery (15 items)
- Spices and Masalas (20 items)
- Cooking Oils and Ghee (15 items)
- Instant Food (20 items)
- Frozen Food (10 items)
- Personal Care (15 items)
- Cleaning Supplies (15 items)
- Crockery & Tableware (15 items)
- Kitchen Essentials & Cookware (15 items)
- Dry Fruits & Seeds (10 items)

### 3. Recipe Book & Smart Inventory Matcher
- 30 authentic Indian recipes (*Royal Vegetable Biryani*, *Paneer Butter Masala*, *Amritsari Chole Bhature*, *Dal Makhani*, *Indori Poha*, *Indo-Chinese Fried Rice*, *Pav Bhaji*, etc.)
- Step-by-step instructions, preparation & cooking times, and nutritional facts (calories, protein, carbs, fats).
- **1-Click "Add All Available Ingredients to Cart"**: Scans live dark-store stock, matches recipe ingredients to product SKUs, calculates total price, adds in-stock items to basket, and lists pantry staples.

### 4. Live Order Tracking & OTP Verification
- 7-stage order lifecycle: *Order Placed* $\to$ *Order Confirmed* $\to$ *Preparing Order* $\to$ *Ready for Pickup* $\to$ *Delivery Partner Assigned* $\to$ *Out for Delivery* $\to$ *Delivered*.
- 4-digit Delivery OTP generated per order.
- Simulated delivery route map with animated rider marker.
- Verified delivery partner profile with direct calling.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Customer** | Priya Sundaram | `customer@quickbasket.com` | `cust123` |
| **Delivery Partner** | Ramesh Kumar | `delivery@quickbasket.com` | `rider123` |
| **Admin** | Aditi Sharma | `admin@quickbasket.com` | `admin123` |

*(A quick-switch testing bar is also available at the top of the interface for instantaneous 1-click role switching without re-authenticating)*.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Framer Motion, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript (`tsx`), REST APIs.
- **Storage**: In-memory relational store with ACID-safe stock transactions and JSON backup.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/Visheshsukhija/QuickBasket.git
cd QuickBasket

# Install dependencies
npm install

# Start full-stack development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📄 License
Apache-2.0
