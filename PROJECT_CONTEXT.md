# Project Context: 49 Habits Tracker

## Overview
A gamified micro-habit sprint web application based on the book *49 habits นิสัยง่ายๆ ชีวิตโคตรดี*. Users progress through 49 sequential levels (Level 1 → Level 2 → Level 49), requiring 7 days of daily check-ins per level (7-Day Sprint Model) before unlocking the next chapter.

---

## 🏛️ Core Architecture & Tech Stack
- **Framework**: React 19 + Vite 8
- **Sprint Model**: 7-Day Micro-Habit Sprint (Single-row 7 circles matrix).
- **Design System**: Dual-Theme Support (Balanced Light Mode `#F8FAFC` & Sleek Dark Slate Mode `#0F172A` with Emerald `#10B981` accents).
- **Real Calendar Date Engine**: Behind-the-scenes ISO date engine (`YYYY-MM-DD`) with clean human header date formatting (`Sunday, Aug 2`).
- **Database & Sync Engine**: Supabase Real-Time PostgreSQL (`user_habits` table) with Single-Field Private Sync Key authentication (`Jinna-2026`).
- **Native PWA**: Offline Service Worker (`sw.js`) + Web App Manifest (`manifest.json`).
- **GitHub Repository**: [github.com/JinnawatJid/49-habits-tracker](https://github.com/JinnawatJid/49-habits-tracker) (Personal Profile: `JinnawatJid`).
- **Cloud Hosting**: Live Continuous Deployment on Vercel.

---

## 🎮 Gamified 49 Sequential Levels
- **Level 1**: `ออกไปรับอากาศบริสุทธิ์` (*"ใช้เวลานอกบ้านอย่างน้อยวันละ 30 นาที เพื่อรับวิตามินดี รับอากาศบริสุทธิ์ ช่วยให้สุขภาพและใจแข็งแรง"*).
- **Level 2**: `ล้างหน้าปั๊บขยับ 1 นาที` (*"วิดพื้นเพื่อสร้างความกระปรี้กระเปร่า"*).
- **Levels 3 to 49**: Pre-allocated sequential roadmap slots (`Locked Habit (Chapter X)` 🔒). Unlocks level-by-level upon completing 7/7 days of the preceding level.
- **Single Focus View**: Main screen contains only the active 7-day challenge card with 7-circle matrix and single check-in button.

---

## 🛡️ Critical Technical Invariants & Safeguards
1. **Wireframe Approval First**: Always generate a visual mockup via Stitch and obtain explicit user approval before modifying UI code.
2. **Zero Mock Data Policy**: Keep all user-facing UI clean and free of developer debug text or unrequested dummy lists.
3. **Mount Overwrite Guard (`isInitializedRef`)**: Block cloud push on app mount until initial cloud state fetch completes, preventing new tabs/devices from wiping cloud records with empty initial state.
4. **Echo Loop Prevention (`isRemoteUpdateRef`)**: Ignore incoming real-time broadcasts when updating local React state to prevent infinite push/listen feedback loops.
5. **Git Profile Enforcement**: Ensure active gh CLI account is `JinnawatJid` for personal repository pushes.
