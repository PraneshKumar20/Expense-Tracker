# ⚡ Aetheria // Expense Tracker & Financial Intelligence

An enterprise-grade, high-performance personal finance command center engineered with **React 19**, **Vite**, **Tailwind CSS**, **Framer Motion**, and a robust **Node.js/Express + MongoDB** backend.

---

## 🌟 Key Features

### 1. 🎛️ Financial Command Center
- **Total Net Balance HUD**: Real-time cashflow evaluation with animated number roll-up counters.
- **Income vs. Expense Ratio Bar**: Dynamic proportional split indicator showing real-time financial health.
- **Barber-Pole Budget Usage**: Animated striped progress bar shifting from emerald to amber, with alert beacons when approaching or exceeding threshold limits.
- **Quick Insights Deck**: Live savings rate calculation, average spend per transaction, and top category expenditure.

### 2. 🍩 Interactive Expense Breakdown
- **Pop-up Scale Animation**: Hovering over any slice physically expands the sector with an outer ambient halo and neon accent border.
- **Center Inspection HUD**: Dynamic spring-animated center display revealing the exact category, formatted amount, and percentage share.
- **Synchronized Category Deck**: Two-way interactive pill deck below the chart—hovering a pill highlights the chart slice, and vice-versa.

### 3. 📈 7-Day Cashflow Velocity
- **SVG Gradient Charts**: Dual-bar cashflow velocity chart powered by Recharts with custom emerald (`#incomeGrad`) and crimson (`#expenseGrad`) linear gradients.
- **Frosted Glass Tooltips**: Modern dark glassmorphic hover cards displaying transaction details with subtle backdrop blur.

### 4. 💱 Real-Time Multi-Currency Engine
- Instant conversion between **USD ($)** and **INR (₹)**.
- Integrates with live exchange rate APIs with automatic fallback calculations.
- Smooth sliding spring pill toggle indicator powered by Framer Motion's `layoutId`.

### 5. 📑 Advanced Transaction Ledger
- **Instant Search & Filter**: Real-time search across descriptions and categories.
- **Multi-criteria Filtering**: Filter by transaction type (*All, Income, Expense*) and category (*Food, Travel, Bills, etc.*).
- **Date Sorting**: Instant ascending/descending chronological toggle.
- **CSV Data Export**: One-click ledger export to standard CSV format.
- **Animated Row Lifecycle**: Staggered slide-in and pop-out row animations powered by `AnimatePresence`.

### 6. ✨ Cyber-Fintech Aesthetics
- **Floating Aurora Mesh**: Ambient luminous orbs drifting and pulsing in deep sapphire, electric indigo, and emerald.
- **Cyber-Coordinate Grid**: Subtle matrix background pattern with radial illumination.
- **Glassmorphism 2.0**: High-refraction card borders, specular hover glimmers, and frosted glass dialogs.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Custom CSS Keyframe Utilities
- **Animations**: Framer Motion (`13.x`)
- **Data Visualization**: Recharts (`3.x`)
- **Icons**: Lucide React
- **Primitives**: Radix UI (Dialog, Select, Slot)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Environment**: Dotenv + CORS
- **Process Management**: Concurrently (root-level unified workflow)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running on `localhost:27017`

### 1. Clone the Repository
```bash
git clone https://github.com/PraneshKumar20/ExpenseTracker.git
cd ExpenseTracker
```

### 2. Install Dependencies
Install dependencies for both client and server from the root directory:
```bash
npm run install:all
```

### 3. Environment Configuration
Ensure `server/.env` is configured:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
```

### 4. Run the Application
Start both the Express API and Vite frontend dev server concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 📂 Project Architecture

```
ExpenseTracker/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── api/                # Axios instance & endpoints
│   │   ├── components/
│   │   │   ├── Dashboard/      # Command Center, Charts & Ledger
│   │   │   ├── Login/          # Authentication View
│   │   │   ├── Signup/         # Registration View
│   │   │   └── ui/             # Reusable UI primitives (Buttons, Cards, AnimatedCounter)
│   │   ├── App.jsx             # Main application layout
│   │   ├── index.css           # Design tokens, keyframes & glassmorphism
│   │   └── main.jsx            # React root & routing
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express & MongoDB Backend
│   ├── config/                 # Database connection
│   ├── controllers/            # Request handlers
│   ├── models/                 # Mongoose schemas (Expense, User)
│   ├── routes/                 # API route definitions
│   ├── package.json
│   └── server.js
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both backend and frontend concurrently |
| `npm run dev:client` | Starts only the Vite frontend dev server |
| `npm run dev:server` | Starts only the Express backend server with nodemon |
| `npm run install:all` | Installs dependencies for both client and server |

---

## 📄 License
This project is licensed under the ISC License.
