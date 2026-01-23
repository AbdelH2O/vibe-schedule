# Data Model: Cross-Device Data Synchronization

**Date**: 2026-01-21
**Feature**: 010-cross-device-sync

## Overview

This document defines the extended data model for cross-device sync, including sync metadata additions to existing entities and new sync-specific entities.

## Sync Metadata (Applied to All Syncable Entities)

All entities that sync across devices include these additional fields:

```typescript
interface SyncMetadata {
  syncVersion: number;       // Server-assigned sequence number for ordering
  lastModifiedBy: string;    // Device ID that made the last change
  deletedAt: string | null;  // ISO timestamp for soft delete (null = active)
}
```

## Extended Entities

### Context (Extended)

```typescript
interface Context {
  // Existing fields
  id: string;                    // Changed to UUID
  name: string;
  priority: number;              // 1-5
  color: ContextColorName;
  minDuration?: number;          // minutes
  maxDuration?: number;          // minutes
  weight: number;                // default 1
  importantDates?: ImportantDate[];
  createdAt: string;
  updatedAt: string;

  // NEW: Sync metadata
  userId: string;                // Owner's auth.users.id
  syncVersion: number;
  lastModifiedBy: string;
  deletedAt: string | null;
}
```

### Task (Extended)

```typescript
interface Task {
  // Existing fields
  id: string;                    // Changed to UUID
  title: string;
  description?: string;
  contextId: string | null;      // null = inbox
  deadline?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;

  // NEW: Sync metadata
  userId: string;
  syncVersion: number;
  lastModifiedBy: string;
  deletedAt: string | null;
}
```

### Session (Extended)

```typescript
interface Session {
  // Existing fields
  id: string;                    // Changed to UUID
  totalDuration: number;
  startedAt: string;
  allocations: ContextAllocation[];
  activeContextId: string | null;
  contextStartedAt: string | null;
  status: 'active' | 'paused' | 'suspended' | 'completed';

  // NEW: Sync metadata
  userId: string;
  syncVersion: number;
  lastModifiedBy: string;
  deletedAt: string | null;

  // NEW: Ownership tracking
  activeDeviceId: string | null;       // Which device owns the timer
  ownershipClaimedAt: string | null;   // When ownership was claimed
}
```

### Reminder (Extended)

```typescript
interface Reminder {
  // Existing fields
  id: string;                    // Changed to UUID
  title: string;
  message?: string;
  config: ReminderConfig;
  enabled: boolean;
  scope: ReminderScope;
  templateId?: string;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;

  // NEW: Sync metadata
  userId: string;
  syncVersion: number;
  lastModifiedBy: string;
  deletedAt: string | null;
}
```

### SessionPreset (Extended)

```typescript
interface SessionPreset {
  // Existing fields
  id: string;                    // Changed to UUID
  name: string;
  totalDuration: number;
  allocations: ContextAllocation[];
  contextIds?: string[];
  createdAt: string;

  // NEW: Sync metadata
  userId: string;
  syncVersion: number;
  lastModifiedBy: string;
  deletedAt: string | null;
  updatedAt: string;             // NEW: Added for LWW
}
```

### UserPreferences (New)

```typescript
interface UserPreferences {
  id: string;                    // User's auth.users.id (1:1 with user)
  sidebarPreferences: SidebarPreferences;
  userLocation: UserLocation | null;
  notificationPermission: 'default' | 'granted' | 'denied';

  // Sync metadata
  syncVersion: number;
  lastModifiedBy: string;
  updatedAt: string;
}
```

## New Entities

### Device

```typescript
interface Device {
  id: string;                    // UUID, generated once per device
  userId: string;                // Owner's auth.users.id
  name: string | null;           // User-friendly name (optional)
  userAgent: string;             // Browser/OS info for identification
  lastSeenAt: string;            // Last activity timestamp
  createdAt: string;
}
```

### OutboxEntry

