# Quickstart: Tasks & Inbox

**Feature**: 003-tasks-inbox
**Date**: 2026-01-18

## Prerequisites

- Phase 1 (Foundation & Data Model) completed
- Phase 2 (Context Management) completed
- Node.js 18+, pnpm installed

## Quick Setup

```bash
# Ensure you're on the feature branch
git checkout 003-tasks-inbox

# Install dependencies (if not already done)
pnpm install

# Add required shadcn/ui component
pnpm dlx shadcn@latest add checkbox

# Start development server
pnpm dev
```

## Key Files

### New Components (to create)

| File | Purpose |
|------|---------|
| `app/components/tasks/TaskList.tsx` | Renders list of tasks with empty state |
| `app/components/tasks/TaskListItem.tsx` | Single task row with checkbox and actions |
| `app/components/tasks/TaskForm.tsx` | Form for task title, context, deadline |
| `app/components/tasks/CreateTaskDialog.tsx` | Dialog wrapper for creating tasks |
| `app/components/tasks/EditTaskDialog.tsx` | Dialog wrapper for editing tasks |

### Files to Modify

| File | Changes |
|------|---------|
| `app/components/Sidebar.tsx` | Add Inbox entry above context list |
| `app/components/contexts/ContextDetail.tsx` | Add TaskList section |
| `app/page.tsx` | Handle Inbox selection, show Inbox view |

### Existing Store Actions (no changes needed)

```typescript
// Task CRUD - all ready to use
addTask({ title, contextId, deadline? })
updateTask(id, { title?, contextId?, deadline? })
deleteTask(id)
toggleTaskCompleted(id)
moveTaskToContext(taskId, contextId)

// Selectors
getTasksByContextId(contextId) // for context task lists
getInboxTasks()                // for Inbox view
```

## Component Patterns

### TaskListItem Example

```tsx
'use client';

import { Task } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskListItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskListItem({ task, onEdit }: TaskListItemProps) {
  const { toggleTaskCompleted, deleteTask } = useStore();

  return (
    <div className="flex items-center gap-3 py-2">
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => toggleTaskCompleted(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />
      <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
        {task.title}
      </span>
      {/* Edit/Delete buttons */}
    </div>
  );
}
```

### Selection State Pattern

```tsx
// In page.tsx
type Selection =
  | { type: 'inbox' }
  | { type: 'context'; id: string }
  | null;

const [selection, setSelection] = useState<Selection>(null);

// Render based on selection
{selection?.type === 'inbox' && <InboxView />}
{selection?.type === 'context' && <ContextDetail contextId={selection.id} />}
{!selection && <WelcomeMessage />}
```

## Testing Checklist

```bash
# Run linter
pnpm lint

# Build check
pnpm build

# Manual testing in browser
pnpm dev
```

### Manual Test Cases

1. **Create task in Inbox**: Click add, enter title, submit → appears in Inbox
2. **Create task in context**: Select context first, add task → appears in context list
3. **Move task**: Edit task, change context → disappears from old, appears in new
4. **Complete task**: Click checkbox → strikethrough appears
5. **Uncomplete task**: Click checkbox again → strikethrough removed
6. **Delete task**: Click delete, confirm → task removed
7. **Persistence**: Refresh page → all tasks still present

## Common Issues

### Checkbox not styling correctly

Ensure you've added the checkbox component:
```bash
pnpm dlx shadcn@latest add checkbox
```

### Tasks not appearing in context

Check that `contextId` is being set correctly (string ID, not object).

### Inbox count not updating

Ensure you're using `getInboxTasks()` selector which recomputes on state change.
