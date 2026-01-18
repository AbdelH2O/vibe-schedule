# Implementation Plan: Definition Mode - Context Management

**Branch**: `002-context-management` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-context-management/spec.md`

## Summary

Implement full CRUD operations for Contexts in Definition Mode, allowing users to create, view, edit, and delete contexts with all configurable properties (name, priority, min/max duration, weight, important dates). The existing store layer from Phase 1 already provides the data model and reducer actions; this phase focuses on building the UI components and integrating them with the store.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 16.1.3, React 19.2.3, shadcn/ui, Lucide React, Radix UI primitives
**Storage**: Browser localStorage (via lib/storage.ts utilities)
**Testing**: Manual testing via `pnpm dev`, `pnpm lint`, `pnpm build`
**Target Platform**: Web browser (modern browsers with localStorage support)
**Project Type**: Web application (single Next.js project with App Router)
**Performance Goals**: Instant UI response (<100ms), smooth interactions at 60fps
**Constraints**: Offline-capable (localStorage), single-device persistence
**Scale/Scope**: Up to 20 contexts per user, single-user application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Flow Over Rigidity | ✅ Pass | Context management doesn't interrupt user flow; forms are inline/modal without blocking |
| II. Context-First Architecture | ✅ Pass | Feature directly implements context management as primary organizational unit |
| III. Flexible Constraints | ✅ Pass | All context properties (min/max duration, weight, priority) are optional with sensible defaults |
| IV. Simplicity First | ✅ Pass | Using existing store actions, shadcn/ui components; no new abstractions needed |
| V. Dual-Mode Clarity | ✅ Pass | Context management only available in Definition Mode (existing mode check in store) |

**Stack Requirements**:
- ✅ Next.js 16 with App Router
- ✅ React 19 with client components for interactive forms
- ✅ shadcn/ui for UI components (Button, Card, Input, Badge, Sheet, etc.)
- ✅ TypeScript strict mode
- ✅ Tailwind CSS 4
- ✅ pnpm

**Quality Gates**:
- ✅ Explicit prop interfaces for all components
- ✅ 'use client' directives for interactive components
- ✅ Keyboard navigation and ARIA labels for accessibility

## Project Structure

### Documentation (this feature)

```text
specs/002-context-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A - no external APIs
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── components/
│   ├── AppShell.tsx          # Existing - layout wrapper
│   ├── Header.tsx            # Existing - top navigation
│   ├── Sidebar.tsx           # Existing - will enhance with context actions
│   ├── ClientProvider.tsx    # Existing - hydration wrapper
│   ├── ModeIndicator.tsx     # Existing - mode display
│   ├── contexts/             # NEW - context management components
│   │   ├── ContextList.tsx       # List of contexts in sidebar
│   │   ├── ContextListItem.tsx   # Individual context row with priority indicator
│   │   ├── ContextForm.tsx       # Create/edit form (shared)
│   │   ├── ContextDetail.tsx     # Full context view with all properties
│   │   ├── ImportantDateList.tsx # List of important dates with countdowns
│   │   └── ImportantDateForm.tsx # Add/edit important date
│   └── shared/               # NEW - reusable UI patterns
│       ├── ConfirmDialog.tsx     # Delete confirmation dialog
│       └── EmptyState.tsx        # Empty list guidance
├── page.tsx              # Existing - will integrate context detail view
├── layout.tsx            # Existing - no changes needed
└── globals.css           # Existing - no changes needed

components/ui/            # shadcn/ui components (add as needed)
├── button.tsx            # Existing
├── card.tsx              # Existing
├── badge.tsx             # Existing
├── input.tsx             # Existing
├── sheet.tsx             # Existing
├── separator.tsx         # Existing
├── label.tsx             # NEW - form labels
├── select.tsx            # NEW - priority dropdown
├── alert-dialog.tsx      # NEW - delete confirmation
└── form.tsx              # NEW (optional) - form validation

lib/
├── types.ts              # Existing - Context, ImportantDate types
├── store.tsx             # Existing - all CRUD actions already implemented
├── storage.ts            # Existing - localStorage utilities
└── utils.ts              # Existing - cn() utility
```

**Structure Decision**: Single Next.js project following App Router conventions. New components go in `app/components/contexts/` to maintain feature isolation. shadcn/ui components in `components/ui/` provide consistent styling.

## Complexity Tracking

> No violations requiring justification. Implementation uses existing patterns and components.

| Aspect | Approach | Rationale |
|--------|----------|-----------|
| State Management | Use existing store.tsx reducer | Phase 1 already implemented all Context CRUD actions |
| Form Handling | React controlled components | Simple forms don't need form libraries |
| Validation | Inline validation in form components | Single validation rule (min ≤ max); no need for schema library |
| Date Handling | Native Date + ISO strings | Existing ImportantDate type uses ISO strings; simple countdown calculation |
