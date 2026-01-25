# Research: Nested Task Hierarchy

**Feature**: 001-nested-task-hierarchy
**Date**: 2026-01-25

## Research Tasks Completed

### 1. Existing Task Data Model

**Finding**: Current `Task` interface in `lib/types.ts` (lines 128-143):
- `id: string` - UUID
- `title: string`
- `description?: string`
- `contextId: string | null` - null = inbox
- `deadline?: string`
- `completed: boolean`
- `position: string` - Fractional indexing for ordering
- Sync metadata fields (userId, syncVersion, lastModifiedBy, deletedAt)

**Decision**: Add `parentId: string | null` field to Task interface
**Rationale**: Follows existing nullable pattern (like contextId). Null = root-level task.
**Alternatives considered**:
- Separate TaskHierarchy table: Rejected (adds complexity, violates Simplicity First)
- children[] array: Rejected (harder to query, denormalization issues)

### 2. Fractional Indexing for Child Ordering

**Finding**: Existing `lib/position.ts` uses `fractional-indexing` package:
- `generatePosition(before, after)` - Insert between positions
- `generateEndPosition(items)` - Append to end
- `calculateNewPosition(sortedItems, activeId, overId)` - Drag reorder

**Decision**: Reuse existing position utilities; children have independent position namespace
**Rationale**: Each parent's children are ordered independently by their `position` field
**Alternatives considered**:
- Global position across all tasks: Rejected (complicates hierarchy display)
- Nested position strings (e.g., "a0.b1.c2"): Rejected (over-engineering)

### 3. Expansion State Persistence

**Finding**: App already persists preferences to localStorage via `lib/storage.ts`

**Decision**: Store expansion state in AppState as `expandedTaskIds: Set<string>` (serialized as array)
**Rationale**:
- Matches existing pattern for sidebarPreferences
- Persists across sessions per clarification
- Simple boolean toggle per task ID
**Alternatives considered**:
- Separate localStorage key: Rejected (fragments state management)
- Per-task `isExpanded` field: Rejected (bloats Task entity, sync overhead)

### 4. Focus State Management

**Finding**: Focus state is runtime-only (resets on context/mode change per assumptions)

**Decision**: Store focus state as React state in parent components (ContextDetail, InboxView, WorkingModeView)
**Rationale**:
- Not persisted = no localStorage changes needed
- Each view manages its own focus
- Breadcrumb derives from focus + task tree
**Alternatives considered**:
- Global store state: Rejected (unnecessary for ephemeral UI state)
- URL parameter: Rejected (complicates routing, over-engineering)

### 5. Cross-Device Sync for parentId

**Finding**: Tasks sync via Supabase with LWW (last-write-wins) conflict resolution

**Decision**: `parentId` syncs like any other Task field; LWW resolves conflicts
**Rationale**:
- Per clarification session, LWW is acceptable for parent conflicts
- No special handling needed; existing sync infrastructure handles it
**Alternatives considered**:
- CRDT for hierarchy: Rejected (massive complexity, not needed for single-user)

### 6. Cascade Delete Implementation

**Finding**: Current `DELETE_TASK` action in store.tsx deletes single task

**Decision**: Modify DELETE_TASK to recursively delete all descendants
**Rationale**:
- Spec requires cascade delete with confirmation
- Confirmation dialog already exists (ConfirmDialog component)
- Message should indicate "and X subtasks" count
**Alternatives considered**:
- Soft orphan (children become root): Rejected (spec requires cascade)
- Server-side cascade: Would still need client-side for offline support

### 7. Tree Operations Performance

**Finding**: Tasks stored as flat array in state

**Decision**: Build tree structure on-demand in selectors/helpers
**Rationale**:
- Flat storage is simpler, matches existing pattern
- Tree built only for display (memoized)
- getChildTasks(parentId) is O(n) but n is small (hundreds)
**Alternatives considered**:
- Normalized tree in state: Rejected (complexity, sync issues)
- Index by parentId: Could add if perf issues, premature now

### 8. Drag-and-Drop with Hierarchy

**Finding**: Current SortableTaskList uses @dnd-kit for reordering

**Decision**: Extend to support:
1. Reorder among siblings (existing behavior)
2. Move to different parent (drop on task = make child)
3. Move to root (drop in empty area)

**Rationale**: @dnd-kit supports nested lists and custom drop logic
**Alternatives considered**:
- Context menu only: Rejected (less intuitive than drag-drop)
- New library: Rejected (already using @dnd-kit successfully)

### 9. UI Pattern for Expand/Collapse

**Finding**: No existing accordion pattern in task lists

**Decision**: Use ChevronRight/ChevronDown icons as expand/collapse toggle
**Rationale**:
- Standard pattern (file trees, outliners)
- Lucide icons already in project
- Click toggles expansion; distinct from checkbox and title click
**Alternatives considered**:
- Radix Accordion: Rejected (designed for single-level, not nested trees)
- Disclosure pattern: Similar outcome, simpler with icons

### 10. Progress Indicator Format

**Finding**: Per clarification, count direct children only

**Decision**: Display as "X/Y" badge on parent tasks (e.g., "2/5")
**Rationale**:
- Compact, scannable
- Only shown when task has children
- Consistent with common patterns (GitHub issues, Jira)
**Alternatives considered**:
- Progress bar: Visual noise for small counts
- "2 of 5 complete": Verbose
- Percentage: Less precise for small numbers

## Summary

All technical unknowns resolved. The implementation adds:
- One new field to Task (`parentId`)
- One new field to AppState (`expandedTaskIds`)
- Helper functions in new `lib/taskHierarchy.ts`
- Extended UI components for expand/collapse/focus/breadcrumb

No architectural changes required. Follows existing patterns throughout.
