# Tasks: Data Export & Import

**Input**: Design documents from `/specs/009-data-export-import/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No automated tests requested - manual testing only per plan.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
- **lib/**: Business logic (TypeScript modules)
- **app/components/**: React UI components
- **app/page.tsx**: Main page (entry point integration)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add new types and create core interfaces

- [x] T001 [P] Add export/import types to lib/types.ts (DataCategory, ExportMetadata, ExportData, ExportPackage, ImportMode, ImportWarning, ImportResult, DataSummary)
- [x] T002 [P] Add DataProvider interface to lib/types.ts
- [x] T003 [P] Add export format constants (EXPORT_FORMAT_VERSION, ALL_DATA_CATEGORIES) to lib/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create lib/dataProvider.ts with DataProvider interface implementation skeleton
- [x] T005 Implement localStorage provider load() method in lib/dataProvider.ts (wraps existing storage.ts)
- [x] T006 Implement localStorage provider save() method in lib/dataProvider.ts
- [x] T007 Implement localStorage provider clear() method in lib/dataProvider.ts
- [x] T008 [P] Create lib/migration.ts with version migration framework and CURRENT_VERSION constant
- [x] T009 [P] Create app/components/common/FilePickerButton.tsx reusable component

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Export All Data (Priority: P1) 🎯 MVP

**Goal**: Users can back up all their data to a downloadable JSON file

**Independent Test**: Create sample data → Click Export → Verify downloaded file contains valid JSON with all data categories

### Implementation for User Story 1

- [x] T010 [US1] Implement createExport(categories) method in lib/dataProvider.ts - builds ExportPackage from current state
- [x] T011 [US1] Implement getDataSummary() method in lib/dataProvider.ts - computes counts from current state
- [x] T012 [US1] Implement getLastExportDate() and setLastExportDate() methods in lib/dataProvider.ts
- [x] T013 [P] [US1] Create lib/exportImport.ts with downloadExport() helper function (Blob + URL.createObjectURL pattern)
- [x] T014 [US1] Create app/components/settings/ExportPanel.tsx with basic "Export All" button
- [x] T015 [US1] Wire ExportPanel to dataProvider.createExport() and downloadExport()
- [x] T016 [US1] Display data summary (counts) in ExportPanel before export
- [x] T017 [US1] Update lastExportedAt after successful export in ExportPanel

**Checkpoint**: User Story 1 complete - users can export all data to a JSON file

---

## Phase 4: User Story 2 - Import Data to New Device (Priority: P1)

**Goal**: Users can restore their data from a previously exported file (replace mode)

**Independent Test**: Export data → Clear browser data → Import file → Verify all data restored exactly

### Implementation for User Story 2

- [x] T018 [US2] Add readJsonFile() helper function to lib/exportImport.ts (FileReader pattern)
- [x] T019 [US2] Implement validateExportPackage() method in lib/dataProvider.ts - schema validation
- [x] T020 [US2] Implement applyImport() method for 'replace' mode in lib/dataProvider.ts
- [x] T021 [US2] Add needsMigration() and migrateExportPackage() functions to lib/migration.ts
- [x] T022 [P] [US2] Create app/components/settings/ImportPanel.tsx with file picker and basic import flow
- [x] T023 [US2] Add import confirmation dialog to ImportPanel (warn about data replacement)
- [x] T024 [US2] Display validation errors for invalid files in ImportPanel
- [x] T025 [US2] Display import success message with counts in ImportPanel
- [x] T026 [US2] Wire ImportPanel to dataProvider.applyImport() with 'replace' mode

**Checkpoint**: User Story 2 complete - users can import data with replace mode

---

## Phase 5: User Story 3 - Selective Export (Priority: P2)

**Goal**: Users can choose specific data categories to export

**Independent Test**: Select only "Contexts" and "Presets" → Export → Verify file contains only those categories

### Implementation for User Story 3

- [x] T027 [US3] Add category checkboxes UI to ExportPanel in app/components/settings/ExportPanel.tsx
- [x] T028 [US3] Add category selection state management to ExportPanel
- [x] T029 [US3] Pass selected categories to createExport() instead of all categories
- [x] T030 [US3] Disable export button when no categories selected
- [x] T031 [US3] Display selected category summary before export

**Checkpoint**: User Story 3 complete - users can export selected categories

---

## Phase 6: User Story 4 - Import Merge Mode (Priority: P3)

**Goal**: Users can merge imported data with existing data without losing current work

**Independent Test**: Have existing contexts → Import file with new contexts → Verify both old and new exist

### Implementation for User Story 4

- [x] T032 [US4] Implement merge logic for contexts in lib/dataProvider.ts (skip ID dupes, rename name conflicts)
- [x] T033 [US4] Implement merge logic for tasks in lib/dataProvider.ts (handle orphaned tasks → inbox)
- [x] T034 [US4] Implement merge logic for reminders and presets in lib/dataProvider.ts
- [x] T035 [US4] Update applyImport() to support 'merge' mode in lib/dataProvider.ts
- [x] T036 [US4] Add import mode selector (Replace/Merge) to ImportPanel
- [x] T037 [US4] Display merge warnings (skipped, renamed, orphaned) in import result
- [x] T038 [US4] Update confirmation dialog to show different message for merge vs replace

**Checkpoint**: User Story 4 complete - users can merge imported data

---

## Phase 7: User Story 5 - Data Management Interface (Priority: P2)

**Goal**: Users have a dedicated, discoverable place for all data operations

**Independent Test**: Navigate to settings → Open Data Management → Verify Export/Import/Summary tabs present

### Implementation for User Story 5

- [x] T039 [P] [US5] Create app/components/settings/DataManagement.tsx dialog component with tab structure
- [x] T040 [P] [US5] Create app/components/settings/SummaryPanel.tsx with data counts display
- [x] T041 [US5] Integrate ExportPanel into DataManagement dialog as "Export" tab
- [x] T042 [US5] Integrate ImportPanel into DataManagement dialog as "Import" tab
- [x] T043 [US5] Integrate SummaryPanel into DataManagement dialog as "Summary" tab
- [x] T044 [US5] Add settings entry point to app/page.tsx (gear icon or menu item)
- [x] T045 [US5] Wire settings entry to open DataManagement dialog

**Checkpoint**: User Story 5 complete - users can access Data Management from main UI

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and edge case handling

- [x] T046 Add storage usage estimation to SummaryPanel in app/components/settings/SummaryPanel.tsx
- [x] T047 Add "last exported" timestamp display to SummaryPanel
- [x] T048 Handle localStorage quota exceeded error gracefully during import in lib/dataProvider.ts
- [x] T049 Add loading states to ExportPanel and ImportPanel during async operations
- [x] T050 Ensure DataManagement dialog works correctly on mobile viewports
- [x] T051 Run quickstart.md validation - verify all testing checklist items pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority but US2 depends on export being available to test
  - US3 depends on US1 (extends export functionality)
  - US4 depends on US2 (extends import functionality)
  - US5 depends on US1 and US2 (integrates both panels)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 2 (Foundational)
    ↓
Phase 3 (US1: Export All) ─────────────────────┐
    ↓                                          │
Phase 4 (US2: Import Replace) ────────────────┐│
    ↓                                         ││
Phase 5 (US3: Selective Export) ←─────────────┼┘ (extends US1)
    ↓                                         │
Phase 6 (US4: Merge Mode) ←───────────────────┘   (extends US2)
    ↓
Phase 7 (US5: Data Management UI) ← (integrates US1-US4)
    ↓
Phase 8 (Polish)
```

