# AgriSmart (SQUADX) - NASA Earth Observation Agro-Intelligence & Crop Recommender

[![GitHub Repository](https://img.shields.io/badge/GitHub-rupeshpatil14042006--cpu%2Fnasa--squad--x-10b981?style=for-the-badge&logo=github)](https://github.com/rupeshpatil14042006-cpu/nasa-squad-x.git)
[![NASA Space Apps](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge-0284c7?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-ffca28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.3-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

**AgriSmart** is a next-generation precision agriculture platform that integrates **NASA Earth Observations** (POWER, Landsat-8/9, MODIS, SMAP/GPM), **ISRIC SoilGrids 250m**, **Open-Meteo**, and **Machine Learning** to empower farmers with real-time farm health monitoring, climate risk analysis, 3D field twin simulations, auto-GPS telemetry, and AI-driven crop rotation recommendations.

---

## 🌟 Core Features & Modules

### 1. Modern AgriSmart Dashboard
- **Deep Forest Green Sidebar (`#0d2818`)**: Clean, intuitive navigation for `Dashboard`, `Fields`, `Crops`, `IoT Devices`, `Weather`, `Analytics`, `Reports`, `Tasks`, and `Settings`.
- **Top Header Bar**: Search bar for crops/fields, live farm location chip, unread alerts counter badge, quick settings, and user profile management.
- **Top 4 KPI Metric Cards**:
  - 🌿 **Total Fields**: `12` (+2 this month)
  - 🌾 **Active Crops**: `5` (Healthy growth)
  - 💧 **Soil Moisture**: `68%` (Optimal level)
  - 🌡️ **Temperature**: `28°C` (Normal range)
- **Interactive Field Overview Map**:
  - High-resolution Esri World Imagery satellite base layer.
  - Multi-parcel polygon boundary overlays with color-coded agronomic health status:
    - **Field A (Rice)**: Emerald green boundary & fill (Healthy)
    - **Field B (Vegetables)**: Warm terracotta/brown boundary & fill (Attention)
    - **Field C (Fruits)**: Amber/golden yellow boundary & fill (Attention)
  - Floating map zoom controls (`+`, `-`, `↺` reset) and bottom status legend (🟢 Healthy, 🟡 Attention, 🔴 Critical).
- **Soil Conditions Monitoring**:
  - 2×2 sensor meter grid with dynamic progress indicators for **Moisture (68%)**, **pH Level (6.5)**, **Temperature (28°C)**, and **Nutrients (Good)**.
- **Weather Forecast & Recent Alerts**:
  - Live sun/cloud graphic, `28°C`, Partly Cloudy, and a 5-day forecast (Tue–Sat).
  - Priority alert notifications: low soil moisture warnings, high temperature forecasts, and irrigation cycle confirmations.

---

### 2. Suggested Crops with Studio Photography
- **Product Card Aesthetic**: High-quality studio product photography with crisp soft drop-shadows on white cards:
  - 🍓 **Strawberry**: `$20.10 / pre kg` — High cash return, optimal for drip-irrigated beds.
  - 🥬 **Cabbage**: `$15.10 / pre kg` — Cold-tolerant leafy brassica with strong market demand.
  - 🥦 **Brocoly**: `$25.10 / pre kg` — Premium export grade, high antioxidant density.
  - 🍊 **Orenge**: `$12.10 / pre kg` — Perennial deep root buffer with low drip water demand.
  - 🌾 **Rice (Paddy)**: `$8.40 / pre kg` — High-starch staple for wetland monsoon parcels.
  - 🍅 **Tomato**: `$14.20 / pre kg` — Heavy continuous fruiting, high return with staking.
  - 🌾 **Wheat**: `$6.80 / pre kg` — Primary rabi cereal, balances soil post-legume.
- **Interactive Crop Actions**:
  - Heart favorite toggle to bookmark preferred crops.
  - Circular green `+` action button to instantly add crops to your field rotation plan with a live feedback toast.

---

### 3. Interconnected Mobile Companion App (Auto-GPS on Startup)
- **Handheld Smartphone Simulator**: Access anytime via the **"📱 Mobile App"** button in the header bar or automatically when visiting from a smartphone.
- **Auto-GPS Activation on Launch**:
  - As soon as the mobile app opens, it automatically triggers `navigator.geolocation.getCurrentPosition({ enableHighAccuracy: true })`.
  - Displays a **"Live GPS Connected (AUTO)"** pulse indicator with exact coordinates (e.g., `20.0112°N, 73.8124°E`) and accuracy (±8m).
  - Automatically updates localized NASA POWER solar data, weather forecast, and localized crop suggestions for the detected coordinates.
- **Mobile Navigation Bar**: Bottom navigation dock (*Home, Fields, Crops, Alerts*).

---

### 4. Firebase Authentication Platform
- **Integrated Modular SDK (`firebase@13.1.0`)**:
  - **Email & Password**: Support for both **Sign In** and **Create Account**.
  - **Google OAuth**: Instant single-sign-on via `GoogleAuthProvider`.
  - **1-Click Demo Login**: Pre-configured *"John Doe · Farm Manager"* access for instant evaluation without requiring Firebase keys beforehand.
  - **Session State**: Real-time auth listener (`onAuthStateChanged`) with persistent state and 1-click Sign Out.

---

### 5. Earth Observation & Precision Agronomy
- **USGS / NASA Landsat 8/9 Level-2**: Multi-year ~30m resolution NDVI vegetation index via Microsoft Planetary Computer STAC.
- **NASA POWER Solar & Meteorological API**: 90-day solar radiation, precipitation, temperature anomalies, and dry spell analytics.
- **ISRIC SoilGrids 250m**: Standardized soil profiles including pH, organic carbon fraction, texture, and bulk density.
- **3D Field Twin Simulation**: Three.js digital terrain mesh with elevation gradients and real-time solar path rendering.
- **Multilingual Voice Advisory**: Audio advisory engine in English, Marathi (मराठी), and Hindi (हिन्दी).
- **GitHub Sync & Export**: 1-click JSON farm report exporter and Git sync modal linked to [nasa-squad-x.git](https://github.com/rupeshpatil14042006-cpu/nasa-squad-x.git).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19.3, Vite 8.3, Vanilla JavaScript (ESM) |
| **Styling & Design System** | Tailwind CSS v4, Lucide Icons, Google Fonts (Outfit, Inter) |
| **Spatial & Mapping** | Leaflet 1.9, Leaflet-Geoman (polygon drawing), Esri World Imagery, Turf.js |
| **3D Graphics** | Three.js (Digital Field Twin terrain simulation) |
| **Authentication** | Firebase Auth v13 (Email/Password, Google OAuth, 1-Click Demo) |
| **Backend API** | Python 3.11, FastAPI, Uvicorn, Scikit-learn, Joblib |
| **Data Sources** | NASA POWER API, USGS Landsat Collection 2, ISRIC SoilGrids, Open-Meteo |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) or [Bun](https://bun.sh/) (v1.1+)
- Python 3.10+ (for the optional backend API)
- Git

---

### 1. Clone the Repository
```bash
git clone https://github.com/rupeshpatil14042006-cpu/nasa-squad-x.git
cd nasa-squad-x
```

---

### 2. Frontend Setup (React + Vite)
Install dependencies with Bun (recommended) or npm:
```bash
bun install
# or: npm install
```

Start the Vite development server:
```bash
bun dev
# or: npm run dev
```

The application will be live at:
👉 **`http://localhost:5173/`**

---

### 3. Backend Setup (FastAPI + ML Model)
In a separate terminal:
```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install requirements
cd backend
python -m pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at:
👉 **`http://127.0.0.1:8000/docs`**

---

## ⚙️ Environment Variables (Optional)

Create a `.env` file in the root directory if you wish to connect your own Firebase project:

```env
# Optional: Your Custom Firebase Project Credentials
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...

# Optional: Production Backend API URL (defaults to http://127.0.0.1:8000 locally)
VITE_API_BASE_URL=https://your-api.up.railway.app
```
*(Note: If left unset, the app automatically runs in Demo Mode with full feature access and 1-Click login).*

---

## 📂 Project Directory Structure

```text
├── backend/                  # FastAPI Python backend & ML models
│   ├── datasets/             # FAOSTAT crop yield training data
│   ├── models/               # Pre-trained Scikit-learn yield models
│   ├── services/             # NASA POWER, Landsat, SoilGrids connectors
│   └── main.py               # REST API endpoints & routers
├── public/                   # Static assets & studio photography
│   ├── avatar.jpg            # Farm Manager profile portrait
│   ├── sprout.jpg            # Sidebar promo card photography
│   └── crops/                # High-res isolated crop photography
│       ├── strawberry.jpg
│       ├── cabbage.jpg
│       ├── broccoli.jpg
│       ├── orange.jpg
│       ├── rice.jpg
│       ├── tomato.jpg
│       └── wheat.jpg
├── src/
│   ├── components/           # React UI components
│   │   ├── AgriSmartDashboard.jsx  # Main dashboard matching reference UI
│   │   ├── AgriHeader.jsx          # Top header with search, alerts & auth
│   │   ├── Sidebar.jsx             # Deep green navigation sidebar
│   │   ├── CropCard.jsx            # Crop card with photo, price & add button
│   │   ├── MobileAppView.jsx       # Mobile companion with Auto-GPS
│   │   ├── AuthModal.jsx           # Firebase Authentication modal
│   │   ├── SatelliteMap.jsx        # Leaflet & Landsat NDVI remote sensing
│   │   ├── FieldTwin3D.jsx         # Three.js 3D field terrain simulation
│   │   ├── CropAdvisoryEngine.jsx  # AI crop recommendations & rotation
│   │   ├── ClimateRiskDashboard.jsx# NASA POWER climate analytics
│   │   ├── SoilWaterHealth.jsx     # SoilGrids & water balance diagnostics
│   │   ├── SettingsView.jsx        # Farm preferences & localization
│   │   └── GitSyncModal.jsx        # GitHub synchronization modal
│   ├── data/                 # Agronomic databases & crop catalog
│   ├── services/             # Firebase Auth & API base services
│   ├── App.jsx               # Main application controller
│   └── index.css             # Tailwind CSS v4 design system
├── README.md                 # Project documentation & feature overview
└── package.json              # Frontend scripts & dependencies
```

---

## 🌐 Deployment

### Frontend (Vercel)
- Connect this GitHub repository to [Vercel](https://vercel.com).
- Build Command: `npm run build`
- Output Directory: `dist`
- Optional: Add `VITE_API_BASE_URL` pointing to your deployed backend.

### Backend (Railway)
- Deploy `/backend` as a Python service on [Railway](https://railway.app).
- Set `FRONTEND_ORIGINS` to your Vercel URL.

---

## 📄 License & Attribution
- Developed for the **NASA Space Apps Challenge**.
- Satellite Data courtesy of **USGS / NASA Earth Science Data Systems (ESDS)**.
- Soil data provided by **ISRIC SoilGrids**.
- Weather telemetry powered by **Open-Meteo**.

---

**GitHub Repository**: [https://github.com/rupeshpatil14042006-cpu/nasa-squad-x.git](https://github.com/rupeshpatil14042006-cpu/nasa-squad-x.git)
