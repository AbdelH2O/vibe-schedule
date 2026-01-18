# Implementation Plan: Definition Mode - Tasks & Inbox

**Branch**: `003-tasks-inbox` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-tasks-inbox/spec.md`

## Summary

Implement Task CRUD operations and Inbox functionality for Definition Mode, completing the "Definition Mode" experience. Users can create tasks (defaulting to Inbox), assign them to contexts, mark them complete, edit, and delete them. The store layer from Phase 1 already provides all task actions (`addTask`, `updateTask`, `deleteTask`, `toggleTaskCompleted`, `moveTaskToContext`) and selectors (`getTasksByContextId`, `getInboxTasks`). This phase focuses on building UI components and integrating with the existing store.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 16.1.3, React 19.2.3, shadcn/ui, Lucide React, Radix UI primitives
**Storage**: Browser localStorage (via lib/storage.ts utilities)
**Testing**: Manual testing via `pnpm dev`, `pnpm lint`, `pnpm build`
**Target Platform**: Web browser (modern browsers with localStorage support)
**Project Type**: Web application (single Next.js project with App Router)
**Performance Goals**: Instant UI response (<100ms), smooth interactions at 60fps
**Constraints**: Offline-capable (localStorage), single-device persistence
**Scale/Scope**: Up to 100 tasks per user, up to 20 contexts, single-user application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Flow Over Rigidity | ✅ Pass | Quick task capture without mandatory context assignment; inline editing |
| II. Context-First Architecture | ✅ Pass | Tasks live within contexts; Inbox is staging area (not permanent) |
| III. Flexible Constraints | ✅ Pass | All task properties optional except title; deadlines are informational only |
| IV. Simplicity First | ✅ Pass | Using existing store actions; no new state management; shadcn/ui components |
| V. Dual-Mode Clarity | ✅ Pass | Task creation/editing in Definition Mode only; completion toggle allowed in both modes |

**Stack Requirements**:
- ✅ Next.js 16 with App Router
- ✅ React 19 with client components for interactive forms
- ✅ shadcn/ui for UI components
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
specs/003-tasks-inbox/
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
│   ├── Sidebar.tsx           # Existing - will add Inbox entry
│   ├── ClientProvider.tsx    # Existing - hydration wrapper
│   ├── ModeIndicator.tsx     # Existing - mode display
│   ├── contexts/             # Existing - context management
│   │   ├── ContextDetail.tsx     # Modify to show task list
│   │   └── ...
│   ├── tasks/                # NEW - task management components
│   │   ├── TaskList.tsx          # List of tasks (reusable for context & inbox)
│   │   ├── TaskListItem.tsx      # Individual task row with checkbox
│   │   ├── TaskForm.tsx          # Create/edit task form
│   │   ├── CreateTaskDialog.tsx  # Modal for new task creation
│   │   └── EditTaskDialog.tsx    # Modal for task editing
│   └── shared/               # Existing - reusable UI patterns
│       ├── ConfirmDialog.tsx     # Existing - delete confirmation
│       └── EmptyState.tsx        # Existing - empty list guidance
├── page.tsx              # Modify to show Inbox view when selected
├── layout.tsx            # Existing - no changes needed
└── globals.css           # Existing - no changes needed

components/ui/            # shadcn/ui components
├── checkbox.tsx          # NEW - task completion toggle
├── dialog.tsx            # Existing - modal dialogs
├── select.tsx            # Existing - context assignment
└── ...                   # Other existing components

lib/
├── types.ts              # Existing - Task type already defined
├── store.tsx             # Existing - all task actions already implemented
├── storage.ts            # Existing - localStorage utilities
├── dates.ts              # Existing - date utilities
└── utils.ts              # Existing - cn() utility
```

**Structure Decision**: Single Next.js project following App Router conventions. New task components go in `app/components/tasks/` to maintain feature isolation. Existing store actions and selectors are sufficient—no new state management code needed.

## Complexity Tracking

> No violations requiring justification. Implementation uses existing patterns and store actions.

| Aspect | Approach | Rationale |
|--------|----------|-----------|
| State Management | Use existing store.tsx actions | Phase 1 already implemented all Task CRUD actions and selectors |
| Form Handling | React controlled components | Simple forms with minimal validation (non-empty title) |
| Task Completion | Inline checkbox toggle | Single-click action, no confirmation needed per Flow Over Rigidity |
| Context Assignment | Select dropdown | Consistent with context management patterns |
| Inbox Display | Sidebar entry + main area view | Mirrors context selection pattern |

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design artifacts completed.*

| Principle | Status | Design Validation |
|-----------|--------|-------------------|
| I. Flow Over Rigidity | ✅ Pass | TaskForm allows quick capture; checkbox toggle is instant; no modal confirmations except delete |
| II. Context-First Architecture | ✅ Pass | Inbox explicitly designed as staging area; tasks belong to contexts; sidebar shows context hierarchy |
| III. Flexible Constraints | ✅ Pass | Only title required; deadline optional and informational; context assignment optional |
| IV. Simplicity First | ✅ Pass | 5 new components reusing existing store; no new state management patterns; shadcn/ui components |
| V. Dual-Mode Clarity | ✅ Pass | Mode check in UI components; completion works in both modes; create/edit restricted to Definition |

**Design Artifacts Completed**:
- ✅ research.md - Infrastructure validation, component strategy
- ✅ data-model.md - Task entity reference, UI state extensions
- ✅ quickstart.md - Setup guide, component patterns, testing checklist
- ✅ CLAUDE.md - Agent context updated with feature technologies

**Ready for**: `/speckit.tasks` to generate implementation task breakdown
