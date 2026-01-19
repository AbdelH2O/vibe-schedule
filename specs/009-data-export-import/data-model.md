# Data Model: Data Export & Import

**Feature**: 009-data-export-import
**Date**: 2026-01-19

## Overview

This feature introduces types for export/import operations while leveraging existing domain types (Context, Task, Reminder, etc.) from `lib/types.ts`. The new types define the export package structure, import results, and the DataProvider abstraction.

## New Types

### DataCategory

Enumeration of exportable data categories. Used for selective export.

```typescript
type DataCategory =
  | 'contexts'
  | 'tasks'
  | 'reminders'
  | 'presets'
  | 'session'
  | 'preferences';
```

**Validation Rules**:
- At least one category must be selected for export
- Import files may contain any subset of categories

---

### ExportMetadata

Metadata embedded in every export file for versioning and migration.

```typescript
interface ExportMetadata {
  version: string;           // Export format version (semver, e.g., "1.0.0")
  appVersion: string;        // App version at export time
  exportedAt: string;        // ISO 8601 timestamp
  categories: DataCategory[]; // Which categories are included
  counts: {
    contexts: number;
    tasks: number;
    reminders: number;
    presets: number;
  };
}
```

**Validation Rules**:
- `version` must be a valid semver string
- `exportedAt` must be a valid ISO 8601 timestamp
- `categories` must be a non-empty array
- `counts` values must be non-negative integers

---

### ExportData

The actual data payload within an export package.

```typescript
interface ExportData {
  contexts?: Context[];
  tasks?: Task[];
  reminders?: Reminder[];
  presets?: SessionPreset[];
  session?: Session | null;
  preferences?: {
    sidebarPreferences: SidebarPreferences;
    userLocation: UserLocation | null;
    notificationPermission: 'default' | 'granted' | 'denied';
  };
}
```

**Validation Rules**:
- Each array must contain valid entities matching existing type definitions
- `session` can be null (no active session at export time)
- Missing keys indicate that category was not selected for export

---

### ExportPackage

The complete export file structure.

```typescript
interface ExportPackage {
  meta: ExportMetadata;
  data: ExportData;
}
```

**Validation Rules**:
- Both `meta` and `data` must be present
- `meta.categories` must match keys present in `data`
- File must be valid JSON

---

### ImportMode

Determines how import handles existing data.

```typescript
type ImportMode = 'replace' | 'merge';
```

**Behaviors**:
- `replace`: Clear existing data, apply imported data (with confirmation)
- `merge`: Combine imported data with existing (skip ID duplicates, rename name conflicts)

---

### ImportWarning

Non-fatal issues encountered during import.

```typescript
interface ImportWarning {
  code: 'ID_COLLISION' | 'NAME_CONFLICT' | 'ORPHANED_TASK' | 'MIGRATED';
  message: string;
  details?: {
    entityType: DataCategory;
    entityId: string;
    originalName?: string;
    newName?: string;
  };
}
```

---

### ImportResult

Result of an import operation.

```typescript
interface ImportResult {
  success: boolean;
  mode: ImportMode;
  counts: {
    contextsImported: number;
    tasksImported: number;
    remindersImported: number;
    presetsImported: number;
    skipped: number;        // Due to ID collisions (merge mode)
    renamed: number;        // Due to name conflicts (merge mode)
    orphaned: number;       // Tasks moved to inbox (missing context)
  };
  warnings: ImportWarning[];
  error?: string;           // Only present if success === false
  migratedFrom?: string;    // Original version if migration occurred
}
```

---

### DataSummary

Summary of current data for display in Data Management UI.

```typescript
interface DataSummary {
  counts: {
    contexts: number;
    tasks: number;
    reminders: number;
    presets: number;
    completedTasks: number;
    activeSession: boolean;
  };
  lastExportedAt: string | null;  // ISO timestamp or null if never exported
  storageUsedBytes: number;       // Approximate localStorage usage
}
```

