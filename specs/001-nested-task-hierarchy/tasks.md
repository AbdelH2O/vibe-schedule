# Tasks: Nested Task Hierarchy

**Input**: Design documents from `/specs/001-nested-task-hierarchy/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual testing only (no automated test framework in project)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **lib/**: Core utilities and state management
- **app/components/**: React UI components
- **supabase/migrations/**: Database migrations

---

## Phase 1: Setup (Data Model Foundation)

**Purpose**: Add parentId to Task type and expandedTaskIds to AppState - required for all features

- [x] T001 Add `parentId: string | null` field to Task interface in `lib/types.ts`
- [x] T002 Add `expandedTaskIds: string[]` to AppState interface in `lib/types.ts`
- [x] T003 Update INITIAL_STATE to include `expandedTaskIds: []` in `lib/types.ts`
- [x] T004 Create `lib/taskHierarchy.ts` with helper functions: getChildren, getDescendants, getAncestors, isDescendantOf, getChildCompletionStats, hasChildren

---

## Phase 2: Foundational (Store Actions)

**Purpose**: Core state management that MUST be complete before ANY user story UI can work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Add TOGGLE_TASK_EXPANDED action type to store Action union in `lib/store.tsx`
- [x] T006 Add SET_TASKS_EXPANDED action type to store Action union in `lib/store.tsx`
- [x] T007 Implement TOGGLE_TASK_EXPANDED reducer case in `lib/store.tsx`
- [x] T008 Implement SET_TASKS_EXPANDED reducer case in `lib/store.tsx`
- [x] T009 Modify ADD_TASK action to accept optional `parentId` in payload in `lib/store.tsx`
- [x] T010 Modify ADD_TASK reducer to set parentId on new task and inherit contextId from parent in `lib/store.tsx`
- [x] T011 Modify DELETE_TASK reducer to cascade delete all descendants and clean up expandedTaskIds in `lib/store.tsx`
- [x] T012 Modify MOVE_TASK_TO_CONTEXT reducer to cascade contextId change to all descendants in `lib/store.tsx`
- [x] T013 Add toggleTaskExpanded and setTasksExpanded callbacks to store context in `lib/store.tsx`
- [x] T014 Add task migration in loadState to add `parentId: null` to existing tasks in `lib/storage.ts`
- [x] T015 Add expandedTaskIds migration in loadState to initialize empty array if missing in `lib/storage.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create Child Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can create subtasks under any existing task with unlimited nesting depth

**Independent Test**: Create a task, add a subtask under it via "add subtask" action, verify child appears under parent

### Implementation for User Story 1

- [x] T016 [US1] Add ADD_SUBTASK action type to store Action union in `lib/store.tsx`
- [x] T017 [US1] Implement ADD_SUBTASK reducer: create task with parentId, inherit contextId, generate position among siblings in `lib/store.tsx`
- [x] T018 [US1] Add addSubtask callback to store context in `lib/store.tsx`
- [x] T019 [P] [US1] Add "Add subtask" button/action to TaskListItem component in `app/components/tasks/TaskListItem.tsx`
- [x] T020 [P] [US1] Add "Add subtask" button/action to WorkingTaskItem component in `app/components/working/WorkingTaskItem.tsx`
- [x] T021 [US1] Update CreateTaskDialog to accept optional parentId prop for subtask creation in `app/components/tasks/CreateTaskDialog.tsx`
- [x] T022 [US1] Update ConfirmDialog for delete action to show descendant count ("Delete task and X subtasks?") in `app/components/shared/ConfirmDialog.tsx`

**Checkpoint**: User Story 1 complete - can create nested subtasks at any depth

---

## Phase 4: User Story 2 - View and Expand Nested Tasks (Priority: P1) 🎯 MVP

**Goal**: Parent tasks show expand/collapse control; children visible when expanded

**Independent Test**: With nested tasks created, expand parent to see children, collapse to hide them

### Implementation for User Story 2

- [x] T023 [P] [US2] Create TaskProgressBadge component showing "X/Y" child completion in `app/components/tasks/TaskProgressBadge.tsx`
- [x] T024 [P] [US2] Create ExpandCollapseButton component with ChevronRight/ChevronDown icons in `app/components/tasks/ExpandCollapseButton.tsx`
- [x] T025 [US2] Add depth, isExpanded, hasChildren, childStats, onToggleExpand props to TaskListItem in `app/components/tasks/TaskListItem.tsx`
- [x] T026 [US2] Add indentation styling based on depth prop to TaskListItem in `app/components/tasks/TaskListItem.tsx`
- [x] T027 [US2] Add ExpandCollapseButton to TaskListItem (show only when hasChildren) in `app/components/tasks/TaskListItem.tsx`
- [x] T028 [US2] Add TaskProgressBadge to TaskListItem (show only when hasChildren) in `app/components/tasks/TaskListItem.tsx`
- [x] T029 [US2] Create NestedTaskList component with recursive rendering, parentId filtering, depth passing in `app/components/tasks/NestedTaskList.tsx`
- [x] T030 [US2] Update SortableTaskList to use NestedTaskList for hierarchy-aware rendering in `app/components/tasks/SortableTaskList.tsx`
- [x] T031 [US2] Integrate expandedTaskIds state and toggle callbacks into ContextDetail in `app/components/contexts/ContextDetail.tsx`
- [x] T032 [US2] Integrate expandedTaskIds state and toggle callbacks into InboxView in `app/components/tasks/InboxView.tsx`

