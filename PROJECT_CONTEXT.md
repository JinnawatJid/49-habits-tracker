# Project Context: 49 Habits Tracker

## Overview
A gamified 21-day single habit progression web app inspired by Chapter 1 of *49 habits นิสัยง่ายๆ ชีวิตโคตรดี*. Users level up sequentially through 49 levels (Level 1 → Level 2 → Level 49) by completing 21 days of check-ins per level.

## Core Rules & Guardrails
1. **Wireframe Approval First**: Always generate a mockup and get user approval before touching UI code.
2. **Zero Mock Data & Debug Text**: No dummy lists or developer debug labels on screen.
3. **Echo-Free Realtime Sync**: Guarded with `isInitializedRef` and `isRemoteUpdateRef` against race conditions.
4. **Pre-Submission Audits**: Review code and test multi-tab sync before claiming completion.

## Key Files
- `src/App.jsx`: Main React component featuring single 21-day card, 21-circle matrix grid, and 49 sequential levels roadmap.
- `src/syncEngine.js`: Supabase real-time sync client (`fetchSupabaseData`, `pushSupabaseData`, `subscribeSupabaseRealtime`).
- `src/supabaseClient.js`: Supabase client initializer.
- `SUPABASE_SETUP.sql`: Database schema migration script.
- `DESIGN_SYSTEM_AND_LEARNINGS.md`: Design system tokens and learned behavioral rules.
