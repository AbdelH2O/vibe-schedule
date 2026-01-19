# Data Model: Work Mode Sidebar

**Feature**: 008-workmode-sidebar
**Date**: 2026-01-19

## New Types

### SidebarPreferences

User preferences for sidebar behavior, persisted to localStorage.

```typescript
// lib/types.ts

type DeadlineScopeFilter = 'all' | 'active-context';

interface SidebarPreferences {
  /**
   * Controls which deadlines are displayed in the Important Dates tab.
   * - 'all': Show deadlines from all contexts in the current session
   * - 'active-context': Show only deadlines from the currently active context
   */
  deadlineScopeFilter: DeadlineScopeFilter;
}
```

### Default Value

```typescript
// lib/types.ts - add to INITIAL_STATE

sidebarPreferences: {
  deadlineScopeFilter: 'all',
},
```

## Modified Types

### AppState

Add sidebar preferences to existing app state.

```typescript
// lib/types.ts - modify existing interface

interface AppState {
  contexts: Context[];
  tasks: Task[];
  mode: AppMode;
  session: Session | null;
  presets: SessionPreset[];
  reminders: Reminder[];
  userLocation: UserLocation | null;
  notificationPermission: 'default' | 'granted' | 'denied';
  // NEW
  sidebarPreferences: SidebarPreferences;
}
```

## Store Actions

### New Actions

```typescript
// lib/store.tsx - add to store interface and implementation

/**
 * Update sidebar preferences (partial update supported)
 */
updateSidebarPreferences: (preferences: Partial<SidebarPreferences>) => void;
```

### Implementation

```typescript
// lib/store.tsx - in reducer

case 'UPDATE_SIDEBAR_PREFERENCES':
  return {
    ...state,
    sidebarPreferences: {
      ...state.sidebarPreferences,
      ...action.payload,
    },
  };

// lib/store.tsx - in actions

updateSidebarPreferences: useCallback(
  (preferences: Partial<SidebarPreferences>) => {
    dispatch({ type: 'UPDATE_SIDEBAR_PREFERENCES', payload: preferences });
  },
  []
),
```

## Existing Entities (Reference)

### ImportantDate

Already exists in `Context.importantDates[]`. No modifications needed.

```typescript
interface ImportantDate {
  id: string;
  label: string;
  date: string; // ISO date string
}
```

### Reminder

Already exists in `AppState.reminders[]`. No modifications needed.