```typescript
type OutboxOperation = 'create' | 'update' | 'delete';

interface OutboxEntry {
  id: string;                    // UUID
  entityType: DataCategory;      // 'contexts' | 'tasks' | etc.
  entityId: string;              // ID of the affected entity
  operation: OutboxOperation;
  payload: unknown;              // Entity data (for create/update) or null (delete)
  createdAt: string;             // When the change was made
  attempts: number;              // Retry count
  lastAttemptAt: string | null;  // Last sync attempt
  error: string | null;          // Last error message
}
```

## Entity Relationships

```
┌─────────────┐
│   User      │
│ (auth.users)│
└──────┬──────┘
       │ 1:n
       ├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Context    │ │    Task      │ │   Session    │ │   Reminder   │ │ SessionPreset│ │   Device     │
└──────┬───────┘ └──────┬───────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
       │ 1:n            │
       │                │
       ▼                │
┌──────────────┐        │
│ImportantDate │        │
└──────────────┘        │
       ▲                │
       │ contextId      │
       └────────────────┘
       (Task.contextId → Context.id, nullable for inbox)

┌──────────────┐
│UserPreferences│ (1:1 with User)
└──────────────┘
```

## State Transitions

### Session Status
```
             ┌────────────────────────────────────┐
             │                                    │
             ▼                                    │
[none] ──► active ──► paused ──► active ──► suspended ──► active
             │                                    │         │
             │                                    │         │
             └──────────────────► completed ◄─────┴─────────┘
```

### Session Ownership
```
[unclaimed] ──claim()──► [claimed by Device A]
                              │
              suspend()       │       timeout (30 min)
                  │           │           │
                  ▼           │           ▼
            [unclaimed] ◄─────┴───── [unclaimed]
                  │
              claim()
                  │
                  ▼
            [claimed by Device B]
```

## Conflict Resolution Rules

| Entity Type | Strategy | Details |
|-------------|----------|---------|
| Context | LWW | Compare `updatedAt`, latest wins |
| Task | LWW | Compare `updatedAt`, latest wins |
| Reminder | LWW | Compare `updatedAt`, latest wins |
| SessionPreset | LWW | Compare `updatedAt`, latest wins |
| UserPreferences | LWW | Compare `updatedAt`, latest wins |
| Session | Special | Timer data: max(`usedMinutes`); ownership: first claim wins |

### Session Conflict Details

For `ContextAllocation.usedMinutes`:
```typescript
// When merging conflicting session data, preserve maximum time per context
function mergeAllocations(local: ContextAllocation[], remote: ContextAllocation[]): ContextAllocation[] {
  const merged = new Map<string, ContextAllocation>();

  for (const alloc of [...local, ...remote]) {
    const existing = merged.get(alloc.contextId);
    if (!existing || alloc.usedMinutes > existing.usedMinutes) {
      merged.set(alloc.contextId, alloc);
    }
  }

  return Array.from(merged.values());
}
```

## Validation Rules

### Context
- `name`: 1-100 characters, trimmed
- `priority`: integer 1-5
- `weight`: positive number, default 1
- `minDuration`: null or positive integer
- `maxDuration`: null or positive integer >= minDuration

### Task
- `title`: 1-500 characters, trimmed
- `description`: 0-5000 characters
- `contextId`: valid context ID or null (inbox)
- `deadline`: valid ISO date string or null

### Session
- `totalDuration`: positive integer (minutes)
- `allocations`: non-empty array, sum equals totalDuration
- `activeDeviceId`: null or valid device ID

### Device
- `id`: valid UUID, unique per device
- `name`: 0-50 characters

## ID Migration

Existing local data uses timestamp-based IDs. On first sync:

1. Generate new UUID for each entity
2. Build ID mapping: `{ oldId → newId }`
3. Update all foreign key references:
   - `Task.contextId` → new context ID
   - `ContextAllocation.contextId` → new context ID
   - `SessionPreset.contextIds` → new context IDs
4. Store mapping for debugging/rollback

```typescript
interface IdMapping {
  contexts: Record<string, string>;  // oldId → newId
  tasks: Record<string, string>;
  reminders: Record<string, string>;
  presets: Record<string, string>;
  sessions: Record<string, string>;
}
```
