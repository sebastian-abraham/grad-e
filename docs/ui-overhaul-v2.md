# UI/UX Overhaul v2 — Indigo Design System

**Date:** May 6, 2026  
**Scope:** Global CSS, Login, all Dashboard pages, Layouts, and Inline Styles

---

## Overview

This overhaul addressed three core issues with the previous frontend design:

1. **Muddy off-white colors** — The old palette used warm, brownish tones (`#f6f4f2`, `#f4efed`, `#f6eeea`, `#efe3db`, `#f2e2d8`, `#f4e7df`) that clashed with pure white cards, making the design feel unpolished and inconsistent.
2. **Flat, lifeless UI** — The sidebar, topbar, and cards lacked visual depth and separation.
3. **Missing color "flavor"** — Everything was muted blue/gray with no vibrant accent.

## New Design System

### Color Palette

| Token | Old Value | New Value | Purpose |
|---|---|---|---|
| `--app-bg` | `#f6f4f2` (warm gray) | `#F1F5F9` (cool slate) | Main background |
| `--panel-bg` | `#f4efed` (warm beige) | `#F1F5F9` (cool slate) | Panel background |
| `--ink` | `#2e3338` | `#1E293B` (slate-800) | Primary text |
| `--muted` | `#6a7480` | `#64748B` (slate-500) | Secondary text |
| `--card` | `#f8f8f8` | `#FFFFFF` (pure white) | Card backgrounds |
| `--line` | `#e3e5e8` | `#E2E8F0` (slate-200) | Borders |
| `--sidebar` | `#f2f3f5` | `#FFFFFF` | Sidebar background |
| `--accent` | `#3e65cc` (flat blue) | `#6366F1` (indigo-500) | Primary accent |
| `--accent-strong` | `#2e56be` | `#4F46E5` (indigo-600) | Strong accent |
| `--success` | `#30a65d` | `#10B981` (emerald-500) | Success states |
| `--warning` | `#f39d48` | `#F59E0B` (amber-500) | Warning states |

### New Tokens Added

- `--accent-light`: `rgba(99, 102, 241, 0.08)` — subtle accent backgrounds
- `--accent-glow`: `rgba(99, 102, 241, 0.16)` — accent glow effects
- `--gradient-accent`: `linear-gradient(135deg, #6366F1, #8B5CF6)` — primary gradient
- `--gradient-accent-hover`: `linear-gradient(135deg, #4F46E5, #7C3AED)` — hover gradient
- `--shadow-elevated`: Stronger shadow for floating elements
- `--danger`: `#EF4444` — destructive action color

### Status Chip Colors

| Status | Old BG/Text | New BG/Text |
|---|---|---|
| Draft | `#eef0f3` / `#5a6675` | `#F1F5F9` / `#475569` |
| Setup Complete | `#f8d58f` / `#8a5203` | `#FEF3C7` / `#92400E` |
| Sheets Uploaded | `#8fddb5` / `#065f46` | `#D1FAE5` / `#065F46` |
| Processing | `#f5bb8d` / `#9a4600` | `#FFEDD5` / `#9A3412` |
| Graded | `#54b67e` / `#ffffff` | `#6366F1` / `#FFFFFF` |

## Files Modified

### Core CSS
- **`src/index.css`** — Complete rewrite of `:root` variables, sidebar, topbar, cards, buttons, and all responsive breakpoints.
- **`src/components/Login.css`** — Replaced warm blue gradient with indigo/violet tones, modernized glassmorphism.

### Layout Components
- **`src/components/AdminLayout.jsx`** — No changes needed (uses CSS classes).
- **`src/components/TeacherLayout.jsx`** — No changes needed.
- **`src/components/StudentLayout.jsx`** — No changes needed.

### Dashboard Pages
- **`src/pages/AdminDashboard.jsx`** — Updated `getStatusColor()`, icon colors, chip colors.
- **`src/pages/TeacherDashboard.jsx`** — Updated `getStatusColor()`, icon colors.
- **`src/pages/StudentDashboard.jsx`** — Updated `getStatusColor()`, icon colors.

### Management Pages
- **`src/pages/UserManagement.jsx`** — Replaced warm beige filter bar (`#f6eeea` → `#FFFFFF`), tab backgrounds (`#efe6e1` → `#F1F5F9`), table header (`#efe3db` → `#F1F5F9`), avatar colors, role badges.
- **`src/pages/ClassManagement.jsx`** — Replaced warm beige filter bar, updated roster link accent.
- **`src/pages/ClassDetail.jsx`** — Updated student avatar from warm brown to indigo gradient.
- **`src/pages/AssignmentManagement.jsx`** — Updated eyebrow text color, status overview sidebar background and borders.
- **`src/pages/SubjectManagement.jsx`** — Updated create button to indigo.

### Detail Pages
- **`src/pages/ExamDetail.jsx`** — Updated panel shadow to use CSS variable.

### No Changes Needed
- **`src/components/SkeletonUI.jsx`** — Already used `#e2e8f0` / `#f8fafc` tones.

## Design Principles

1. **Cool-toned palette** — All backgrounds use slate/cool-gray tones (`#F1F5F9`, `#F8FAFC`) instead of warm beige.
2. **Pure white cards** — Cards now contrast cleanly against the slate background.
3. **Indigo accent gradient** — The primary accent uses a vibrant indigo-to-violet gradient for CTAs and active elements.
4. **Consistent borders** — All borders use `var(--line)` (slate-200) for consistency.
5. **Elevation through shadow** — Three shadow levels: `--shadow-soft`, `--shadow-float`, `--shadow-elevated`.
6. **Glassmorphic topbar** — Topbar uses `backdrop-filter: blur(12px)` with semi-transparent white.
7. **Gradient brand name** — The "Grade-E" sidebar logo uses the accent gradient with `-webkit-background-clip: text`.
