# Design System & Learned Rules (49 Habits Tracker)

## 1. UI & Visual Design Invariants
* **Visual Palette & Tokens**:
  * Off-white background: `#F8FAFC`
  * Clean white cards: `#FFFFFF` with rounded borders `#E2E8F0`
  * Action Accents: Emerald Green `#10B981` (Hover: `#059669`)
  * Mastered Trophy Accent: Warm Amber `#F59E0B`
* **Layout Structure**:
  * **Strictly 2 Bottom Tabs**: `Today` and `Journey` matching [`stitch_21day_balanced_middleground.jpg`](file:///C:/Users/Jinna/Desktop/49-habits-tracker/stitch_21day_balanced_middleground.jpg).
  * **Header**: Clean date text (`Sunday, July 26`) + Mastered count badge (`0/49 Mastered`).

---

## 2. Mandatory Behavioral & Workflow Rules

### Rule 1: Visual Wireframe Approval First
* **NEVER add or alter UI elements, buttons, or navigation layouts** without first generating a visual wireframe mockup (via Stitch / `generate_image`), presenting it to the user, and receiving explicit approval.

### Rule 2: Production Polish & Zero Mock Data Policy
* **Never display developer debug text** (e.g. `"Real Calendar Date • 2026-07-26"`, `"Supabase Sync: HABIT-XXXX"`) or pre-populated dummy lists cluttering the interface. Keep all UI clean and production-ready.

### Rule 3: Real-Time Sync Race-Condition Safeguards
* **Mount Overwrite Prevention**: Always block cloud push operations on app mount until initial cloud state fetch completes (`isInitializedRef`).
* **Echo Loop Prevention**: Always implement remote-update flags (`isRemoteUpdateRef`) and deep state comparison to prevent incoming real-time broadcasts from re-triggering outgoing pushes in an infinite loop.

### Rule 4: Pre-Submission Code Review
* **NEVER claim a feature or fix is working** without performing a comprehensive code review audit or invoking a subagent to test edge cases across multi-device/multi-tab scenarios.

---

## 3. Tech Stack Architecture
* **Frontend**: React 19 + Vite 8
* **Database**: Supabase Real-Time Key-Value Store (`user_habits` table)
* **PWA**: Offline Service Worker (`sw.js`) + Manifest (`manifest.json`)
* **Repo**: `https://github.com/JinnawatJid/49-habits-tracker`
