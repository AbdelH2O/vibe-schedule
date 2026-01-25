# Quickstart: Nested Task Hierarchy

**Feature**: 001-nested-task-hierarchy
**Date**: 2026-01-25

## Overview

This feature adds unlimited task nesting, expand/collapse accordion UI, focus mode with breadcrumb navigation, and progress indicators for parent tasks.

## Key Files to Modify

### Data Layer (Priority 1)

1. **`lib/types.ts`** - Add `parentId` to Task, `expandedTaskIds` to AppState
2. **`lib/store.tsx`** - Add new actions and modify existing ones
3. **`lib/taskHierarchy.ts`** (NEW) - Tree helper functions

### UI Components (Priority 2)

4. **`app/components/tasks/TaskListItem.tsx`** - Add expand/collapse, focus trigger, progress badge
5. **`app/components/tasks/NestedTaskList.tsx`** (NEW) - Recursive task rendering
6. **`app/components/tasks/TaskBreadcrumb.tsx`** (NEW) - Focus navigation
7. **`app/components/tasks/SortableTaskList.tsx`** - Hierarchy-aware drag-drop

### View Integration (Priority 3)

8. **`app/components/contexts/ContextDetail.tsx`** - Focus state, breadcrumb
9. **`app/components/tasks/InboxView.tsx`** - Focus state, breadcrumb
10. **`app/components/working/WorkingTaskItem.tsx`** - Expand/collapse, progress
11. **`app/components/working/WorkingTaskList.tsx`** - Hierarchy rendering

### Storage & Sync (Priority 4)

12. **`lib/storage.ts`** - Migration for existing tasks
13. **Supabase migration** - Add `parent_id` column to tasks table

## Implementation Order

### Phase 1: Data Model (Do First)

```bash
# 1. Update types
# lib/types.ts - Add parentId to Task, expandedTaskIds to AppState

# 2. Create helper module
# lib/taskHierarchy.ts - getChildren, getDescendants, getAncestors, isDescendantOf

# 3. Update store
# lib/store.tsx - ADD_SUBTASK, MOVE_TASK_TO_PARENT, TOGGLE_TASK_EXPANDED
# Modify: DELETE_TASK (cascade), MOVE_TASK_TO_CONTEXT (cascade)
```

### Phase 2: Core UI Components

```bash
# 4. Expand/collapse button (simple, reusable)
# Can be inline in TaskListItem or separate component

# 5. Progress badge component
# Simple X/Y display

# 6. Update TaskListItem
# - Add depth prop for indentation
# - Add expand/collapse toggle
# - Add progress badge when hasChildren
# - Title click triggers focus (new behavior)
```

### Phase 3: List Components

```bash
# 7. Create NestedTaskList
# - Recursive rendering
# - Filters by parentId
# - Passes depth to children

# 8. Update SortableTaskList
# - Use NestedTaskList for rendering
# - Handle drop-on-task for reparenting
```

### Phase 4: Focus & Breadcrumb

```bash
# 9. Create TaskBreadcrumb component
# - Simple horizontal list with separators
# - Click navigates to ancestor

# 10. Integrate into ContextDetail
# - Add focusedTaskId state
# - Show breadcrumb when focused
# - Filter displayed tasks by focus

# 11. Integrate into InboxView
# - Same pattern as ContextDetail
```

### Phase 5: Working Mode

```bash
# 12. Update WorkingTaskItem
# - Similar to TaskListItem changes
# - Expand/collapse, progress

# 13. Update WorkingTaskList
# - Hierarchy-aware rendering
# - Focus state if needed
```

### Phase 6: Persistence & Sync

```bash
# 14. Update storage.ts
# - Migrate existing tasks (add parentId: null)
# - Persist expandedTaskIds

# 15. Supabase migration (if using sync)
# - ALTER TABLE tasks ADD COLUMN parent_id
# - CREATE INDEX idx_tasks_parent_id
```

## Testing Checklist

- [ ] Create subtask under existing task
- [ ] Create nested subtasks (3+ levels deep)
- [ ] Expand/collapse parent tasks
- [ ] Focus on task via title click
- [ ] Navigate via breadcrumb
- [ ] Delete parent (confirm cascade dialog shows count)
- [ ] Reorder siblings via drag-drop
- [ ] Move task to different parent via drag-drop
- [ ] Progress badge shows correct X/Y
- [ ] Expansion state persists across reload
- [ ] Focus resets on context change
- [ ] Focus resets on mode change
- [ ] Export/import preserves hierarchy
- [ ] Works in both definition and working mode

## Common Pitfalls

1. **Circular reference** - Always validate before setting parentId
2. **Orphaned expansion state** - Clean up expandedTaskIds when deleting tasks
3. **Context mismatch** - Cascade contextId changes to all descendants
4. **Position collision** - Children have independent position namespace per parent
5. **Infinite recursion** - Add depth limit guard in recursive rendering

## Quick Reference

```typescript
// Get children of a task
const children = tasks.filter(t => t.parentId === parentId);

// Get all descendants (recursive)
function getDescendants(taskId: string): Task[] {
  const children = tasks.filter(t => t.parentId === taskId);
  return children.flatMap(c => [c, ...getDescendants(c.id)]);
}

// Get ancestor chain (for breadcrumb)
function getAncestors(taskId: string): Task[] {
  const task = tasks.find(t => t.id === taskId);
  if (!task?.parentId) return [];
  const parent = tasks.find(t => t.id === task.parentId);
  return parent ? [...getAncestors(parent.id), parent] : [];
}

// Check circular reference
function isDescendantOf(taskId: string, ancestorId: string): boolean {
  const descendants = getDescendants(ancestorId);
  return descendants.some(d => d.id === taskId);
}
```
