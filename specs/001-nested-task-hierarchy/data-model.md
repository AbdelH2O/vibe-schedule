# Data Model: Nested Task Hierarchy

**Feature**: 001-nested-task-hierarchy
**Date**: 2026-01-25

## Entity Changes

### Task (Extended)

Add one field to existing Task interface:

```typescript
export interface Task {
  // ... existing fields ...
  id: string;
  title: string;
  description?: string;
  contextId: string | null;  // null = inbox
  deadline?: string;
  completed: boolean;
  position: string;          // Fractional index for ordering among siblings
  createdAt: string;
  updatedAt: string;
  // Sync metadata...

  // NEW FIELD
  parentId: string | null;   // null = root-level task, string = child of that task
}
```

**Constraints**:
- `parentId` references another Task's `id`
- Self-reference not allowed (`parentId !== id`)
- Circular references not allowed (task cannot be its own ancestor)
- If parent is deleted, all descendants are cascade-deleted
- If parent changes context, all descendants inherit new context

### AppState (Extended)

Add expansion state tracking:

```typescript
export interface AppState {
  // ... existing fields ...
  contexts: Context[];
  tasks: Task[];
  mode: AppMode;
  session: Session | null;
  presets: SessionPreset[];
  reminders: Reminder[];
  userLocation: UserLocation | null;
  notificationPermission: 'default' | 'granted' | 'denied';
  sidebarPreferences: SidebarPreferences;

  // NEW FIELD
  expandedTaskIds: string[];  // Task IDs that are expanded (showing children)
}
```

**Behavior**:
- Default: empty array (all tasks collapsed)
- Toggle: add/remove ID from array
- Persisted to localStorage across sessions
- Synced across devices (optional, low priority)

## New Types

### Focus State (Runtime Only)

```typescript
// Not persisted - managed in React component state
interface TaskFocusState {
  focusedTaskId: string | null;  // null = root view (all root-level tasks)
}
```

### Task Tree Node (Computed)

```typescript
// Helper type for tree operations
interface TaskTreeNode {
  task: Task;
  children: TaskTreeNode[];
  depth: number;
  childCount: number;        // Direct children count
  completedChildCount: number; // Completed direct children
}
```

### Breadcrumb Item (Computed)

```typescript
interface BreadcrumbItem {
  id: string | null;  // null = root
  label: string;      // Task title or "Root" / context name
}
```

## Relationships

```
Context (1) ----< (many) Task
                    |
                    | parentId (self-reference)
                    v
Task (1) ----< (many) Task (children)
```

**Key Invariants**:
1. A task's `contextId` must match its parent's `contextId` (if parent exists)
2. Root tasks (`parentId: null`) can have any `contextId`
3. Moving a parent to a different context cascades to all descendants

## State Transitions

### Task Hierarchy Operations

| Operation | State Change | Validation |
|-----------|--------------|------------|
| Create subtask | New task with `parentId` set | Parent must exist |
| Move to parent | Update `parentId`, possibly `contextId` | No circular reference |
| Move to root | Set `parentId: null` | None |
| Delete parent | Delete task + all descendants | Confirmation required |
| Complete parent | Set `completed: true` | Independent of children |
| Complete child | Set `completed: true` | Independent of parent |

### Expansion Operations

| Operation | State Change |
|-----------|--------------|
| Expand task | Add `id` to `expandedTaskIds` |
| Collapse task | Remove `id` from `expandedTaskIds` |
| Delete task | Remove `id` from `expandedTaskIds` (cleanup) |

### Focus Operations

| Operation | State Change |
|-----------|--------------|
| Focus on task | Set `focusedTaskId` to task ID |
| Focus on root | Set `focusedTaskId` to null |
| Change context | Reset `focusedTaskId` to null |
| Switch mode | Reset `focusedTaskId` to null |

## Migration

### Existing Tasks

All existing tasks get `parentId: null` (root-level tasks).

```typescript
// Migration in loadState (lib/storage.ts)
function migrateTasksWithParentId(tasks: Task[]): Task[] {
  return tasks.map(task => ({
    ...task,
    parentId: task.parentId ?? null,  // Default to root
  }));
}
```

### Existing AppState

Add `expandedTaskIds: []` default.

```typescript
// In INITIAL_STATE (lib/types.ts)
export const INITIAL_STATE: AppState = {
  // ... existing ...
  expandedTaskIds: [],
};
```

## Database Schema (Supabase)

Add column to `tasks` table:

```sql
ALTER TABLE tasks
ADD COLUMN parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE;

-- Index for efficient child queries
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
```

**Note**: `ON DELETE CASCADE` handles server-side cascade delete for synced data.