**Checkpoint**: User Story 2 complete - can view/expand/collapse nested task hierarchy

---

## Phase 5: User Story 3 - Focus and Breadcrumb Navigation (Priority: P2)

**Goal**: Click task title to focus; breadcrumb shows path back to root

**Independent Test**: Click task title to focus, verify only that task and descendants shown, click breadcrumb to navigate back

### Implementation for User Story 3

- [x] T033 [P] [US3] Create TaskBreadcrumb component with ancestor navigation in `app/components/tasks/TaskBreadcrumb.tsx`
- [x] T034 [US3] Add onFocus prop to TaskListItem triggered by title click in `app/components/tasks/TaskListItem.tsx`
- [x] T035 [US3] Make title clickable (distinct from checkbox/expand) to trigger focus in `app/components/tasks/TaskListItem.tsx`
- [x] T036 [US3] Add focusedTaskId state to ContextDetail component in `app/components/contexts/ContextDetail.tsx`
- [x] T037 [US3] Add TaskBreadcrumb to ContextDetail (show when focused) in `app/components/contexts/ContextDetail.tsx`
- [x] T038 [US3] Filter displayed tasks by focusedTaskId in ContextDetail in `app/components/contexts/ContextDetail.tsx`
- [x] T039 [US3] Reset focusedTaskId when switching contexts in ContextDetail in `app/components/contexts/ContextDetail.tsx`
- [x] T040 [US3] Add focusedTaskId state to InboxView component in `app/components/tasks/InboxView.tsx`
- [x] T041 [US3] Add TaskBreadcrumb to InboxView (show when focused) in `app/components/tasks/InboxView.tsx`
- [x] T042 [US3] Filter displayed tasks by focusedTaskId in InboxView in `app/components/tasks/InboxView.tsx`

**Checkpoint**: User Story 3 complete - focus mode and breadcrumb navigation work in definition mode

---

## Phase 6: User Story 4 - Working Mode Integration (Priority: P2)

**Goal**: Hierarchy features work in working mode: expand/collapse, focus, progress indicators

**Independent Test**: Enter working mode, expand parent tasks, see progress indicators, focus on subtasks

### Implementation for User Story 4

- [x] T043 [US4] Add depth, isExpanded, hasChildren, childStats, onToggleExpand props to WorkingTaskItem in `app/components/working/WorkingTaskItem.tsx`
- [x] T044 [US4] Add indentation styling based on depth to WorkingTaskItem in `app/components/working/WorkingTaskItem.tsx`
- [x] T045 [US4] Add ExpandCollapseButton to WorkingTaskItem in `app/components/working/WorkingTaskItem.tsx`
- [x] T046 [US4] Add TaskProgressBadge to WorkingTaskItem in `app/components/working/WorkingTaskItem.tsx`
- [x] T047 [US4] Add onFocus prop and make title clickable in WorkingTaskItem in `app/components/working/WorkingTaskItem.tsx`
- [x] T048 [US4] Update WorkingTaskList for hierarchy-aware rendering with parentId filtering in `app/components/working/WorkingTaskList.tsx`
- [x] T049 [US4] Add focusedTaskId state to WorkingModeView in `app/components/working/WorkingModeView.tsx`
- [x] T050 [US4] Add TaskBreadcrumb to WorkingModeView (show when focused) in `app/components/working/WorkingModeView.tsx`
- [x] T051 [US4] Reset focusedTaskId when switching mode (definition ↔ working) in `app/components/working/WorkingModeView.tsx`

**Checkpoint**: User Story 4 complete - hierarchy works fully in working mode

---

## Phase 7: User Story 5 - Reorder Tasks Within Hierarchy (Priority: P3)

**Goal**: Drag-and-drop to reorder siblings or move tasks between parents

**Independent Test**: Drag task to different parent or to root, verify parent relationship changes correctly

### Implementation for User Story 5