### Within Each User Story

- Foundation tasks before story-specific tasks
- Data layer before UI
- Core functionality before enhancements

### Parallel Opportunities

**Phase 1 (Setup)**:
- T001, T002, T003 can all run in parallel (different sections of same file, but independent additions)

**Phase 2 (Foundational)**:
- T008 and T009 can run in parallel (different files)

**Phase 3 (US1)**:
- T013 can run in parallel with T010-T012 (different file)

**Phase 4 (US2)**:
- T022 can run in parallel with T018-T021 after T018 completes

**Phase 7 (US5)**:
- T039 and T040 can run in parallel (different files)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all setup tasks together:
Task: "Add export/import types to lib/types.ts"
Task: "Add DataProvider interface to lib/types.ts"
Task: "Add export format constants to lib/types.ts"
```

## Parallel Example: Phase 7 Data Management

```bash
# Launch container and content panel together:
Task: "Create DataManagement.tsx dialog component"
Task: "Create SummaryPanel.tsx with data counts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Export All)
4. **STOP and VALIDATE**: Test export works correctly
5. Complete Phase 4: User Story 2 (Import Replace)
6. **STOP and VALIDATE**: Test full export→import cycle
7. Deploy/demo - Basic data portability is now available!

### Incremental Delivery

1. Setup + Foundational → Core infrastructure ready
2. User Story 1 → Export works → Can back up data
3. User Story 2 → Import works → Can restore/migrate data (MVP Complete!)
4. User Story 3 → Selective export → Enhanced flexibility
5. User Story 4 → Merge mode → Non-destructive imports
6. User Story 5 → Data Management UI → Professional UX
7. Polish → Edge cases, mobile, performance

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable after completion
- No automated tests - use manual testing checklist in quickstart.md
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
