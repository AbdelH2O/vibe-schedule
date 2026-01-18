# Tasks: Tasks & Inbox

**Input**: Design documents from `/specs/003-tasks-inbox/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested - manual testing via `pnpm dev`, `pnpm lint`, `pnpm build`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Next.js App Router (single project)
- **Components**: `app/components/tasks/` for new task components
- **UI Components**: `components/ui/` for shadcn/ui components
- **Existing code**: `lib/store.tsx` (all actions exist), `lib/types.ts` (Task type exists)

---

## Phase 1: Setup

**Purpose**: Add required shadcn/ui component and create directory structure

- [x] T001 Install shadcn/ui checkbox component via `pnpm dlx shadcn@latest add checkbox`
- [x] T002 Create app/components/tasks/ directory for task management components

---

## Phase 2: Foundational (Shared Components)

**Purpose**: Core components that multiple user stories depend on

**⚠️ CRITICAL**: User story implementation can begin after TaskListItem is complete

- [x] T003 [P] Create TaskListItem component skeleton in app/components/tasks/TaskListItem.tsx with props interface
- [x] T004 [P] Create TaskList component skeleton in app/components/tasks/TaskList.tsx with props interface
- [x] T005 [P] Create TaskForm component skeleton in app/components/tasks/TaskForm.tsx with props interface

**Checkpoint**: Foundation ready - component skeletons in place

---

## Phase 3: User Story 1 - Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks with a title, see them in a list, persistence works

**Independent Test**: Create a task, verify it appears in list, refresh page, verify it persists

### Implementation for User Story 1

- [x] T006 [US1] Implement TaskForm with title input, validation (non-empty), submit handler in app/components/tasks/TaskForm.tsx
- [x] T007 [US1] Implement TaskListItem with title display, completion checkbox (visual only for now) in app/components/tasks/TaskListItem.tsx
- [x] T008 [US1] Implement TaskList to render TaskListItem array with empty state in app/components/tasks/TaskList.tsx
- [x] T009 [US1] Create CreateTaskDialog to wrap TaskForm in a Dialog in app/components/tasks/CreateTaskDialog.tsx
- [x] T010 [US1] Add "Add Task" button trigger in app/page.tsx that opens CreateTaskDialog
- [x] T011 [US1] Wire CreateTaskDialog to store.addTask() action and close on success
- [x] T012 [US1] Display TaskList in main content area of app/page.tsx showing all tasks

**Checkpoint**: Task creation and viewing works. Refresh persists data.

---

## Phase 4: User Story 2 - Inbox as Staging Area (Priority: P1)

**Goal**: Inbox appears in sidebar, new tasks default to Inbox, Inbox view shows unassigned tasks

**Independent Test**: Create task without context → appears in Inbox; select Inbox → see only unassigned tasks

### Implementation for User Story 2

- [x] T013 [US2] Add Inbox entry to sidebar above context list in app/components/Sidebar.tsx with inbox icon
- [x] T014 [US2] Update selection state type in app/page.tsx to support `{ type: 'inbox' } | { type: 'context', id: string } | null`
- [x] T015 [US2] Add Inbox click handler in Sidebar that sets selection to `{ type: 'inbox' }`
- [x] T016 [US2] Display Inbox task count badge in sidebar using getInboxTasks().length
- [x] T017 [US2] Create InboxView component in app/components/tasks/InboxView.tsx showing TaskList with inbox tasks
- [x] T018 [US2] Render InboxView in app/page.tsx when selection is `{ type: 'inbox' }`
- [x] T019 [US2] Add "Add Task" button to InboxView that opens CreateTaskDialog with contextId=null

**Checkpoint**: Inbox navigation and task display works independently.

---

## Phase 5: User Story 3 - Assign Tasks to Contexts (Priority: P2)

**Goal**: Tasks can be assigned to contexts during creation or editing

**Independent Test**: Create task with context selected → appears in context; edit task to change context → moves

### Implementation for User Story 3

- [x] T020 [US3] Add context selector (Select component) to TaskForm in app/components/tasks/TaskForm.tsx
- [x] T021 [US3] Populate context selector with contexts from store in TaskForm
- [x] T022 [US3] Create EditTaskDialog in app/components/tasks/EditTaskDialog.tsx wrapping TaskForm with existing task data
- [x] T023 [US3] Add edit button to TaskListItem that opens EditTaskDialog in app/components/tasks/TaskListItem.tsx
- [x] T024 [US3] Wire EditTaskDialog to store.updateTask() for context changes
- [x] T025 [US3] Wire EditTaskDialog to store.moveTaskToContext() for explicit moves

**Checkpoint**: Task context assignment and reassignment works.

---

## Phase 6: User Story 4 - Mark Tasks Complete (Priority: P2)

**Goal**: Checkbox toggles task completion, visual feedback, works in both modes

**Independent Test**: Click checkbox → task shows completed state; refresh → state persists

### Implementation for User Story 4

- [x] T026 [US4] Wire checkbox in TaskListItem to store.toggleTaskCompleted() in app/components/tasks/TaskListItem.tsx
- [x] T027 [US4] Add strikethrough styling for completed tasks in TaskListItem
- [x] T028 [US4] Ensure checkbox works regardless of app mode (Definition or Working) - no mode check for this action
- [x] T029 [US4] Add aria-label for checkbox accessibility ("Mark [title] as complete/incomplete")

**Checkpoint**: Task completion toggle works and persists.

---

## Phase 7: User Story 5 - View Tasks Per Context (Priority: P2)

**Goal**: Selecting a context shows only its tasks in the detail view

**Independent Test**: Create tasks in different contexts; select context → see only its tasks

### Implementation for User Story 5

- [x] T030 [US5] Add TaskList section to ContextDetail component in app/components/contexts/ContextDetail.tsx
- [x] T031 [US5] Use getTasksByContextId(contextId) to filter tasks in ContextDetail
- [x] T032 [US5] Add empty state for contexts with no tasks in ContextDetail TaskList section
- [x] T033 [US5] Add "Add Task" button in ContextDetail that opens CreateTaskDialog with contextId preset
- [x] T034 [US5] Update ContextListItem to show task count badge in app/components/contexts/ContextListItem.tsx

**Checkpoint**: Context-specific task views work.

---

## Phase 8: User Story 6 - Add Task Deadline (Priority: P3)

**Goal**: Optional deadline field in task form, deadline displays on task item

**Independent Test**: Create task with deadline → deadline shows in list; edit to remove → deadline gone

### Implementation for User Story 6

- [x] T035 [US6] Add deadline date input to TaskForm in app/components/tasks/TaskForm.tsx
- [x] T036 [US6] Display deadline in TaskListItem with relative time format (e.g., "in 3 days") in app/components/tasks/TaskListItem.tsx
- [x] T037 [US6] Add visual indicator for overdue tasks (deadline in past) in TaskListItem
- [x] T038 [US6] Allow clearing deadline in EditTaskDialog by setting empty value

**Checkpoint**: Task deadlines work end-to-end.

---

## Phase 9: User Story 7 - Delete Tasks (Priority: P3)

**Goal**: Delete button with confirmation removes task permanently

**Independent Test**: Delete task → confirmation appears → confirm → task removed from all views

### Implementation for User Story 7

- [x] T039 [US7] Add delete button (trash icon) to TaskListItem in app/components/tasks/TaskListItem.tsx
- [x] T040 [US7] Wire delete button to open ConfirmDialog in TaskListItem
- [x] T041 [US7] Wire ConfirmDialog confirmation to store.deleteTask() in TaskListItem
- [x] T042 [US7] Hide delete button in Working Mode (only completion toggle allowed) in TaskListItem

**Checkpoint**: Task deletion with confirmation works.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T043 [P] Add keyboard navigation support to TaskList (arrow keys, Enter to toggle)
- [x] T044 [P] Ensure all interactive elements have proper ARIA labels in task components
- [x] T045 [P] Add visual truncation for long task titles with title attribute for full text
- [x] T046 Hide task creation/editing UI elements in Working Mode across all components
- [x] T047 Run `pnpm lint` and fix any linting errors
- [x] T048 Run `pnpm build` and verify no build errors
- [ ] T049 Validate against quickstart.md test cases manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - creates component skeletons
- **User Story 1 (Phase 3)**: Depends on Foundational - implements core task creation
- **User Story 2 (Phase 4)**: Depends on US1 (needs TaskList) - adds Inbox navigation
- **User Stories 3-7 (Phases 5-9)**: Depend on US1+US2 for base functionality
- **Polish (Phase 10)**: Depends on all user stories complete

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|------------|---------------------|
| US1 (Create/View) | Foundational | - |
| US2 (Inbox) | US1 | - |
| US3 (Assign) | US1, US2 | US4, US5 |
| US4 (Complete) | US1 | US3, US5 |
| US5 (Context View) | US1 | US3, US4 |
| US6 (Deadline) | US1 | US7 |
| US7 (Delete) | US1 | US6 |

### Within Each User Story

- Component skeletons before implementation
- Form components before dialogs
- List components before view integration
- Store wiring after UI is in place

### Parallel Opportunities Per Phase

**Phase 2 (Foundational)**:
```
T003, T004, T005 can run in parallel (different files)
```

**Phase 5-6 (US3 + US4)**:
```
After US1+US2 complete:
- US3 and US4 can run in parallel (different features)
```

**Phase 8-9 (US6 + US7)**:
```
After earlier stories:
- US6 and US7 can run in parallel (independent features)
```

---

## Parallel Example: Foundational Phase

```bash
# Launch all skeleton tasks together:
Task: "T003 Create TaskListItem component skeleton in app/components/tasks/TaskListItem.tsx"
Task: "T004 Create TaskList component skeleton in app/components/tasks/TaskList.tsx"
Task: "T005 Create TaskForm component skeleton in app/components/tasks/TaskForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (checkbox component)
2. Complete Phase 2: Foundational (component skeletons)
3. Complete Phase 3: User Story 1 (task creation/viewing)
4. Complete Phase 4: User Story 2 (Inbox)
5. **STOP and VALIDATE**: Test task creation → Inbox flow
6. This delivers: Create tasks, view in Inbox, persistence works

