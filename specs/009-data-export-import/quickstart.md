# Quickstart: Data Export & Import

**Feature**: 009-data-export-import
**Date**: 2026-01-19

## Overview

This feature adds the ability to export and import app data as JSON files, enabling backup, restore, and device migration. The implementation uses a DataProvider interface pattern to support future cloud sync.

## Key Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `lib/dataProvider.ts` | DataProvider interface + localStorage implementation |
| `lib/exportImport.ts` | Core export/import logic (validation, migration, merge) |
| `lib/migration.ts` | Version migration handlers |
| `app/components/settings/DataManagement.tsx` | Main UI component |
| `app/components/common/FilePickerButton.tsx` | Reusable file upload button |

### Modified Files

| File | Changes |
|------|---------|
| `lib/types.ts` | Add export/import types (DataCategory, ExportPackage, etc.) |
| `app/page.tsx` | Add settings entry point with Data Management option |

## Implementation Order

1. **Types first** (`lib/types.ts`)
   - Add all new types from `contracts/types.ts`

2. **DataProvider interface** (`lib/dataProvider.ts`)
   - Define interface
   - Implement localStorage provider wrapping existing `storage.ts`

3. **Export/Import logic** (`lib/exportImport.ts`)
   - `createExportPackage()` - build package from state
   - `validateExportPackage()` - schema validation
   - `applyImport()` - replace/merge logic
   - `downloadExport()` / `readJsonFile()` - file I/O helpers

4. **Migration** (`lib/migration.ts`)
   - Version registry
   - Sequential migration functions

5. **UI Components**
   - `FilePickerButton` - simple, reusable
   - `DataManagement` - tabs for Export/Import/Summary

6. **Integration** (`app/page.tsx`)
   - Add settings icon/menu
   - Wire up Data Management dialog

## Code Snippets

### Adding Types to lib/types.ts

```typescript
// Add to existing file:

export type DataCategory =
  | 'contexts'
  | 'tasks'
  | 'reminders'
  | 'presets'
  | 'session'
  | 'preferences';

export interface ExportPackage {
  meta: ExportMetadata;
  data: ExportData;
}

// ... (see contracts/types.ts for full definitions)
```

### DataProvider Implementation Pattern

```typescript
// lib/dataProvider.ts
import { loadState, saveState, clearState } from './storage';
import type { DataProvider, ExportPackage } from './types';

export const localStorageProvider: DataProvider = {
  id: 'localStorage',
  name: 'Local Storage',

  async load() {
    return loadState();
  },

  async save(state) {
    saveState(state);
  },

  async createExport(categories) {
    const state = loadState();
    // ... build ExportPackage from state
  },

  // ... other methods
};
```

### File Download Helper

```typescript
// lib/exportImport.ts
export function downloadExport(pkg: ExportPackage, filename?: string): void {
  const json = JSON.stringify(pkg, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  const name = filename ?? `vibe-schedule-export-${date}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();

  URL.revokeObjectURL(url);
}
```

### File Upload Helper

```typescript
// lib/exportImport.ts
export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve(data);
      } catch (e) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
```

### Basic UI Component Structure

```typescript
// app/components/settings/DataManagement.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DataManagement({ open, onClose }: DataManagementProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'summary'>('export');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Data Management</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="export">
            {/* Category checkboxes + Export button */}
          </TabsContent>

          <TabsContent value="import">
            {/* File picker + Mode selector + Import button */}
          </TabsContent>

          <TabsContent value="summary">
            {/* Data counts + Last export date */}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

## Testing Checklist

### Export
- [ ] Export with all categories selected
- [ ] Export with subset of categories
- [ ] Export with empty data (fresh install)
- [ ] Export during active session
- [ ] Verify JSON structure matches schema
- [ ] Verify file downloads with correct name

### Import (Replace)
- [ ] Import into fresh installation
- [ ] Import with confirmation dialog
- [ ] Import invalid JSON file (error handling)
- [ ] Import file with wrong structure (error handling)
- [ ] Import from older version (migration)
- [ ] Verify data restored correctly

### Import (Merge)
- [ ] Merge with no ID collisions
- [ ] Merge with ID collisions (verify skip)
- [ ] Merge with name conflicts (verify rename)
- [ ] Merge tasks with missing contexts (verify inbox)
- [ ] Verify existing data preserved

### UI
- [ ] Data Management dialog opens from settings
- [ ] Tab navigation works
- [ ] Category checkboxes respond
- [ ] File picker accepts only .json
- [ ] Import mode toggle works
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Data summary shows correct counts

## Common Pitfalls

1. **Don't forget 'use client'** - All components using browser APIs need this directive

2. **Validate before merge** - Always validate the export package structure before attempting merge operations

3. **Atomic imports** - Never partially apply an import; if any step fails, roll back completely

4. **Update lastExportedAt** - Remember to update this after successful exports

5. **URL.revokeObjectURL** - Always clean up blob URLs after download

6. **FileReader is async** - Don't forget to handle the Promise properly

## Related Documentation

- [Spec](./spec.md) - Feature requirements
- [Research](./research.md) - Technical decisions
- [Data Model](./data-model.md) - Type definitions
- [Contracts](./contracts/) - Interface specifications
