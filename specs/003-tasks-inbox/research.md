# Research: Tasks & Inbox

**Feature**: 003-tasks-inbox
**Date**: 2026-01-18

## Overview

This research validates that existing infrastructure supports all task management requirements and identifies the minimal UI components needed.

## Existing Infrastructure Analysis

### Store Actions (lib/store.tsx)

All required task operations are already implemented:

| Action | Signature | Status |
|--------|-----------|--------|
| `addTask` | `(task: Omit<Task, 'id' \| 'createdAt' \| 'updatedAt' \| 'completed'>) => void` | ✅ Exists |
| `updateTask` | `(id: string, updates: Partial<Task>) => void` | ✅ Exists |
| `deleteTask` | `(id: string) => void` | ✅ Exists |
| `toggleTaskCompleted` | `(id: string) => void` | ✅ Exists |
| `moveTaskToContext` | `(taskId: string, contextId: string \| null) => void` | ✅ Exists |

### Selectors (lib/store.tsx)

| Selector | Signature | Status |
|----------|-----------|--------|
| `getTasksByContextId` | `(contextId: string \| null) => Task[]` | ✅ Exists |
| `getInboxTasks` | `() => Task[]` | ✅ Exists |

### Data Model (lib/types.ts)

```typescript
interface Task {
  id: string;
  title: string;
  contextId: string | null; // null = inbox
  deadline?: string; // ISO date string, display only
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Decision**: No modifications to store or types needed.
**Rationale**: Phase 1 already implemented complete task infrastructure anticipating this phase.
**Alternatives Considered**: None—existing implementation is sufficient.

## UI Component Strategy

### Pattern Analysis from Phase 2

Context management established these patterns:
- List components in sidebar with selection state
- Detail view in main content area
- Dialog-based creation (CreateContextDialog)
- Inline forms for quick edits
- ConfirmDialog for destructive actions

**Decision**: Mirror these patterns for task management.
**Rationale**: Consistency with existing UX; users already familiar with the interaction model.
**Alternatives Considered**:
- Inline task creation (no dialog) — Rejected for consistency, though could be added later as enhancement
- Full-page task view — Rejected as overkill for simple task items

### Component Requirements

| Component | Purpose | shadcn/ui Dependencies |
|-----------|---------|----------------------|
| TaskList | Display tasks for context or inbox | None (composition) |
| TaskListItem | Single task with checkbox, title, actions | Checkbox, Button |
| TaskForm | Title, context, deadline inputs | Input, Select, Button |
| CreateTaskDialog | Modal wrapper for TaskForm | Dialog |
| EditTaskDialog | Modal wrapper for TaskForm with existing data | Dialog |

### Missing shadcn/ui Component

**Checkbox component** not yet installed.

**Decision**: Install shadcn/ui checkbox component.
**Rationale**: Standard accessible checkbox with consistent styling.
**Command**: `pnpm dlx shadcn@latest add checkbox`

## Inbox UX Pattern

### Navigation Integration

The Inbox needs to appear in the sidebar alongside contexts.

**Decision**: Add "Inbox" as a special entry at the top of the sidebar, always visible.
**Rationale**:
- Users expect quick access to unsorted items
- GTD methodology: Inbox is the capture point
- Visual distinction from contexts (different icon, fixed position)

### Selection State

Currently, sidebar tracks `selectedContextId: string | null`.

**Decision**: Extend to track selection type: `{ type: 'inbox' } | { type: 'context', id: string } | null`
**Rationale**: Clear distinction between "no selection" and "Inbox selected"
**Alternatives Considered**:
- Use special string ID like "INBOX" — Rejected; mixes concerns with actual context IDs
- Separate boolean `isInboxSelected` — Rejected; more state to manage

## Task Display in Context Detail

Currently, ContextDetail shows context properties and important dates.

**Decision**: Add TaskList section below important dates.
**Rationale**: Natural extension of context detail view; shows related work items.

## Deadline Display

Per spec, deadlines are informational indicators only.

**Decision**: Display deadline as relative time (e.g., "in 3 days", "overdue by 2 days").
**Rationale**:
- Consistent with ImportantDate countdown pattern in contexts
- Relative time is more actionable than absolute dates
- Existing `lib/dates.ts` has formatting utilities

## Edge Cases

### Context Deletion with Tasks

**Behavior**: Already implemented in store reducer (line 70-80):
```typescript
case 'DELETE_CONTEXT': {
  // Move tasks from deleted context to inbox
  return {
    ...state,
    contexts: state.contexts.filter((ctx) => ctx.id !== action.payload),
    tasks: state.tasks.map((task) =>
      task.contextId === action.payload
        ? { ...task, contextId: null, updatedAt: now() }
        : task
    ),
  };
}
```

**Decision**: No additional work needed.

### Empty Title Validation

**Decision**: Validate in TaskForm component; disable submit when title is empty/whitespace.
**Rationale**: Client-side validation is sufficient for single-user app.

### Long Task Titles

**Decision**: Truncate with ellipsis in list view; show full title on hover/focus.
**Rationale**: Maintains clean list appearance while preserving information access.

## Summary

No backend work required. Implementation consists entirely of:
1. Installing checkbox component
2. Building 5 new UI components
3. Modifying Sidebar for Inbox entry
4. Modifying ContextDetail for task list
5. Updating page.tsx for Inbox view