### Incremental Delivery

1. Setup + Foundational → Skeletons ready
2. Add US1 → Task creation works → **MVP checkpoint**
3. Add US2 → Inbox navigation works → **Full capture flow**
4. Add US3 + US4 + US5 → Context assignment + completion → **Core workflow**
5. Add US6 + US7 → Deadlines + deletion → **Complete feature**
6. Polish → Accessibility + validation → **Production ready**

### Single Developer Strategy

Recommended execution order:
1. T001-T002 (Setup)
2. T003-T005 in parallel (Foundational)
3. T006-T012 sequentially (US1 - MVP)
4. T013-T019 sequentially (US2 - Inbox)
5. T020-T029 (US3 + US4 can interleave)
6. T030-T034 (US5)
7. T035-T042 (US6 + US7 can interleave)
8. T043-T049 (Polish)

---

## Summary

| Phase | Tasks | Parallel Opportunities |
|-------|-------|----------------------|
| Setup | 2 | None |
| Foundational | 3 | 3 (all parallel) |
| US1: Create/View | 7 | None (sequential) |
| US2: Inbox | 7 | None (sequential) |
| US3: Assign | 6 | With US4, US5 |
| US4: Complete | 4 | With US3, US5 |
| US5: Context View | 5 | With US3, US4 |
| US6: Deadline | 4 | With US7 |
| US7: Delete | 4 | With US6 |
| Polish | 7 | 4 (marked [P]) |
| **Total** | **49** | |

---

## Notes

- All store actions exist (`addTask`, `updateTask`, `deleteTask`, `toggleTaskCompleted`, `moveTaskToContext`)
- All selectors exist (`getTasksByContextId`, `getInboxTasks`)
- No backend work needed - UI components only
- shadcn/ui checkbox is the only new dependency
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
