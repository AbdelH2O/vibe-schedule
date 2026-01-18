# Implementation Plan: Foundation & Data Model

**Branch**: `001-foundation-data-model` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-foundation-data-model/spec.md`

## Summary

Establish the foundational data layer and application shell for Vibe-Schedule. This includes TypeScript type definitions for all core entities (Context, Task, Session), localStorage persistence with error handling, React Context-based state management, and a basic application shell layout with mode indicator. The data layer is already partially implemented in `lib/`; this plan completes the remaining work and connects the UI.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 16.1.3, React 19.2.3
**Storage**: Browser localStorage (single-device, offline-capable)
**Testing**: Manual testing via `pnpm dev`, `pnpm lint`, `pnpm build`
**Target Platform**: Modern browsers (desktop and mobile)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Page load < 2 seconds, instant state updates
**Constraints**: No external APIs, single-user, localStorage-only persistence
**Scale/Scope**: Single user, typical data: 10-50 contexts, 100-500 tasks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Flow Over Rigidity | ✅ PASS | No fixed time blocks; data model supports dynamic allocation |
| II. Context-First Architecture | ✅ PASS | Context is top-level entity; Tasks belong to Contexts |
| III. Flexible Constraints | ✅ PASS | All duration/weight fields optional; indicators not alarms |
| IV. Simplicity First | ✅ PASS | Using built-in React Context, no external state libs; direct localStorage |
| V. Dual-Mode Clarity | ✅ PASS | AppMode type explicitly separates 'definition' and 'working' |

**Technical Standards Check:**
- ✅ Next.js 16 with App Router
- ✅ React 19 with explicit 'use client' directives
- ✅ TypeScript strict mode enabled
- ✅ Tailwind CSS 4 for styling
- ✅ pnpm as package manager

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation-data-model/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
app/
├── layout.tsx           # Root layout - ADD StoreProvider wrapper
├── page.tsx             # Main page - REPLACE with app shell
├── globals.css          # Global styles (existing)
└── components/          # NEW: UI components
    ├── AppShell.tsx     # Main layout structure
    ├── ModeIndicator.tsx # Definition/Working mode display
    └── Sidebar.tsx      # Navigation placeholder

lib/
├── types.ts             # EXISTING: Core TypeScript types (review & validate)
├── storage.ts           # EXISTING: localStorage utilities (review & validate)
└── store.tsx            # EXISTING: React Context store (fix import issue)
```

**Structure Decision**: Uses Next.js App Router structure. All new components go in `app/components/`. Data layer in `lib/` is already scaffolded and mostly complete.

## Complexity Tracking

No constitution violations requiring justification. Implementation uses standard patterns.

## Implementation Tasks

### Task 1: Validate and Fix Existing Data Layer

**Files**: `lib/types.ts`, `lib/storage.ts`, `lib/store.tsx`

The existing implementation needs review:

1. **lib/types.ts** - Validate against spec clarifications:
   - Priority is 1-5 (current uses "higher = more important" comment, spec says 1=highest)
   - All other types align with spec

2. **lib/store.tsx** - Fix import ordering:
   - `useState` import is at the bottom of the file (line 389)
   - Move to top with other React imports

3. **lib/storage.ts** - Already complete, no changes needed

### Task 2: Create Application Shell Component

**File**: `app/components/AppShell.tsx`

Create the main layout structure with:
- Header area with app title and mode indicator
- Sidebar placeholder for context/task navigation
- Main content area
- Responsive design (mobile-first)

### Task 3: Create Mode Indicator Component

**File**: `app/components/ModeIndicator.tsx`

Display current mode (Definition/Working) with:
- Visual distinction between modes
- Read-only display (mode switching is Phase 5)
- Accessible markup

### Task 4: Create Sidebar Component

**File**: `app/components/Sidebar.tsx`

Placeholder sidebar for future context/task lists:
- Empty state messaging
- Structural placeholder for Phases 2-3
- Collapsible on mobile

### Task 5: Integrate Store Provider into Layout

**File**: `app/layout.tsx`

- Import StoreProvider from `lib/store.tsx`
- Wrap children with StoreProvider
- Update metadata (title, description)

### Task 6: Replace Default Page with App Shell

**File**: `app/page.tsx`

- Remove Next.js boilerplate
- Render AppShell component
- Show hydration state appropriately

## Verification Strategy

After implementation:

1. **Development server**: `pnpm dev`
   - App loads without errors
   - Shell layout visible on desktop and mobile
   - Mode indicator shows "Definition"

2. **Lint check**: `pnpm lint`
   - No ESLint errors or warnings

3. **Build check**: `pnpm build`
   - Production build succeeds
   - No TypeScript errors

4. **Persistence test**:
   - Open browser DevTools > Application > localStorage
   - Verify `vibe-schedule-state` key exists after first load
   - Refresh page - state persists
   - Clear localStorage - app shows empty state correctly

5. **Error recovery test**:
   - Manually corrupt localStorage value
   - Refresh - app recovers to default state without crash

## Dependencies

- None - this is the foundation phase

## Risks

| Risk | Mitigation |
|------|------------|
| localStorage unavailable (private browsing) | Already handled in storage.ts with SSR check |
| Hydration mismatch between server/client | StoreProvider uses isHydrated flag |
| Priority scale confusion (1 vs 5 = high) | Document clearly in types.ts comments |

## Constitution Re-Check (Post-Design)

All principles remain satisfied after Phase 1 design:

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Flow Over Rigidity | ✅ PASS | Data model uses optional durations, no fixed scheduling |
| II. Context-First Architecture | ✅ PASS | Context→Task relationship clear in data-model.md |
| III. Flexible Constraints | ✅ PASS | All constraints optional; ImportantDate for indicators only |
| IV. Simplicity First | ✅ PASS | No new abstractions; existing lib/ code reused |
| V. Dual-Mode Clarity | ✅ PASS | AppMode type + ModeIndicator component planned |

**No constitution violations.** Ready for task generation.