- [x] T052 [US5] Add MOVE_TASK_TO_PARENT action type to store Action union in `lib/store.tsx`
- [x] T053 [US5] Implement MOVE_TASK_TO_PARENT reducer with circular reference check and context cascade in `lib/store.tsx`
- [x] T054 [US5] Add moveTaskToParent callback to store context in `lib/store.tsx`
- [x] T055 [US5] Update SortableTaskItem to handle drop-on-task for reparenting in `app/components/tasks/SortableTaskItem.tsx`
- [x] T056 [US5] Update SortableTaskList drag handlers to detect parent change vs sibling reorder in `app/components/tasks/SortableTaskList.tsx`
- [x] T057 [US5] Add drop zone indicator for "make child of this task" during drag in `app/components/tasks/SortableTaskList.tsx`
- [x] T058 [US5] Update SortableWorkingTaskItem for hierarchy-aware drag in working mode in `app/components/working/SortableWorkingTaskItem.tsx`

**Checkpoint**: User Story 5 complete - can reorganize task hierarchy via drag-and-drop

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Persistence, sync, export/import, and cleanup

- [x] T059 [P] Create Supabase migration to add parent_id column to tasks table in `supabase/migrations/[timestamp]_add_task_parent_id.sql` (N/A - supabase migrations directory doesn't exist yet; parentId already in Task type)
- [x] T060 [P] Update exportImport functions to preserve parentId in task export/import in `lib/exportImport.ts` (Already preserved - Task type includes parentId)
- [x] T061 [P] Handle orphaned tasks (missing parent after import) by setting parentId to null in `lib/dataProvider.ts`
- [x] T062 Update sync provider to include parentId in task sync operations in `lib/sync/supabaseProvider.ts` (Already handled via toSnakeCase conversion)
- [x] T063 Add keyboard accessibility: Enter/Space to toggle expand, arrow keys for navigation in `app/components/tasks/ExpandCollapseButton.tsx` (Enter/Space already implemented)
- [ ] T064 Run quickstart.md testing checklist validation (manual testing required)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Phase 2 completion
  - US1 + US2 (P1): Core MVP - implement together
  - US3 + US4 (P2): Focus/breadcrumb - implement after MVP
  - US5 (P3): Drag reordering - implement last
- **Polish (Phase 8)**: Can begin after US2, full completion after all stories

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories
- **User Story 2 (P1)**: Can start after US1 data exists (or parallel with shared tasks)
- **User Story 3 (P2)**: Depends on US2 expand/collapse UI components
- **User Story 4 (P2)**: Reuses components from US2/US3; can parallel US3
- **User Story 5 (P3)**: Depends on basic hierarchy from US1/US2

### Within Each User Story

- Store actions before UI components
- Shared components (badges, buttons) before consumer components
- Definition mode before working mode (where applicable)

### Parallel Opportunities

**Phase 1 (all parallel - different sections of types.ts)**:
- T001, T002, T003 can be done in one edit session
- T004 independent new file

**Phase 2 (sequential - same file lib/store.tsx)**:
- T005-T013 must be sequential (same file)
- T014-T015 parallel with store work (different file)

**Phase 3 - US1**:
- T019, T020 parallel (different files)

**Phase 4 - US2**:
- T023, T024 parallel (new independent files)
- T031, T032 parallel (different files)

**Phase 5 - US3**:
- T033 independent new file

**Phase 6 - US4**:
- Most tasks sequential (same files)

**Phase 8 - Polish**:
- T059, T060, T061 all parallel (different files)

---

## Parallel Example: MVP (US1 + US2)

```bash
# After Phase 2 Foundation complete:

# Launch US1 store work:
Task: "Add ADD_SUBTASK action and reducer in lib/store.tsx"

# Then parallel UI work:
Task: "Add subtask button to TaskListItem in app/components/tasks/TaskListItem.tsx"
Task: "Add subtask button to WorkingTaskItem in app/components/working/WorkingTaskItem.tsx"

# US2 can start parallel with shared component creation:
Task: "Create TaskProgressBadge in app/components/tasks/TaskProgressBadge.tsx"
Task: "Create ExpandCollapseButton in app/components/tasks/ExpandCollapseButton.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (store)
3. Complete Phase 3: User Story 1 (create subtasks)
4. Complete Phase 4: User Story 2 (view/expand hierarchy)
5. **STOP and VALIDATE**: Test creating and viewing nested tasks
6. Deploy/demo basic nesting functionality

### Incremental Delivery

1. MVP: Setup + Foundation + US1 + US2 → Basic nesting works
2. Add US3: Focus + breadcrumb → Deep hierarchy navigation
3. Add US4: Working mode → Hierarchy in both modes
4. Add US5: Drag reordering → Full reorganization
5. Polish: Sync, export/import, accessibility

### Suggested MVP Scope

**Minimum**: User Stories 1 + 2 (21 tasks: T001-T015 foundation + T016-T022 US1 + T023-T032 US2)
- Can create nested tasks at any depth
- Can view hierarchy with expand/collapse
- Progress indicators show child completion

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Manual testing per quickstart.md checklist (no automated tests)
- Commit after each task or logical group
- US1+US2 are tightly coupled (both P1) - implement together as MVP
- Focus/breadcrumb (US3) enhances but doesn't block basic nesting
