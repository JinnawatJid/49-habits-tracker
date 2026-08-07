# Project Context: 49 Habits Tracker & Gold DCA

## Overview
A gamified daily habits and wealth tracking web application based on the book *49 habits นิสัยง่ายๆ ชีวิตโคตรดี*. Users progress through 49 sequential levels (7-Day Sprint Model) and track physical 0.1g gold bar DCA investments & redemptions in real-time.

---

## 🏛️ Core Architecture & Tech Stack
- **Framework**: React 19 + Vite 8
- **Sprint Engine**: 7-Day Micro-Habit Sprint (Single-row 7 circles matrix).
- **Gold DCA Engine**: Combined Gold Asset Valuation (Digital Pool + Physical Vault Bars), Capital spent, Gold weight in grams, Average cost THB/g, Net profit/loss, Reference spot rate, and dual-mode Buy/Redeem modal.
- **Design System & Typography**: Dual-Theme Support (Balanced Light Mode `#F8FAFC` & Sleek Dark Slate Mode `#0F172A` with Emerald `#10B981` accents). **100% Unified Natural English Typography** (zero parenthetical `()` clutter) + **Crisp Lucide SVG Vector Icons** (zero clunky OS emojis).
- **Real Calendar Date Engine**: ISO date engine (`YYYY-MM-DD`) with clean human header date formatting (`Saturday, Aug 1`).
- **Database & Sync Engine**: Supabase Real-Time PostgreSQL (`user_habits` table) with Single-Field Private Sync Key authentication (`Jinna-2026`).
- **Native PWA**: Offline Service Worker (`sw.js`) + Web App Manifest (`manifest.json`).
- **GitHub Repository**: [github.com/JinnawatJid/49-habits-tracker](https://github.com/JinnawatJid/49-habits-tracker) (Personal Profile: `JinnawatJid`).
- **Cloud Hosting**: Live Continuous Deployment on Vercel (`/api/gold-price` native serverless function).

---

## 🎮 Gamified 49 Sequential Levels
- **Level 1**: `ออกไปรับอากาศบริสุทธิ์` (*"ใช้เวลานอกบ้านอย่างน้อยวันละ 30 นาที"*).
- **Level 2**: `ล้างหน้าปั๊บขยับ 1 นาที` (*"วิดพื้นเพื่อสร้างความกระปรี้กระเปร่า"*).
- **Level 3**: `อยากสมองดีให้อยู่เฉยๆ` (*"อยู่เฉยๆ 15 นาที เพื่อให้สมองได้พักผ่อนอย่างแท้จริง"*).
- **Levels 4 to 49**: Pre-allocated sequential roadmap slots (`Locked Habit (Chapter X)` 🔒). Unlocks level-by-level upon completing 7/7 days of the preceding level.

---

## 🛡️ Critical Technical Invariants & Safeguards
1. **Asset Valuation Invariant**: Total Gold Assets = Digital Pool Grams + Physical Vault Bar Grams. Redemptions transfer custody to physical bars without dropping portfolio net worth.
2. **Clean Hero Summary Card**: Hero card displays 3 clean key metrics (`Total Invested`, `Total Gold Asset`, `Average Cost`) without noisy subtext or extra sub-bars.
3. **Buy vs Redeem Gold Modal**: Log Gold dialog supports a 2-mode segmented switcher (`Buy Gold` for micro-DCA accumulation with auto-calculated weight vs `Redeem Bar` for physical bar withdrawal).
4. **Unified Natural English Typography**: All UI labels, badges, headers, and metrics use 100% clean English typography without parenthetical clutter or mixed language labels.
5. **Crisp Lucide SVG Vector Icons Only**: Never use browser OS emojis (`🪙`, `🏆`, `🟢`). Use Lucide SVG vector components (`<Coins />`, `<Award />`, `<CheckCircle2 />`, `<Package />`).
6. **Wireframe Approval First**: Always generate a visual mockup via Stitch and obtain explicit user approval before modifying UI code.
7. **Mount Overwrite Guard (`isInitializedRef`)**: Block cloud push on app mount until initial cloud state fetch completes.
8. **Echo Loop Prevention (`isRemoteUpdateRef`)**: Ignore incoming real-time broadcasts when updating local React state to prevent infinite loops.
9. **Git Profile Enforcement**: Ensure active gh CLI account is `JinnawatJid` for personal repository pushes.
