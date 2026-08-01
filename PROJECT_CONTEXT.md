# Project Context: 49 Habits Tracker & Gold DCA

## Overview
A gamified daily habits and wealth tracking web application based on the book *49 habits นิสัยง่ายๆ ชีวิตโคตรดี*. Users progress through 49 sequential levels (7-Day Sprint Model) and track physical 0.1g gold bar DCA investments in real-time.

---

## 🏛️ Core Architecture & Tech Stack
- **Framework**: React 19 + Vite 8
- **Sprint Engine**: 7-Day Micro-Habit Sprint (Single-row 7 circles matrix).
- **Gold DCA Engine**: Physical Gold Bar DCA Portfolio Tracker (Capital spent, gold weight in grams, physical bars count, average cost THB/g, net profit/loss, reference spot rate).
- **Design System & Typography**: Dual-Theme Support (Balanced Light Mode `#F8FAFC` & Sleek Dark Slate Mode `#0F172A` with Emerald `#10B981` accents). **100% Unified Natural English Typography** (zero parenthetical `()` clutter) + **Crisp Lucide SVG Vector Icons** (zero clunky OS emojis).
- **Real Calendar Date Engine**: ISO date engine (`YYYY-MM-DD`) with clean human header date formatting (`Saturday, Aug 1`).
- **Database & Sync Engine**: Supabase Real-Time PostgreSQL (`user_habits` table) with Single-Field Private Sync Key authentication (`Jinna-2026`).
- **Native PWA**: Offline Service Worker (`sw.js`) + Web App Manifest (`manifest.json`).
- **GitHub Repository**: [github.com/JinnawatJid/49-habits-tracker](https://github.com/JinnawatJid/49-habits-tracker) (Personal Profile: `JinnawatJid`).
- **Cloud Hosting**: Live Continuous Deployment on Vercel.

---

## 🎮 Gamified 49 Sequential Levels
- **Level 1**: `ออกไปรับอากาศบริสุทธิ์` (*"ใช้เวลานอกบ้านอย่างน้อยวันละ 30 นาที เพื่อรับวิตามินดี รับอากาศบริสุทธิ์ ช่วยให้สุขภาพและใจแข็งแรง"*).
- **Level 2**: `ล้างหน้าปั๊บขยับ 1 นาที` (*"วิดพื้นเพื่อสร้างความกระปรี้กระเปร่า"*).
- **Levels 3 to 49**: Pre-allocated sequential roadmap slots (`Locked Habit (Chapter X)` 🔒). Unlocks level-by-level upon completing 7/7 days of the preceding level.

---

## 🛡️ Critical Technical Invariants & Safeguards
1. **Unified Natural English Typography**: All UI labels, badges, headers, and metrics use 100% clean English typography without parenthetical clutter or mixed language labels.
2. **Crisp Lucide SVG Vector Icons Only**: Never use browser OS emojis (`🪙`, `🏆`, `🟢`). Use Lucide SVG vector components (`<Coins />`, `<Award />`, `<CheckCircle2 />`).
3. **Wireframe Approval First**: Always generate a visual mockup via Stitch and obtain explicit user approval before modifying UI code.
4. **Zero Mock Data Policy**: Keep all user-facing UI clean and free of developer debug text.
5. **Mount Overwrite Guard (`isInitializedRef`)**: Block cloud push on app mount until initial cloud state fetch completes.
6. **Echo Loop Prevention (`isRemoteUpdateRef`)**: Ignore incoming real-time broadcasts when updating local React state to prevent infinite loops.
7. **Git Profile Enforcement**: Ensure active gh CLI account is `JinnawatJid` for personal repository pushes.
