# Implementation Plan: Working Mode

**Branch**: `005-working-mode` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-working-mode/spec.md`

## Summary

Implement the focused execution phase of vibe-schedule where users execute work sessions with real-time countdown timers, context switching with time transfer, task completion tracking, and session lifecycle management. This phase builds on the existing Session data model and time allocation engine (Phase 4) to provide the runtime experience of Working Mode.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 16.1.3, React 19.2.3, shadcn/ui, Lucide React
**Storage**: Browser localStorage (via existing lib/storage.ts utilities)
**Testing**: Manual testing per verification strategy; pnpm lint, pnpm build
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Timer latency <1 second; context switch <200ms perceived delay
**Constraints**: Single-device, offline-capable; no backend; localStorage persistence
**Scale/Scope**: Single-user productivity app; typical session 30min-4hrs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Flow Over Rigidity | ✅ Pass | Context switching is seamless; overtime allowed; no mandatory confirmations for routine actions |
| II. Context-First Architecture | ✅ Pass | Tasks filtered by active context; views organized around contexts |
| III. Flexible Constraints | ✅ Pass | Time caps inform but allow user override (overtime mode) |
| IV. Simplicity First | ✅ Pass | Leveraging existing Session/ContextAllocation types; no new abstractions |
| V. Dual-Mode Clarity | ✅ Pass | Explicit mode transitions; read-only structure in Working Mode; clear separation of config vs session state |

**Quality Gates**:
- ✅ Components will have explicit prop interfaces
- ✅ Client components marked with 'use client'
- ✅ Interactive elements will be keyboard-navigable
- ⚠️ End session confirmation dialog needed (FR-012) - this is not "routine" so modal is acceptable

## Project Structure

### Documentation (this feature)

```text
specs/005-working-mode/
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
│   ├── session/           # Session setup components (Phase 4 - exists)
│   │   ├── SessionSetupDialog.tsx
│   │   ├── SessionDurationInput.tsx
│   │   ├── AllocationPreview.tsx
│   │   ├── OverCommitWarning.tsx
│   │   └── NoContextsMessage.tsx
│   ├── working/           # NEW: Working Mode components
│   │   ├── WorkingModeView.tsx       # Main container for Working Mode
│   │   ├── ActiveContextPanel.tsx    # Shows current context with timer
│   │   ├── ContextTimer.tsx          # Countdown timer component
│   │   ├── SessionTimer.tsx          # Overall session time remaining
│   │   ├── ContextSwitcher.tsx       # List of contexts to switch to
│   │   ├── WorkingTaskList.tsx       # Read-only task list with completion
│   │   ├── WorkingTaskItem.tsx       # Individual task with checkbox
│   │   ├── SessionControls.tsx       # Pause/Resume/End buttons
│   │   ├── EndSessionDialog.tsx      # Confirmation before ending
│   │   └── SessionSummary.tsx        # Post-session summary modal
│   ├── contexts/          # Context management (exists)
│   └── tasks/             # Task management (exists)
├── page.tsx               # Main page (will conditionally render based on mode)
└── layout.tsx             # Root layout (exists)

lib/
├── types.ts               # Core types (exists - Session, ContextAllocation)
├── store.tsx              # State management (exists - has session actions)
├── storage.ts             # localStorage utilities (exists)
├── allocation.ts          # Time allocation algorithm (exists)
├── timer.ts               # NEW: Timer utilities (tick calculation, formatting)
└── utils.ts               # General utilities (exists)

components/ui/             # shadcn/ui components (exists)
```

**Structure Decision**: Web application pattern using Next.js App Router. All Working Mode components are client components ('use client') as they require real-time state updates for timers.

## Complexity Tracking

No violations requiring justification. Implementation uses existing patterns and types.
