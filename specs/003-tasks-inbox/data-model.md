# Data Model: Tasks & Inbox

**Feature**: 003-tasks-inbox
**Date**: 2026-01-18

## Overview

This document describes the data model for task management. The Task entity was defined in Phase 1 (001-foundation-data-model); this document serves as a reference and describes UI-specific state extensions.

## Entities

### Task (existing - lib/types.ts)

```typescript
interface Task {
  id: string;                    // Unique identifier (generated via generateId())
  title: string;                 // Required, non-empty
  contextId: string | null;      // Reference to Context.id, null = Inbox
  deadline?: string;             // Optional ISO date string, display only
  completed: boolean;            // Completion status
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

**Validation Rules**:
- `title`: Must be non-empty after trimming whitespace
- `contextId`: Must reference existing context or be null (Inbox)
- `deadline`: If present, must be valid ISO date string

**Lifecycle**:
```
Created → [Edit Title] → [Edit Deadline] → [Assign Context] → [Complete] → [Uncomplete] → [Delete]
                   ↑______________|_______________|              |
                                                                 ↓
                                                            (task removed)
```

### Inbox (virtual entity)

The Inbox is not a stored entity but a computed view:

```typescript
// Conceptual representation
type Inbox = {
  tasks: Task[];  // All tasks where task.contextId === null
  count: number;  // tasks.length
};

// Implementation via selector (lib/store.tsx)
getInboxTasks(): Task[] {
  return state.tasks.filter((task) => task.contextId === null);
}
```

## Relationships

```
┌─────────────┐         ┌─────────────┐
│   Context   │ 1───n   │    Task     │
│             │─────────│             │
│  id         │         │  contextId  │──┐
│  name       │         │  title      │  │
│  priority   │         │  completed  │  │
│  ...        │         │  ...        │  │
└─────────────┘         └─────────────┘  │
                              ▲          │
                              │          │
                        ┌─────┴─────┐    │
                        │   Inbox   │◄───┘ (when contextId = null)
                        │ (virtual) │
                        └───────────┘
```

**Relationship Rules**:
- A Task belongs to at most one Context (or Inbox if unassigned)
- A Context can have many Tasks
- When a Context is deleted, its Tasks move to Inbox (contextId → null)

## UI State Extensions

### Selection State

Current sidebar manages context selection. Extended to support Inbox:

```typescript
// Current (Phase 2)
type Selection = string | null;  // contextId or null (none selected)

// Extended (Phase 3)
type Selection =
  | { type: 'inbox' }
  | { type: 'context'; id: string }
  | null;  // nothing selected
```

This state lives in page.tsx component state, not in the global store.

### Task Form State

For create/edit dialogs:

```typescript
interface TaskFormData {
  title: string;           // User input, trimmed before submission
  contextId: string | null; // Selected context or null for Inbox
  deadline: string;        // Date input value (may be empty)
}
```

## Store Actions Reference

| Action | Payload | Effect |
|--------|---------|--------|
| `ADD_TASK` | `{ title, contextId, deadline? }` | Creates task with generated ID, timestamps, completed=false |
| `UPDATE_TASK` | `{ id, updates: Partial<Task> }` | Updates specified fields, refreshes updatedAt |
| `DELETE_TASK` | `id: string` | Removes task from state |
| `TOGGLE_TASK_COMPLETED` | `id: string` | Flips completed boolean |
| `MOVE_TASK_TO_CONTEXT` | `{ taskId, contextId }` | Changes task's context assignment |

## Selectors Reference

| Selector | Returns | Use Case |
|----------|---------|----------|
| `getTasksByContextId(id)` | `Task[]` | Display tasks for a specific context |
| `getInboxTasks()` | `Task[]` | Display Inbox tasks |

## Data Integrity

### On Context Deletion

The `DELETE_CONTEXT` reducer action handles orphaned tasks:

```typescript
case 'DELETE_CONTEXT': {
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

### Persistence

All state changes automatically persist to localStorage via the store's useEffect hook.
