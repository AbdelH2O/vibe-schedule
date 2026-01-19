# Research: Data Export & Import

**Feature**: 009-data-export-import
**Date**: 2026-01-19

## 1. Browser File Download/Upload APIs

### Decision: Use Blob + URL.createObjectURL for download, FileReader for upload

**Rationale**: These APIs are universally supported across modern browsers (including mobile Safari/Chrome) without requiring any polyfills or external dependencies. They work entirely client-side, matching our offline-capable constraint.

**Alternatives Considered**:
- **File System Access API**: More powerful but limited browser support (Chrome-only), requires user permission prompts
- **Download attribute on anchor**: Simple but less control over file naming and MIME types
- **Third-party libraries (FileSaver.js)**: Unnecessary dependency for functionality achievable with native APIs

**Implementation Pattern**:
```typescript
// Export (download)
const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'vibe-schedule-export.json';
a.click();
URL.revokeObjectURL(url);

// Import (upload)
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json,application/json';
input.onchange = (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  const reader = new FileReader();
  reader.onload = () => { /* parse JSON */ };
  reader.readAsText(file);
};
```

## 2. Export File Format & Schema Versioning

### Decision: JSON with embedded metadata header

**Rationale**: JSON is human-readable, debuggable, and natively supported by JavaScript. Embedding version metadata directly in the export enables forward/backward migration without external tooling.

**Alternatives Considered**:
- **Protobuf/MessagePack**: Smaller file sizes but adds complexity and build dependencies
- **ZIP with multiple files**: Overkill for expected data sizes (<1MB)
- **Separate metadata file**: Complicates the export/import flow

**Schema Design**:
```typescript
interface ExportPackage {
  meta: {
    version: string;        // Export format version (e.g., "1.0.0")
    appVersion: string;     // App version at export time
    exportedAt: string;     // ISO timestamp
    categories: DataCategory[];  // Which categories were exported
    counts: {
      contexts: number;
      tasks: number;
      reminders: number;
      presets: number;
    };
  };
  data: {
    contexts?: Context[];
    tasks?: Task[];
    reminders?: Reminder[];
    presets?: SessionPreset[];
    session?: Session | null;
    preferences?: SidebarPreferences;
    userLocation?: UserLocation | null;
    notificationPermission?: 'default' | 'granted' | 'denied';
  };
}
```

## 3. DataProvider Interface Pattern

### Decision: Minimal interface with three core operations

**Rationale**: The spec requires cloud sync extensibility (FR-015). A minimal interface (save, load, export, import) provides the abstraction boundary without over-engineering. localStorage implements it first; future cloud providers implement the same interface.

**Alternatives Considered**:
- **Repository pattern with entities**: Too heavyweight for a personal productivity app with simple data needs
- **Event sourcing**: Overkill; full state snapshots are sufficient for this scale
- **No abstraction (refactor later)**: Higher future cost; spec explicitly requires modularity

**Interface Design**:
```typescript
interface DataProvider {
  // Core operations
  load(): Promise<AppState>;
  save(state: AppState): Promise<void>;

  // Export/Import (provider-agnostic)
  export(categories: DataCategory[]): Promise<ExportPackage>;
  import(pkg: ExportPackage, mode: 'replace' | 'merge'): Promise<ImportResult>;

  // Metadata
  getLastExportDate(): string | null;
  getDataSummary(): DataSummary;
}
```

## 4. Import Validation Strategy

### Decision: Schema validation + referential integrity check

**Rationale**: Import must fail fast on invalid data while preserving user's existing data (SC-006). Two-phase validation: (1) structural schema check, (2) referential integrity (tasks reference valid contexts).

**Validation Steps**:
1. **File type check**: Must be valid JSON
2. **Schema version check**: Must have `meta.version` field
3. **Required fields check**: `meta` and `data` objects must exist
4. **Type validation**: Each entity array contains valid typed objects
5. **Referential integrity**: Tasks' contextId references exist (or null for inbox)

**Error Handling**:
- Return structured `ImportResult` with success/failure and detailed error messages
- Never partially apply import - atomic all-or-nothing operation

## 5. Merge Conflict Resolution

### Decision: Skip ID duplicates, rename name conflicts

**Rationale**: Per clarification session, ID collisions skip imported items (preserving existing). Name collisions add "(imported)" suffix to avoid user confusion while still importing the data.

**Merge Algorithm**:
```typescript
function mergeContexts(existing: Context[], imported: Context[]): Context[] {
  const existingIds = new Set(existing.map(c => c.id));
  const existingNames = new Set(existing.map(c => c.name.toLowerCase()));

  const newContexts = imported
    .filter(c => !existingIds.has(c.id))  // Skip ID duplicates
    .map(c => {
      if (existingNames.has(c.name.toLowerCase())) {
        return { ...c, name: `${c.name} (imported)` };
      }
      return c;
    });

  return [...existing, ...newContexts];
}
```

## 6. Version Migration Strategy

### Decision: Sequential migration functions with version registry

**Rationale**: Export format will evolve. Each version bump needs a migration path. Sequential migrations (1.0→1.1→1.2) are easier to maintain than direct migrations (1.0→1.2).

**Migration Pattern**:
```typescript
const migrations: Record<string, (pkg: ExportPackage) => ExportPackage> = {
  '1.0.0_to_1.1.0': (pkg) => {
    // Add new field with default value
    return { ...pkg, meta: { ...pkg.meta, version: '1.1.0' } };
  },
};

function migrateToLatest(pkg: ExportPackage): ExportPackage {
  let current = pkg;
  while (current.meta.version !== CURRENT_VERSION) {
    const migrationKey = `${current.meta.version}_to_${nextVersion(current.meta.version)}`;
    current = migrations[migrationKey](current);
  }
  return current;
}
```

## 7. UI Integration Point

### Decision: Settings gear icon with dropdown menu including "Data Management"

**Rationale**: Existing app likely has or will have settings. Data management is a settings-adjacent feature. A modal/dialog keeps the user in context while performing export/import.

**UI Flow**:
1. User clicks settings icon → dropdown shows "Data Management"
2. Dialog opens with tabs or sections: Export, Import, Data Summary
3. Export: category checkboxes + export button → file downloads
4. Import: file picker + mode selector (replace/merge) + confirmation dialog → import executes
5. Summary: shows counts for each category, last export date

## Summary of Decisions

| Topic | Decision | Key Benefit |
|-------|----------|-------------|
| File APIs | Blob + FileReader | Universal browser support, no dependencies |
| Export format | JSON with metadata | Human-readable, self-describing |
| Abstraction | DataProvider interface | Cloud sync ready without over-engineering |
| Validation | Schema + referential | Fast failure, atomic operations |
| Merge conflicts | Skip IDs, rename names | Preserves existing data, avoids confusion |
| Migration | Sequential version functions | Maintainable evolution path |
| UI entry | Settings dropdown → dialog | Discoverable, in-context |