---

### DataProvider

Interface for storage operations. localStorage implements this; future cloud providers will too.

```typescript
interface DataProvider {
  // Unique identifier for this provider
  readonly id: string;
  readonly name: string;

  // Core state operations
  load(): Promise<AppState>;
  save(state: AppState): Promise<void>;
  clear(): Promise<void>;

  // Export/Import
  createExport(categories: DataCategory[]): Promise<ExportPackage>;
  applyImport(pkg: ExportPackage, mode: ImportMode): Promise<ImportResult>;

  // Validation
  validateExportPackage(pkg: unknown): ExportPackage | null;

  // Metadata
  getDataSummary(): DataSummary;
  getLastExportDate(): string | null;
  setLastExportDate(date: string): void;
}
```

**Implementation Notes**:
- `load()` returns `INITIAL_STATE` if no data exists
- `save()` is atomic - partial saves must not occur
- `validateExportPackage()` returns null for invalid input
- `getDataSummary()` computes counts from current state

## Existing Types (Referenced)

These types are already defined in `lib/types.ts` and will be included in exports:

| Type | Description | Relationships |
|------|-------------|---------------|
| `Context` | Focus area with priority, duration constraints, color | Has many Tasks via `contextId` |
| `Task` | Action item with deadline, completion status | Belongs to Context (or Inbox if `contextId: null`) |
| `Reminder` | Scheduled notification with trigger config | Standalone |
| `SessionPreset` | Saved session configuration | References Context IDs |
| `Session` | Active work session state | Contains ContextAllocations |
| `SidebarPreferences` | UI preference state | Standalone |
| `UserLocation` | Location for prayer time calculations | Standalone |

## State Transitions

### Export Flow

```
User initiates export
    ↓
Select categories (default: all)
    ↓
createExport(categories)
    ↓
Generate ExportPackage with metadata + filtered data
    ↓
Trigger file download
    ↓
Update lastExportedAt
```

### Import Flow (Replace Mode)

```
User selects file
    ↓
Parse JSON
    ↓
validateExportPackage()
    → Invalid: Show error, abort
    ↓
Check version, migrate if needed
    ↓
Show confirmation dialog (will replace all data)
    → Cancel: abort
    ↓
applyImport(pkg, 'replace')
    ↓
Clear existing state
    ↓
Apply imported data
    ↓
Return ImportResult
```

### Import Flow (Merge Mode)

```
User selects file
    ↓
Parse JSON
    ↓
validateExportPackage()
    → Invalid: Show error, abort
    ↓
Check version, migrate if needed
    ↓
applyImport(pkg, 'merge')
    ↓
For each category:
    - Skip items with existing IDs
    - Rename items with conflicting names
    - Move orphaned tasks to inbox
    ↓
Merge with existing state
    ↓
Return ImportResult with warnings
```

## File Format Example

```json
{
  "meta": {
    "version": "1.0.0",
    "appVersion": "0.1.0",
    "exportedAt": "2026-01-19T18:30:00.000Z",
    "categories": ["contexts", "tasks", "reminders", "presets"],
    "counts": {
      "contexts": 5,
      "tasks": 23,
      "reminders": 3,
      "presets": 2
    }
  },
  "data": {
    "contexts": [
      {
        "id": "ctx-1",
        "name": "Work",
        "priority": 1,
        "color": "blue",
        "weight": 2,
        "createdAt": "2026-01-15T10:00:00.000Z",
        "updatedAt": "2026-01-18T14:30:00.000Z"
      }
    ],
    "tasks": [
      {
        "id": "task-1",
        "title": "Review PR",
        "contextId": "ctx-1",
        "completed": false,
        "createdAt": "2026-01-19T09:00:00.000Z",
        "updatedAt": "2026-01-19T09:00:00.000Z"
      }
    ],
    "reminders": [],
    "presets": []
  }
}
```
