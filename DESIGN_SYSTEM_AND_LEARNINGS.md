# Design System & Learned Rules (49 Habits Tracker)

## 1. Visual Design Tokens & Themes

### Light Theme (Balanced Middle-Ground)
* **App Background**: Soft Off-White (`#F8FAFC`)
* **Card Surface**: Pure White (`#FFFFFF`)
* **Card Border**: Slate Border (`#E2E8F0`)
* **Text Primary**: Slate Charcoal (`#0F172A`)
* **Text Secondary**: Slate Muted (`#475569`)

### Dark Theme (Sleek Dark Slate)
* **App Background**: Dark Slate (`#0F172A`)
* **Card Surface**: Dark Slate Card (`#1E293B`)
* **Card Border**: Dark Border (`#334155`)
* **Text Primary**: Crisp Off-White (`#F8FAFC`)
* **Text Secondary**: Light Slate (`#94a3b8`)

### Universal Accents & Layout Structure
* **Action Accent**: Emerald Green (`#10B981`, Hover: `#059669`)
* **Trophy Accent**: Warm Amber (`#F59E0B`)
* **Sprint Matrix**: Single horizontal row of 7 circles (`Day 1` to `Day 7`).
* **Layout Structure**: Strictly 3 Bottom Tabs (`Today` | `Journey` | `Gold DCA`).

---

## 2. Mandatory Learned Behavioral Rules

### Rule 1: Unified Natural English Typography (No Mixed Languages or Parentheses)
* All UI labels, badges, headers, metrics, and cards must use **100% Unified Natural English Typography** (e.g. `PORTFOLIO VALUE`, `Total Invested`, `Gold Accumulated`, `Average Cost`, `Gold Spot Reference`).
* **Zero Parenthetical Clutter**: Never use parenthetical translations `(มูลค่าปัจจุบัน)` or mixed Thai/English labels cluttering cards.

### Rule 2: Crisp Lucide SVG Vector Icons Only (Zero OS Emojis)
* All icons must be clean Lucide SVG vector components (`<Coins />`, `<Award />`, `<CheckCircle2 />`, `<Plus />`, `<Lock />`, `<KeyRound />`). Never use clunky OS browser emojis (`🪙`, `🏆`, `🟢`).

### Rule 3: Visual Wireframe Approval First
* **NEVER add or alter UI elements, buttons, or navigation layouts** without first generating a visual wireframe mockup (via Stitch / `generate_image`), presenting it to the user, and receiving explicit approval.

### Rule 4: Production Polish & Zero Mock Data Policy
* Keep all UI clean and free of developer debug text or unrequested dummy lists.

### Rule 5: Real-Time Sync Race-Condition Safeguards
* **Mount Overwrite Prevention**: Always block cloud push operations on app mount until initial cloud state fetch completes (`isInitializedRef`).
* **Echo Loop Prevention**: Always implement remote-update flags (`isRemoteUpdateRef`) and deep state comparison (`lastStateStrRef`) to prevent incoming real-time broadcasts from re-triggering outgoing pushes in an infinite loop.

---

## 3. Technology Architecture
* **Sprint Engine**: 7-Day Micro-Habit Sprint Model (7 days per level to level up).
* **Gold Portfolio Engine**: Real-time Gold DCA Portfolio Tracker (Capital spent, gold weight, physical bars, average cost, profit/loss).
* **Frontend**: React 19 + Vite 8
* **Database & Realtime**: Supabase Real-Time Key-Value Store (`user_habits` table) with Single-Field Private Sync Key authentication (`Jinna-2026`).
* **Themes**: Dynamic Light / Dark mode toggle with persistent `data-theme` attribute and Supabase sync.
* **PWA**: Offline Service Worker (`sw.js`) + Manifest (`manifest.json`).
* **GitHub Repository**: [github.com/JinnawatJid/49-habits-tracker](https://github.com/JinnawatJid/49-habits-tracker) (Personal Profile: `JinnawatJid`).
* **Cloud Hosting**: Live Continuous Deployment on Vercel.
