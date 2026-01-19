# Quickstart: Work Mode Sidebar

**Feature**: 008-workmode-sidebar
**Date**: 2026-01-19

## Prerequisites

- Node.js 18+
- pnpm package manager
- Existing vibe-schedule codebase on branch `008-workmode-sidebar`

## Setup

```bash
# Ensure you're on the feature branch
git checkout 008-workmode-sidebar

# Install dependencies
pnpm install

# Add shadcn/ui tabs component if not present
pnpm dlx shadcn@latest add tabs

# Start development server
pnpm dev
```

## Implementation Order

### Phase 1: Foundation

1. **Add types** (`lib/types.ts`)
   - Add `SidebarPreferences` interface
   - Add to `AppState` interface
   - Add to `INITIAL_STATE`

2. **Add store actions** (`lib/store.tsx`)
   - Add `UPDATE_SIDEBAR_PREFERENCES` action type
   - Add reducer case
   - Add `updateSidebarPreferences` action

3. **Add useClickOutside hook** (`lib/hooks.ts` or inline)
   ```typescript
   function useClickOutside(
     refs: React.RefObject<HTMLElement | null>[],
     handler: () => void
   ) {
     useEffect(() => {
       const listener = (event: MouseEvent) => {
         const isInside = refs.some(ref =>
           ref.current?.contains(event.target as Node)
         );
         if (!isInside) handler();
       };
       document.addEventListener('mousedown', listener);
       return () => document.removeEventListener('mousedown', listener);
     }, [refs, handler]);
   }
   ```

### Phase 2: Icon Rail

4. **Create SidebarIconRail** (`app/components/working/SidebarIconRail.tsx`)
   - Fixed position right edge
   - Two icon buttons (Calendar, Bell)
   - Count badges
   - Urgency indicator dots
   - Click handlers to open panel

### Phase 3: Panel Structure

5. **Create SidebarPanel** (`app/components/working/SidebarPanel.tsx`)
   - Absolute positioned overlay
   - Tabs component for navigation
   - Scroll container for content
   - Animation for slide-in

6. **Create ImportantDateItem** (`app/components/working/ImportantDateItem.tsx`)
   - Countdown badge
   - Context name badge
   - Delete button with confirmation

7. **Create ImportantDateForm** (`app/components/working/ImportantDateForm.tsx`)
   - Label input
   - Date picker
   - Submit/Cancel buttons

### Phase 4: Tab Content

8. **Create ImportantDatesTab** (`app/components/working/ImportantDatesTab.tsx`)
   - Scope filter toggle
   - List/form view switching
   - Empty state

9. **Create RemindersTab** (`app/components/working/RemindersTab.tsx`)
   - Reminder list (reuse ReminderListItem)
   - Add button (opens ReminderForm)
   - Empty state

### Phase 5: Integration

10. **Create WorkingSidebar** (`app/components/working/WorkingSidebar.tsx`)
    - Orchestrates icon rail and panel
    - Manages open/close state
    - Aggregates deadlines from contexts
    - Click-outside handling

11. **Modify WorkingModeView** (`app/components/working/WorkingModeView.tsx`)
    - Add WorkingSidebar component
    - Pass session and context data
    - Add mobile toggle button to header

### Phase 6: Task Deletion

12. **Modify WorkingTaskItem** (`app/components/working/WorkingTaskItem.tsx`)
    - Add delete action button
    - Add confirmation dialog

### Phase 7: Mobile Responsive

13. **Add mobile support**
    - Hide icon rail on mobile (lg breakpoint)
    - Add toggle button to header
    - Use Sheet component for mobile panel

## Key Patterns to Follow

### Component Structure

```typescript
'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // Explicit prop types
}

export function Component({ prop }: ComponentProps) {
  const { state, action } = useStore();
  const [localState, setLocalState] = useState(initialValue);

  return (
    <div className={cn('base-classes', conditionalClass && 'conditional')}>
      {/* Content */}
    </div>
  );
}
```

### Form Pattern

```typescript
const [label, setLabel] = useState('');
const [date, setDate] = useState('');
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = (): boolean => {
  const newErrors: Record<string, string> = {};
  if (!label.trim()) newErrors.label = 'Label is required';
  if (!date) newErrors.date = 'Date is required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;
  onSubmit(label.trim(), date);
  setLabel('');
  setDate('');
};
```

### Delete Confirmation Pattern

```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

const handleDelete = () => {
  onDelete();
  setDeleteDialogOpen(false);
};

return (
  <>
    {/* Item content with delete button */}
    <Button onClick={() => setDeleteDialogOpen(true)}>
      <Trash2 className="size-4" />
    </Button>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
);
```

## Testing Checklist

- [ ] Icon rail visible on desktop (lg+)
- [ ] Panel expands on icon click
- [ ] Panel closes on click outside
- [ ] Tab switching works
- [ ] Scope filter toggles and persists
- [ ] Add deadline form validates
- [ ] Delete confirmations work
- [ ] Urgency badges update in real-time
- [ ] Mobile toggle button works
- [ ] Mobile panel slides in correctly
- [ ] Keyboard navigation (Escape to close)

## File Reference

| File | Purpose |
|------|---------|
| `lib/types.ts` | SidebarPreferences type |
| `lib/store.tsx` | updateSidebarPreferences action |
| `app/components/working/WorkingSidebar.tsx` | Main container |
| `app/components/working/SidebarIconRail.tsx` | Collapsed icon strip |
| `app/components/working/SidebarPanel.tsx` | Expanded panel |
| `app/components/working/ImportantDatesTab.tsx` | Dates content |
| `app/components/working/RemindersTab.tsx` | Reminders content |
| `app/components/working/ImportantDateItem.tsx` | Deadline list item |
| `app/components/working/ImportantDateForm.tsx` | Add deadline form |
| `app/components/working/WorkingTaskItem.tsx` | Modified for delete |
| `app/components/working/WorkingModeView.tsx` | Sidebar integration |

## Common Issues

### Panel doesn't close on click outside
- Ensure refs are properly passed to useClickOutside
- Check that icon rail ref is included in exclusion list

### Urgency indicators not updating
- Add interval effect to re-check urgency every 60 seconds
- Ensure state derivation happens on each render

### Mobile panel not working
- Verify Sheet component is properly imported
- Check responsive breakpoint classes (hidden lg:flex vs lg:hidden)

### Preferences not persisting
- Confirm AppState includes sidebarPreferences
- Check that INITIAL_STATE has default value
- Verify store action dispatches correctly
