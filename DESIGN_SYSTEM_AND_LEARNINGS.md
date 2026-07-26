# Design System & Agent Learnings Document

## 🎨 Approved Design Asset
* **Approved Visual Mockup**: [stitch_21day_balanced_middleground.jpg](file:///C:/Users/Jinna/Desktop/49-habits-tracker/stitch_21day_balanced_middleground.jpg)
* **Design Philosophy**: **Balanced Middle-Ground** — Clean, structured, mobile-first, soft card containers, elegant spacing, zero dark mode bloat, zero plain stark emptiness.

---

## 🛑 Agent Learnings & Rules (DO NOT REPEAT PAST MISTAKES!)

### 1. ALWAYS Get Visual Wireframe Approval BEFORE Writing Code
* **Lesson Learned**: The agent initially jumped into writing React/Vite code without letting the user review and approve the visual layout first.
* **Mandatory Workflow Rule**:
  1. Ask open-ended questions about the user's workflow, aesthetics, and mobile screen expectations.
  2. Have **Stitch** generate visual mockups (9:16 mobile aspect ratio).
  3. Save mockup images to the project directory and present them to the user.
  4. **ONLY after explicit user approval** (`"I like this one, so we will base on this"`) start scaffolding and writing code.

### 2. Finding the Design Sweet Spot (Balanced Middle-Ground)
* **Avoid Extreme 1 (Over-engineered / Bloated)**: Heavy dark glassmorphism, glowing neon borders, complex 4-quadrant matrices, busy timers, and heavy shadows.
* **Avoid Extreme 2 (Under-engineered / Bare)**: Stark flat plain text with zero card containers or visual structure.
* **The Approved Sweet Spot**:
  - Soft white card panels (`#FFFFFF`) with thin, rounded border outlines (`#E2E8F0`).
  - Off-white backdrop (`#F8FAFC`).
  - Single vibrant growth accent color (**Emerald Green `#10B981`**).
  - Subtle pastel category tag pills (*Book Club*, *Self Care*, *Mindfulness*).
  - Clean, high-contrast typography (Plus Jakarta Sans / Inter).

---

## 📐 Design Tokens & CSS Specs

```css
:root {
  --bg-app: #f8fafc;
  --surface-card: #ffffff;
  --border-card: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  
  --accent-emerald: #10b981;
  --accent-emerald-bg: #ecfdf5;
  --accent-emerald-border: #a7f3d0;
  
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 9999px;

  --shadow-soft: 0 4px 14px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02);
}
```

### Pastel Tag Classes
* `.tag-green`: `background: #e6f4ea; color: #137333;`
* `.tag-pink`: `background: #fce8e6; color: #c5221f;`
* `.tag-yellow`: `background: #feefc3; color: #b06000;`
* `.tag-blue`: `background: #e8f0fe; color: #1a73e8;`
* `.tag-purple`: `background: #f3e8ff; color: #7e22ce;`

---

## 📱 Mobile Component Breakdown
1. **Header Bar**: Date title (`Tuesday, Oct 26`) + Mastered Habits count pill (`3 Habits Mastered`).
2. **Hero 21-Day Challenge Card**:
   - Title: *"Read 10 Pages Daily"*
   - Status pill: *"Day 14 of 21"*
   - 21-Circle Matrix Grid: 3 rows of 7 dots (completed emerald dots, active today border dot, grey upcoming dots).
   - Check-in button: Solid emerald green with confetti FX.
3. **Today's Checklist**: Clean rounded card rows with checkboxes and pastel category tags.
4. **Bottom Nav Bar**: Clean 2-item navigation bar (`Today` | `Journey`).
