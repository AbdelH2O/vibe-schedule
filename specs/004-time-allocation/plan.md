# Implementation Plan: Time Allocation Engine

**Branch**: `004-time-allocation` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-time-allocation/spec.md`

## Summary

Implement the time allocation algorithm that distributes session time across contexts based on weights and duration constraints. Users enter available session time, see a preview of allocations, and confirm to start working mode. The algorithm follows a defined sequence: allocate minimums first, distribute remaining time by weights, enforce maximum caps with redistribution.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode) + Next.js 16.1.3, React 19.2.3
**Primary Dependencies**: shadcn/ui, Lucide React, Radix UI primitives
**Storage**: Browser localStorage (via lib/storage.ts utilities)
**Testing**: Not requested - manual testing via `pnpm dev`, `pnpm lint`, `pnpm build`
**Target Platform**: Web browser (single-device, offline-capable)
**Project Type**: Next.js App Router (single project)
**Performance Goals**: Allocation calculations complete instantly (<50ms for 1-20 contexts)
**Constraints**: Pure client-side; no external APIs; data persists in localStorage
**Scale/Scope**: Single user, ~1-20 contexts typical, ~100 tasks maximum

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Flow Over Rigidity | ✅ Pass | Preview before commit; user can cancel/modify; no mandatory confirmations |
| II. Context-First Architecture | ✅ Pass | Allocations are per-context; algorithm respects context properties |
| III. Flexible Constraints | ✅ Pass | Min/max/weight inform allocation without rigidity; user can override warnings |
| IV. Simplicity First | ✅ Pass | Pure function for allocation; no premature abstractions |
| V. Dual-Mode Clarity | ✅ Pass | Session setup is in definition mode; confirmation transitions to working mode |

**Stack Compliance**: Next.js 16 App Router ✅ | React 19 ✅ | TypeScript strict ✅ | Tailwind CSS 4 ✅ | shadcn/ui ✅ | pnpm ✅

## Project Structure

### Documentation (this feature)

```text
specs/004-time-allocation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── components/
│   └── session/         # NEW: Session setup and preview components
│       ├── SessionSetupDialog.tsx
│       ├── AllocationPreview.tsx
│       ├── SessionDurationInput.tsx
│       └── OverCommitWarning.tsx
├── page.tsx             # Add session start trigger
└── ...

lib/
├── allocation.ts        # NEW: Time allocation algorithm (pure function)
├── store.tsx            # Already has startSession action
├── types.ts             # Session, ContextAllocation types exist
└── ...

components/ui/           # shadcn/ui components (existing)
```

**Structure Decision**: Next.js App Router single project. Session UI components go in `app/components/session/`. Core allocation logic is a pure function in `lib/allocation.ts` for testability.

## Complexity Tracking

No violations to justify. Implementation uses existing patterns and simple pure functions.

## Post-Design Constitution Validation

*Re-check after Phase 1 design artifacts complete.*

| Principle | Status | Design Evidence |
|-----------|--------|-----------------|
| I. Flow Over Rigidity | ✅ Pass | Dialog-based preview allows cancel/modify; no blocking modals |
| II. Context-First Architecture | ✅ Pass | Allocations keyed by contextId; algorithm reads context properties |
| III. Flexible Constraints | ✅ Pass | Over-commit warning offers options, not blocks; user can proceed |
| IV. Simplicity First | ✅ Pass | Single pure function; 4 focused UI components; no abstractions |
| V. Dual-Mode Clarity | ✅ Pass | Setup in definition mode; startSession() transitions to working |

**Design artifacts validated**: research.md, data-model.md, quickstart.md
