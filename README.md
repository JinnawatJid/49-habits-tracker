# 49 Habits Tracker & Gold DCA Application 🏆🪙

A modern, high-performance Progressive Web Application (PWA) combining a **7-Day Micro-Habit Sprint Engine** with a **Gold DCA Investment & Physical Vault Tracker**.

Built with React 19, Vite 8, Lucide Icons, and real-time Supabase cloud synchronization.

---

## 🌟 Key Features

### 1. 🎯 7-Day Micro-Habit Sprint Engine
- **Sequential Level Progression**: Progress through 49 structured habit levels without skipping.
- **7-Day Sprint Matrix**: Single-row 7-circle completion matrix for focused habit building.
- **Level Mastered Vault**: Track completed sprint badges in the **Journey** tab.

### 2. 🪙 Gold DCA Investment & Physical Vault Tracker
- **Portfolio Hero Card**: Tracks real-time Portfolio Value (THB), Net Profit/Loss (`+X THB • +Y%`), Total Invested (THB), Gold Accumulated (grams), and Average Cost (THB/g).
- **Log Gold Transaction Modal**: Segmented switcher between **Buy Gold** (with auto-calculated weight received) and **Redeem Bar** (deducting digital weight and adding physical 0.1g bars to vault).
- **Live Real-Time Gold Spot Reference**: Native Vercel serverless function (`/api/gold-price`) auto-fetching official Thai Gold Traders Association (GTA) live market rates (`🟢 Live` status badge).

### 3. ☁️ Real-Time Cloud Sync
- **Private Sync Key**: Connect devices using a single Private Sync Key (e.g. `JINNA-2026`).
- **Supabase Realtime Broadcasts**: Auto-syncs progress across smartphones, tablets, and desktop browsers seamlessly.

---

## 📂 Project Structure

```
49-habits-tracker/
├── api/
│   └── gold-price.js              # Native Vercel Serverless Function for Live Gold Rates
├── docs/
│   ├── DESIGN_SYSTEM_AND_LEARNINGS.md  # UI Design Tokens & Architecture Guidelines
│   ├── PROJECT_CONTEXT.md              # Core Project Requirements & Database Schema
│   ├── SUPABASE_SETUP.sql              # Supabase Table Schema & Realtime Setup SQL
│   └── mockups/                        # Stitch UI Wireframe Concept Artifacts
├── public/
│   ├── favicon.svg
│   ├── manifest.json
│   └── sw.js                      # Production PWA Service Worker
├── src/
│   ├── App.jsx                    # Core Application Component
│   ├── App.css                    # Design Tokens & Responsive Layout CSS
│   ├── main.jsx                   # Entry Point
│   └── syncEngine.js              # Supabase Realtime Cloud Sync Engine
├── index.html                     # HTML Template
├── vercel.json                    # Vercel Serverless Rewrite Proxy Config
├── vite.config.js                 # Vite Dev Server & Local Proxy Config
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Build Production Bundle
```bash
npm run build
```

---

## 🛠️ Documentation & Learning Resources
- 📘 [Project Context & Schema](docs/PROJECT_CONTEXT.md)
- 🎨 [Design System & UI Guidelines](docs/DESIGN_SYSTEM_AND_LEARNINGS.md)
- 🗄️ [Supabase SQL Setup](docs/SUPABASE_SETUP.sql)
- 🖼️ [UI Design Mockups](docs/mockups/)

---

## 📜 License
MIT License
