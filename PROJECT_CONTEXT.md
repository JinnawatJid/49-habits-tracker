# Project Context: 49 Habits • 21-Day Habit Challenge App

## 📌 Project Overview
* **Project Name**: `49-habits-tracker`
* **Directory**: `C:\Users\Jinna\Desktop\49-habits-tracker`
* **Core Inspiration**: Chapter 1 of the book *"49 habits นิสัยง่ายๆ ชีวิตโคตรดี"* (Small habits, great life — plan, track, and double momentum).
* **Core Philosophy**:
  1. **Simple** (ต้องง่าย ต้องธรรมดา และทำได้จริง) — No complex time slots, no heavy morning/evening routines, no clutter.
  2. **Smart** (เป็นวิธีที่ชาญฉลาด ทำเล็กน้อยแต่ได้ผลลัพธ์มหาศาล) — High-impact small actions leading to compound life transformation.
  3. **Short Duration** (ใช้เวลาเพียงไม่มาก) — Quick, frictionless daily interaction.

---

## 🎯 21-Day Habit Engine & User Workflow
1. **Single 21-Day Challenge Focus**:
   - Grounded in behavioral science: Focus on **one habit at a time for 21 consecutive days**.
   - Daily action: Tap the prominent check-in button to record progress for the day.
   - Visual Feedback: A 21-circle progress matrix grid tracking completed vs pending days.
2. **Challenge Completion & Unlocking**:
   - Reaching Day 21/21 completes the challenge, triggers confetti celebration, and moves the habit to the **Mastered Habits Wall of Fame**.
   - User then selects their next 21-day challenge from the Habit Library or creates a custom habit.
3. **Today's Simple Checklist**:
   - Quick to-do checklist for secondary daily tasks with customizable pastel category tags (*Book Club*, *Self Care*, *Mindfulness*).
4. **My Journey Tab**:
   - Wall of Fame showing cumulative mastered habits count and completion badges.
   - Habit Library featuring curated 21-day challenges + custom habit generator.

---

## 💻 Tech Stack & Architecture
* **Frontend**: React 19 + Vite 8
* **Styling**: Vanilla CSS with custom CSS tokens (`index.css` & `App.css`), mobile-first viewport (max 480px).
* **Icons & FX**: `lucide-react`, `canvas-confetti`
* **Data Persistence**: `localStorage` auto-sync keys (`49habits_middleground_active`, `49habits_middleground_mastered`, `49habits_middleground_todos`).

---

## 🚀 Running the Project
* **Dev Server**: `npm run dev` (Runs on `http://localhost:5173/`)
* **Production Build**: `npm run build` (Vite client build output to `dist/`)

---

## 🤝 Instructions for Future Agents
When extending or maintaining this project:
1. **Maintain Minimalist Balance**: Keep the UI clean, structured, and frictionless. Avoid adding heavy dark modes, complex morning/evening time-blocks, or intrusive popups unless explicitly requested by the user.
2. **Preserve the 21-Day Core Engine**: The 21-day single habit progression is the heart of this application. Ensure state transitions, completion checks, and LocalStorage sync preserve 21-day challenge data integrity.
