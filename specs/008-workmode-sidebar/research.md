# Research: Work Mode Sidebar

**Feature**: 008-workmode-sidebar
**Date**: 2026-01-19

## Research Topics

### 1. Gmail-Style Sidebar Interaction Pattern

**Decision**: Implement icon rail with expandable panel overlay

**Rationale**:
- Gmail's sidebar pattern uses a narrow icon strip that expands on click to reveal content
- The panel overlays content rather than pushing it, maintaining layout stability
- No background dimming or focus trapping allows concurrent interaction with main content
- This pattern is well-established and users find it intuitive

**Alternatives Considered**:
- Persistent sidebar column: Rejected because it reduces main content width permanently
- Push-aside panel: Rejected because it causes layout shift and reflows
- Modal dialog: Rejected because it blocks main content interaction

**Implementation Approach**:
- Icon rail: Fixed position on right edge, ~48px width, contains icon buttons
- Panel: Absolute positioned, slides out from icon rail, ~320px width
- Click-outside detection: Close panel when clicking main content area
- No focus trap: Allow clicks through to main content

### 2. Click-Outside Detection

**Decision**: Use custom useClickOutside hook with event delegation

**Rationale**:
- Radix Popover adds unnecessary complexity for this use case (we don't want focus management)
- Custom hook provides precise control over behavior
- Can easily exclude icon rail from "outside" detection

**Implementation**:
```typescript
function useClickOutside(
  refs: React.RefObject<HTMLElement>[],
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      // Check if click is inside any of the refs
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

**Alternatives Considered**:
- Radix Popover: Rejected due to unwanted focus management behavior
- Radix Dialog: Rejected because it creates focus trap
- Portal with backdrop: Rejected because backdrop would block main content

### 3. Tab Navigation Within Panel

**Decision**: Use shadcn/ui Tabs component

**Rationale**:
- Already part of the project's component library (shadcn/ui)
- Provides accessible keyboard navigation out of the box
- Consistent styling with rest of application
- Supports controlled mode for managing active tab externally

**Implementation**:
- TabsList at top of panel with two triggers (Important Dates, Reminders)
- TabsContent renders active section
- Icon rail click can set initial tab to match clicked icon
- Tab state managed locally within SidebarPanel component

**Alternatives Considered**:
- Custom tab implementation: Rejected to avoid reinventing accessibility
- Radio buttons: Rejected for less appropriate semantics

### 4. Sidebar Preferences Storage

**Decision**: Add to existing AppState with localStorage persistence

**Rationale**:
- Follows existing pattern for user preferences
- Automatically persisted via existing saveState() mechanism
- No migration needed (optional field with default)
- Single source of truth for all app state

**Implementation**:
```typescript
// In lib/types.ts
interface SidebarPreferences {
  deadlineScopeFilter: 'all' | 'active-context';
}

// In AppState
sidebarPreferences: SidebarPreferences;

// In INITIAL_STATE
sidebarPreferences: {
  deadlineScopeFilter: 'all',
},
```

**Alternatives Considered**:
- Separate localStorage key: Rejected to avoid fragmented storage
- Session-only state: Rejected because spec requires persistence
- Cookie storage: Rejected as localStorage is already the pattern

### 5. Mobile Responsive Behavior

**Decision**: Hide icon rail on mobile, show toggle button in header

**Rationale**:
- Icon rail would be too cramped on mobile
- Header toggle is more discoverable on small screens
- Sheet component provides familiar mobile slide-in pattern
- Consistent with existing mobile sidebar (AppShell pattern)

**Implementation**:
- Desktop (lg+): Icon rail visible on right edge
- Mobile (<lg): Icon rail hidden, toggle button in WorkingModeView header
- Mobile panel: Use Sheet component with side="right"
- Auto-close on mobile when clicking outside

**Breakpoint**: lg (1024px) matches existing app conventions

### 6. Urgency Detection for Badge Display

**Decision**: Reuse existing urgency utilities with 15-minute threshold for reminders

**Rationale**:
- `getDeadlineUrgency()` already provides 24-hour threshold
- Consistent urgency styling via `getUrgencyColorClass()`
- Reminder threshold of 15 minutes aligns with spec assumption

**Implementation**:
```typescript
// For deadlines
const hasUrgentDeadlines = deadlines.some(d => {
  const urgency = getDeadlineUrgency(d.date);
  return urgency === 'overdue' || urgency === 'urgent';
});

// For reminders (new helper)
const hasImminentReminders = reminders.some(r => {
  const nextTrigger = getNextTriggerTime(r);
  if (!nextTrigger) return false;
  const minutesUntil = (nextTrigger.getTime() - Date.now()) / 60000;
  return minutesUntil <= 15 && minutesUntil > 0;
});
```

### 7. Important Date Form Pattern

**Decision**: Inline form within panel (not modal)

**Rationale**:
- Keeps user in context without additional overlay
- Simpler than modal within overlay
- Follows pattern of quick-add in working mode
- Form is simple enough (just label + date)

**Implementation**:
- Toggle between list view and form view within tab
- "Add" button switches to form mode
- "Cancel" returns to list
- Submit adds date and returns to list
- Form fields: label (required), date (required, date picker)

### 8. Delete Confirmation Pattern

**Decision**: Use existing AlertDialog component

**Rationale**:
- Already used throughout app for delete confirmations
- Consistent user experience
- Accessible out of the box
- Minimal implementation effort

**Implementation**:
- Follows ReminderListItem pattern exactly
- State: `deleteDialogOpen` controlled by item
- AlertDialog renders inline with item
- Confirm calls store delete action

### 9. Deadline Context Indication

**Decision**: Show context name badge when viewing all contexts

**Rationale**:
- Users need to know which context a deadline belongs to
- Helps distinguish similar deadlines across contexts
- Badge pattern consistent with existing priority badges

**Implementation**:
```tsx
{showContextName && (
  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
    {contextName}
  </span>
)}
```

### 10. Real-time Urgency Updates

**Decision**: Use existing interval-based checking pattern

**Rationale**:
- Reminder scheduler already checks every second
- Can piggyback on same mechanism or use separate interval
- Updates badge indicators when thresholds crossed

**Implementation**:
- Use `useEffect` with interval to recheck urgency every 60 seconds
- Badge state derived from current time vs deadlines/reminders
- No need for second-level precision for badge display

## Summary

All research topics resolved. No remaining NEEDS CLARIFICATION items. Implementation can proceed using:

1. Custom icon rail + absolute panel (no Radix Popover/Dialog)
2. useClickOutside hook for close behavior
3. shadcn/ui Tabs for navigation
4. AppState for preference persistence
5. Responsive breakpoint at lg (1024px)
6. Existing urgency utilities + 15-min reminder threshold
7. Inline form within panel
8. AlertDialog for delete confirmations
9. Context badge for multi-context view
10. 60-second interval for urgency updates