```typescript
interface Reminder {
  id: string;
  title: string;
  message?: string;
  config: ReminderConfig;
  enabled: boolean;
  scope: ReminderScope;
  templateId?: string;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Context

Already exists. Used for deadline context association.

```typescript
interface Context {
  id: string;
  name: string;
  priority: number;
  color: ContextColorName;
  minDuration?: number;
  maxDuration?: number;
  weight: number;
  importantDates?: ImportantDate[];
  createdAt: string;
  updatedAt: string;
}
```

## Component Interfaces

### SidebarIconRail Props

```typescript
interface SidebarIconRailProps {
  /** Number of important dates to display in badge */
  datesCount: number;
  /** Number of reminders to display in badge */
  remindersCount: number;
  /** Whether any deadline is urgent (within 24h or overdue) */
  hasUrgentDates: boolean;
  /** Whether any reminder is imminent (within 15 minutes) */
  hasImminentReminders: boolean;
  /** Callback when dates icon is clicked */
  onDatesClick: () => void;
  /** Callback when reminders icon is clicked */
  onRemindersClick: () => void;
  /** Currently active tab (if panel is open) */
  activeTab: 'dates' | 'reminders' | null;
}
```

### SidebarPanel Props

```typescript
interface SidebarPanelProps {
  /** Whether panel is visible */
  isOpen: boolean;
  /** Currently active tab */
  activeTab: 'dates' | 'reminders';
  /** Callback to change active tab */
  onTabChange: (tab: 'dates' | 'reminders') => void;
  /** Callback to close panel */
  onClose: () => void;
  /** Ref to panel element for click-outside detection */
  panelRef: React.RefObject<HTMLDivElement>;
}
```

### ImportantDatesTab Props

```typescript
interface ImportantDatesTabProps {
  /** All deadlines from session contexts */
  allDeadlines: Array<{
    date: ImportantDate;
    contextId: string;
    contextName: string;
    contextColor: ContextColorName;
  }>;
  /** Currently active context ID */
  activeContextId: string | null;
  /** Current scope filter preference */
  scopeFilter: DeadlineScopeFilter;
  /** Callback to update scope filter */
  onScopeFilterChange: (filter: DeadlineScopeFilter) => void;
  /** Callback to add a new deadline */
  onAddDeadline: (label: string, date: string) => void;
  /** Callback to delete a deadline */
  onDeleteDeadline: (contextId: string, dateId: string) => void;
}
```

### RemindersTab Props

```typescript
interface RemindersTabProps {
  /** All reminders */
  reminders: Reminder[];
  /** Callback when reminder is deleted */
  onDeleteReminder: (id: string) => void;
  /** Callback to open reminder form for creation */
  onAddReminder: () => void;
}
```

### ImportantDateItem Props

```typescript
interface ImportantDateItemProps {
  /** The deadline data */
  date: ImportantDate;
  /** Context name to display (when showing all contexts) */
  contextName?: string;
  /** Context color for badge */
  contextColor?: ContextColorName;
  /** Whether to show context name badge */
  showContextBadge: boolean;
  /** Callback to delete this deadline */
  onDelete: () => void;
}
```

### ImportantDateForm Props

```typescript
interface ImportantDateFormProps {
  /** Callback when form is submitted */
  onSubmit: (label: string, date: string) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
}
```

### WorkingSidebar Props (Main Container)

```typescript
interface WorkingSidebarProps {
  /** Current session data */
  session: Session;
  /** All contexts in the session */
  sessionContexts: Context[];
  /** Whether to show mobile toggle button (passed from parent) */
  isMobile: boolean;
}
```

## Derived Data Structures

### Aggregated Deadline

Used internally to combine deadline with context info.

```typescript
interface AggregatedDeadline {
  date: ImportantDate;
  contextId: string;
  contextName: string;
  contextColor: ContextColorName;
  urgency: DeadlineUrgency;
}
```

### Sidebar State (Local)

Component-local state for sidebar UI.

```typescript
interface SidebarState {
  isOpen: boolean;
  activeTab: 'dates' | 'reminders';
  datesView: 'list' | 'form';
  remindersView: 'list' | 'form';
}
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      AppState (Store)                        │
│  ┌──────────────┐ ┌──────────┐ ┌──────────────────────────┐ │
│  │   contexts   │ │ reminders│ │   sidebarPreferences     │ │
│  │ (with dates) │ │          │ │ { deadlineScopeFilter }  │ │
│  └──────────────┘ └──────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   WorkingSidebar                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Aggregates deadlines from session contexts             │ │
│  │ Filters by scopeFilter preference                      │ │
│  │ Manages open/close and tab state                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌───────────────────────┐           ┌───────────────────────┐
│   SidebarIconRail     │           │    SidebarPanel       │
│  - Badge counts       │           │  ┌─────────────────┐  │
│  - Urgency indicators │           │  │ ImportantDates  │  │
│  - Click handlers     │           │  │ Tab             │  │
└───────────────────────┘           │  ├─────────────────┤  │
                                    │  │ Reminders Tab   │  │
                                    │  └─────────────────┘  │
                                    └───────────────────────┘
```

## Validation Rules

### ImportantDateForm

| Field | Rule | Error Message |
|-------|------|---------------|
| label | Required, non-empty after trim | "Label is required" |
| label | Max 100 characters | "Label must be 100 characters or less" |
| date | Required | "Date is required" |
| date | Valid ISO date format | "Invalid date format" |
| date | Not in distant past (>1 year ago) | "Date is too far in the past" |

### SidebarPreferences

| Field | Rule | Default |
|-------|------|---------|
| deadlineScopeFilter | Must be 'all' or 'active-context' | 'all' |

## State Transitions

### Sidebar Panel State

```
CLOSED ──[icon click]──> OPEN (tab = clicked icon's tab)
OPEN ──[click outside]──> CLOSED
OPEN ──[tab click]──> OPEN (tab = clicked tab)
OPEN ──[escape key]──> CLOSED
```

### Dates Tab View State

```
LIST ──[add button]──> FORM
FORM ──[submit]──> LIST
FORM ──[cancel]──> LIST
```

### Reminders Tab View State

```
LIST ──[add button]──> FORM (opens ReminderSheet or inline)
FORM ──[complete]──> LIST
FORM ──[cancel]──> LIST
```
