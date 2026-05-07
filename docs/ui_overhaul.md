# UI Overhaul — Auto-Hide Sidebar & Visual Refresh

## Overview

This update redesigns the application shell across all three roles (Admin, Teacher, Student) with a modern auto-hide sidebar and refined visual tokens.

## Changes

### 1. Auto-Hide Sidebar

**Before:** A fixed 260px sidebar was always visible on desktop, using a hamburger menu toggle only on mobile.

**After:** The sidebar is now **64px** by default, showing only icons. On hover, it smoothly expands to **240px** revealing text labels. This gives the main content area significantly more breathing room.

| Feature | Details |
|---|---|
| Collapsed width | 64px (icons only) |
| Expanded width | 240px (icons + labels) |
| Trigger | Mouse hover |
| Transition | 280ms cubic-bezier ease |
| Brand | "G" icon badge always visible, "Grade-E" text on expand |
| Logout | Dedicated button at sidebar bottom |
| Mobile | Full overlay via hamburger menu, 260px wide |

### 2. Class Name Migration

All layout class names were migrated from `teacher-*` prefixed names to generic names:

| Old Class | New Class |
|---|---|
| `.teacher-shell` | `.shell` |
| `.teacher-sidebar` | `.sidebar` |
| `.teacher-main` | `.main-area` |
| `.teacher-topbar` | `.topbar` |
| `.teacher-backdrop` | `.sidebar-backdrop` |
| `.teacher-menu-btn` | `.mobile-menu-btn` |
| `.teacher-profile-btn` | `.topbar-profile-btn` |
| `.teacher-profile-menu` | `.topbar-profile-menu` |
| `.teacher-avatar` | `.topbar-avatar` |

> **Note:** Dashboard-level classes (`teacher-dashboard`, `teacher-card-row`, `teacher-exam-card`, etc.) remain unchanged since they are used inside page components and are independent of the shell.

### 3. New Sidebar Elements

| Class | Purpose |
|---|---|
| `.sidebar-brand-icon` | 32px branded "G" icon |
| `.sidebar-brand-text` | Fades in on hover |
| `.sidebar-link-icon` | Fixed 20×20 icon container |
| `.sidebar-link-text` | Fades in on hover |
| `.sidebar-footer` | Bottom section with border |
| `.sidebar-logout-btn` | Red-on-hover logout button |

### 4. Topbar Enhancements

- Added `.topbar-breadcrumb` showing role context ("Admin Panel", "Teacher Panel", "Student Portal")
- Added `.topbar-profile-name` showing user display name (hidden on mobile)
- Frosted glass effect with `backdrop-filter: blur(16px)`
- Height reduced from 64px to 60px for a tighter feel

### 5. Design Token Refinements

| Token | Before | After |
|---|---|---|
| `--app-bg` | `#F1F5F9` | `#F4F6FA` |
| `--ink` | `#1E293B` | `#1A1D2E` |
| `--line` | `#E2E8F0` | `#E8ECF4` |
| `--sidebar` | `#FFFFFF` | `#FAFBFE` |
| Shadows | Heavier | Softer, more subtle |

### 6. Responsive Behavior

- **≤960px**: Sidebar collapses to 0px, hamburger menu triggers full overlay sidebar
- **≤768px**: Page wrapper padding reduced, profile name hidden
- **≤540px**: Topbar padding tightened further

## Files Changed

- `frontend/src/components/AdminLayout.jsx` — Rewritten
- `frontend/src/components/TeacherLayout.jsx` — Rewritten
- `frontend/src/components/StudentLayout.jsx` — Rewritten
- `frontend/src/index.css` — Shell/sidebar/topbar/responsive sections rewritten, tokens refined
