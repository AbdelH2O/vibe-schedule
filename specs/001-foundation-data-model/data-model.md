# Data Model: Foundation & Data Model

**Feature**: 001-foundation-data-model
**Date**: 2026-01-18

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           AppState                               │
│  (Root entity - serialized to localStorage)                      │
├─────────────────────────────────────────────────────────────────┤
│  contexts: Context[]                                             │
│  tasks: Task[]                                                   │
│  mode: AppMode                                                   │
│  session: Session | null                                         │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Context     │  │      Task       │  │     Session     │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id: string      │  │ id: string      │  │ id: string      │
│ name: string    │◄─┤ contextId: str? │  │ totalDuration   │
│ priority: 1-5   │  │ title: string   │  │ startedAt       │
│ minDuration?    │  │ deadline?       │  │ allocations[]   │
│ maxDuration?    │  │ completed       │  │ activeContextId │
│ weight: number  │  │ createdAt       │  │ contextStartedAt│
│ importantDates[]│  │ updatedAt       │  │ status          │
│ createdAt       │  └─────────────────┘  └─────────────────┘
│ updatedAt       │           │                    │
└─────────────────┘           │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  ImportantDate  │  │   Inbox (null)  │  │ContextAllocation│
├─────────────────┤  │                 │  ├─────────────────┤
│ id: string      │  │ Tasks with      │  │ contextId       │
│ label: string   │  │ contextId=null  │  │ allocatedMinutes│
│ date: ISO string│  │ are in inbox    │  │ usedMinutes     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Entity Definitions

### Context

Represents a focus area for work (e.g., "Deep Work", "Admin", "Learning").

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (timestamp + random) |
| name | string | Yes | Display name for the context |
| priority | number | Yes | 1-5 scale, 1 = highest priority |
| minDuration | number | No | Minimum guaranteed time in minutes |
| maxDuration | number | No | Maximum allowed time in minutes |
| weight | number | Yes | Relative weight for proportional distribution (default: 1) |
| importantDates | ImportantDate[] | No | Array of deadline/milestone entries |
| createdAt | string | Yes | ISO timestamp of creation |
| updatedAt | string | Yes | ISO timestamp of last modification |

**Validation Rules**:
- `name` must be non-empty
- `priority` must be integer 1-5
- `minDuration` must be positive if present
- `maxDuration` must be >= minDuration if both present
- `weight` must be positive (default 1)

### ImportantDate

Represents a deadline or milestone for countdown display.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| label | string | Yes | Description (e.g., "Sprint End", "Review") |
| date | string | Yes | ISO date string for countdown |

### Task

Represents an individual work item.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| title | string | Yes | Task description |
| contextId | string \| null | Yes | Context assignment; null = inbox |
| deadline | string | No | ISO date string (display only) |
| completed | boolean | Yes | Completion status |
| createdAt | string | Yes | ISO timestamp of creation |
| updatedAt | string | Yes | ISO timestamp of last modification |

**Validation Rules**:
- `title` must be non-empty
- `contextId` must reference valid context or be null
- Deleting a context moves its tasks to inbox (contextId → null)

### Session

Represents an active working session.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| totalDuration | number | Yes | Total session time in minutes |
| startedAt | string | Yes | ISO timestamp of session start |
| allocations | ContextAllocation[] | Yes | Time distribution per context |
| activeContextId | string \| null | Yes | Currently active context |
| contextStartedAt | string \| null | Yes | When current context began |
| status | 'active' \| 'paused' \| 'completed' | Yes | Session lifecycle state |

### ContextAllocation

Tracks time allocation and usage per context within a session.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| contextId | string | Yes | Reference to context |
| allocatedMinutes | number | Yes | Time allocated to this context |
| usedMinutes | number | Yes | Time actually spent (starts at 0) |

### AppMode

Discriminated type for application mode.

| Value | Description |
|-------|-------------|
| 'definition' | Planning mode - full access to structure changes |
| 'working' | Execution mode - structure read-only, focus on tasks |

### AppState

Root entity persisted to localStorage.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| contexts | Context[] | Yes | All defined contexts |
| tasks | Task[] | Yes | All tasks (inbox + assigned) |
| mode | AppMode | Yes | Current application mode |
| session | Session \| null | Yes | Active session or null |

## State Transitions

### Mode Transitions

```
                    START_SESSION
    ┌─────────────┐ ─────────────► ┌─────────────┐
    │  definition │                │   working   │
    └─────────────┘ ◄───────────── └─────────────┘
                     END_SESSION
```

### Session Lifecycle

```
    (none) ─── START_SESSION ───► active
                                    │
                        ┌───────────┼───────────┐
                        ▼           ▼           ▼
                     paused    (continue)   completed
                        │                       │
                        │    RESUME_SESSION     │
                        └───────────►┘          │
                                                │
                              END_SESSION ◄─────┘
                                    │
                                    ▼
                                 (none)
```

## Initial State

```typescript
const INITIAL_STATE: AppState = {
  contexts: [],
  tasks: [],
  mode: 'definition',
  session: null,
};
```

## Storage Schema

**Key**: `vibe-schedule-state`
**Format**: JSON
**Location**: browser localStorage

**Migration Safety**:
- All fields use nullish coalescing on load
- Missing fields default to empty arrays or initial values
- Corrupted data triggers reset to INITIAL_STATE
