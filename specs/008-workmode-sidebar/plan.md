# Implementation Plan: Work Mode Sidebar

**Branch**: `008-workmode-sidebar` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-workmode-sidebar/spec.md`

## Summary

Implement a Gmail-style sidebar for Working Mode that provides visibility into important dates and reminders via a compact icon rail that expands into an overlay panel. The sidebar enables CRUD operations on deadlines and reminders without leaving work mode, includes deadline scope filtering (all contexts vs active only) with persistent preference, and adapts responsively for mobile viewports.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Framework**: Next.js 16 with App Router, React 19
**Primary Dependencies**: shadcn/ui, Radix UI primitives, Lucide React, Tailwind CSS 4
**Storage**: Browser localStorage (via existing lib/storage.ts utilities)
**Testing**: Manual testing (no automated test framework configured)
**Target Platform**: Web (Desktop + Mobile responsive)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Sidebar renders within 100ms, CRUD operations persist within 1 second
**Constraints**: Offline-capable (localStorage only), no external API dependencies
**Scale/Scope**: Single-user local application, typical < 50 contexts/reminders

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Flow Over Rigidity | **PASS** | Sidebar expands on demand without interrupting workflow; no focus trap or modal blocking |
| II. Context-First Architecture | **PASS** | Deadlines organized by context; scope filter respects context hierarchy |
| III. Flexible Constraints | **PASS** | Urgency indicators inform without forcing action; user controls expand/collapse |
| IV. Simplicity First | **PASS** | Reuses existing components (ReminderForm, AlertDialog); no new abstractions beyond necessary UI |
| V. Dual-Mode Clarity | **PASS** | Sidebar is Working Mode only; maintains mode separation |

**Stack Requirements Check:**
- [x] Next.js 16 with App Router
- [x] React 19 with client components where needed
- [x] shadcn/ui components
- [x] TypeScript strict mode
- [x] Tailwind CSS 4
- [x] pnpm package manager

**Quality Gates:**
- [x] Components will be typed with explicit prop interfaces
- [x] Client components marked with 'use client' directive
- [x] Interactive elements will be keyboard-navigable
- [x] Accessibility requirements met (aria-labels, screen reader support)

## Project Structure

### Documentation (this feature)

```text
specs/008-workmode-sidebar/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── components/
│   └── working/
│       ├── WorkingModeView.tsx      # Modified: integrate sidebar
│       ├── WorkingSidebar.tsx       # NEW: main sidebar container
│       ├── SidebarIconRail.tsx      # NEW: collapsed icon strip
│       ├── SidebarPanel.tsx         # NEW: expanded panel with tabs
│       ├── ImportantDatesTab.tsx    # NEW: dates content + form
│       ├── RemindersTab.tsx         # NEW: reminders content
│       ├── ImportantDateItem.tsx    # NEW: deadline list item
│       ├── ImportantDateForm.tsx    # NEW: add deadline form
│       └── WorkingTaskItem.tsx      # Modified: add delete action

lib/
├── store.tsx            # Modified: add sidebar preference actions
├── storage.ts           # Modified: add sidebar preference storage
└── types.ts             # Modified: add SidebarPreferences type

components/ui/
└── tabs.tsx             # Add if not present (shadcn component)
```

**Structure Decision**: This is a Next.js web application using the App Router pattern. All new components follow the existing `/app/components/working/` organization for Working Mode features. Shared UI components remain in `/components/ui/`.

## Complexity Tracking

No constitution violations requiring justification. All implementations follow existing patterns:
- State management via existing store pattern
- Forms follow ReminderForm pattern
- Dialogs use existing AlertDialog component
- Styling uses existing color utilities

## Phase 0: Research Summary

See [research.md](./research.md) for detailed findings.

**Key Decisions:**
1. **Panel positioning**: Absolute overlay from right edge, does not push content
2. **Click-outside detection**: Use Radix Popover primitive or custom hook for reliable detection
3. **Tab implementation**: Use shadcn/ui Tabs component with custom styling
4. **Preference storage**: Add to existing AppState, persisted via existing localStorage pattern
5. **Mobile approach**: Icon rail hidden, header toggle button reveals sheet-style panel

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**New Type:**
```typescript
interface SidebarPreferences {
  deadlineScopeFilter: 'all' | 'active-context';
}
```

**Store Additions:**
- `sidebarPreferences: SidebarPreferences` added to AppState
- `updateSidebarPreferences(preferences: Partial<SidebarPreferences>)` action

### Component Contracts

No external API contracts needed (client-side only feature). Internal component interfaces defined in data-model.md.

### Quickstart

See [quickstart.md](./quickstart.md) for implementation guide.
