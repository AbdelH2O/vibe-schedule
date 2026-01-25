# Implementation Plan: Nested Task Hierarchy

**Branch**: `001-nested-task-hierarchy` | **Date**: 2026-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-nested-task-hierarchy/spec.md`

## Summary

Enable unlimited nesting of tasks within a parent-child hierarchy. Users can create subtasks under any task, expand/collapse parent tasks to show/hide children (accordion UI), and focus on any task to drill into its subtree with breadcrumb navigation back to ancestors. Progress indicators show direct-child completion status. Works in both definition and working modes.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 16, React 19, shadcn/ui, Radix UI primitives, @dnd-kit (existing), fractional-indexing (existing)
**Storage**: localStorage (existing lib/storage.ts) + Supabase PostgreSQL (cross-device sync)
**Testing**: Manual testing (no automated test framework in project)
**Target Platform**: Web (desktop + mobile browsers)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Instant expand/collapse for 20+ children (SC-003), no perceptible delay
**Constraints**: Offline-capable, localStorage-first with cloud sync
**Scale/Scope**: Single user, hundreds of tasks, ~5-7 nesting levels practical maximum

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Flow Over Rigidity | PASS | Focus/breadcrumb navigation supports user flow without interruption |
| II. Context-First Architecture | PASS | Tasks remain within contexts; hierarchy is orthogonal to context ownership |
| III. Flexible Constraints | PASS | No rigid depth limits; user retains control |
| IV. Simplicity First | PASS | Adding `parentId` to Task is minimal change; no premature abstractions |
| V. Dual-Mode Clarity | PASS | Feature works in both modes with same behavior; mode distinction preserved |

**Quality Gates**:
- [x] Components typed with explicit prop interfaces
- [x] Client components marked with `'use client'`
- [x] Accessibility: expand/collapse keyboard-navigable, breadcrumbs navigable

## Project Structure

### Documentation (this feature)

```text
specs/001-nested-task-hierarchy/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal state contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
lib/
├── types.ts             # Task interface + new hierarchy types
├── store.tsx            # Add hierarchy actions to reducer
├── storage.ts           # Expansion state persistence
├── position.ts          # Existing fractional indexing (reuse)
└── taskHierarchy.ts     # NEW: Helper functions for tree operations

app/components/
├── tasks/
│   ├── TaskListItem.tsx       # Add expand/collapse, focus trigger, progress
│   ├── SortableTaskItem.tsx   # Hierarchy-aware drag-and-drop
│   ├── SortableTaskList.tsx   # Filter by parentId
│   ├── NestedTaskList.tsx     # NEW: Recursive task rendering
│   └── TaskBreadcrumb.tsx     # NEW: Focus navigation breadcrumb
├── contexts/
│   └── ContextDetail.tsx      # Integrate breadcrumb + focus state
└── working/
    ├── WorkingTaskList.tsx    # Integrate nested display
    └── WorkingTaskItem.tsx    # Add expand/collapse, progress
```

**Structure Decision**: Extends existing Next.js App Router structure. New components placed alongside existing task components. Shared hierarchy logic extracted to `lib/taskHierarchy.ts`.

## Complexity Tracking

> No violations. Design follows Simplicity First principle.

| Aspect | Approach | Justification |
|--------|----------|---------------|
| Data Model | Single `parentId` field on Task | Minimal schema change, no separate tables |
| Tree Operations | Helper functions, not class hierarchies | Functions are testable and composable |
| UI State | React useState for focus/expansion | Co-located with components, no global state overhead |
| Persistence | Expansion state in localStorage | Matches existing patterns for preferences |
