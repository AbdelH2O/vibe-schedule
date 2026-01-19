# Tasks: Work Mode Sidebar

**Input**: Design documents from `/specs/008-workmode-sidebar/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No automated tests requested. Manual testing per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/components/working/` for feature components
- **Library**: `lib/` for types, store, and utilities
- **UI Components**: `components/ui/` for shadcn components

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization - types, store actions, and UI components needed by all stories

- [x] T001 Add SidebarPreferences type and DeadlineScopeFilter type to lib/types.ts
- [x] T002 Add sidebarPreferences to AppState interface and INITIAL_STATE in lib/types.ts
- [x] T003 [P] Add UPDATE_SIDEBAR_PREFERENCES action type and reducer case in lib/store.tsx
- [x] T004 [P] Add updateSidebarPreferences action to store provider in lib/store.tsx
- [x] T005 [P] Add shadcn/ui Tabs component via `pnpm dlx shadcn@latest add tabs` to components/ui/tabs.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core sidebar container that orchestrates icon rail, panel, and data aggregation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create useClickOutside hook for panel close detection in lib/hooks.ts
- [x] T007 Create WorkingSidebar container component in app/components/working/WorkingSidebar.tsx
  - Manages isOpen and activeTab state
  - Aggregates deadlines from session contexts
  - Handles click-outside via useClickOutside
  - Passes data to child components
- [x] T008 Integrate WorkingSidebar into WorkingModeView in app/components/working/WorkingModeView.tsx
  - Add WorkingSidebar alongside main content
  - Pass session and sessionContexts props

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1+5 - View Urgent Events + Sidebar Interaction (Priority: P1) 🎯 MVP

**Goal**: Display icon rail with badges and urgency indicators; panel expands/collapses on click

**Combined Stories**: US1 (View Urgent Events) and US5 (Gmail-Style Interaction) are tightly coupled - the icon rail with badges IS the Gmail-style interaction pattern.

**Independent Test**: Enter working mode with configured deadlines/reminders. Verify icon rail shows counts and urgency dots. Click icon to expand panel. Click outside to collapse. Switch tabs. Verify no focus trap or background dimming.

### Implementation for User Stories 1+5

- [x] T009 [P] [US1] Create SidebarIconRail component in app/components/working/SidebarIconRail.tsx
  - Two icon buttons (Calendar, Bell) with count badges
  - Urgency indicator dots when items urgent
  - Click handlers for each icon
  - Props: datesCount, remindersCount, hasUrgentDates, hasImminentReminders, onDatesClick, onRemindersClick, activeTab
- [x] T010 [P] [US1] Create SidebarPanel component shell in app/components/working/SidebarPanel.tsx
  - Absolute positioned overlay (~320px width)
  - Tabs component with "Important Dates" and "Reminders" triggers
  - Empty TabsContent placeholders for each tab
  - Props: isOpen, activeTab, onTabChange, onClose, panelRef
- [x] T011 [US1] Add urgency detection logic to WorkingSidebar in app/components/working/WorkingSidebar.tsx
  - Calculate hasUrgentDates (any deadline within 24h or overdue using getDeadlineUrgency)
  - Calculate hasImminentReminders (any reminder within 15 minutes using getNextTriggerTime)
  - Add 60-second interval for real-time urgency updates
- [x] T012 [US1] Wire SidebarIconRail and SidebarPanel into WorkingSidebar in app/components/working/WorkingSidebar.tsx
  - Render both components
  - Connect state and callbacks
  - Add escape key handler to close panel

**Checkpoint**: Icon rail visible with badges. Panel expands/collapses. Tabs switch. Core interaction complete.

---

## Phase 4: User Story 2 - Manage Deadlines from Work Mode (Priority: P2)

**Goal**: Add and delete important dates directly from the sidebar panel

**Independent Test**: Open Important Dates tab. Click Add button. Fill form and submit. Verify deadline appears. Delete it and confirm removal.

### Implementation for User Story 2

- [x] T013 [P] [US2] Create ImportantDateItem component in app/components/working/ImportantDateItem.tsx
  - Display deadline label and countdown badge using CountdownBadge
  - Optional context name badge (when showContextBadge=true)
  - Delete button with AlertDialog confirmation
  - Props: date, contextName, contextColor, showContextBadge, onDelete
- [x] T014 [P] [US2] Create ImportantDateForm component in app/components/working/ImportantDateForm.tsx
  - Label input (required, max 100 chars)
  - Date input (required)
  - Submit and Cancel buttons
  - Validation with error display
  - Props: onSubmit, onCancel
- [x] T015 [US2] Create ImportantDatesTab component in app/components/working/ImportantDatesTab.tsx
  - List view showing ImportantDateItem for each deadline
  - Form view showing ImportantDateForm
  - Toggle between list and form views
  - Empty state message when no deadlines
  - Sort deadlines by urgency
  - Props: allDeadlines, activeContextId, scopeFilter, onScopeFilterChange, onAddDeadline, onDeleteDeadline
- [x] T016 [US2] Add addImportantDate and deleteImportantDate store actions in lib/store.tsx
  - addImportantDate(contextId, date): adds to specified context's importantDates array
  - deleteImportantDate(contextId, dateId): removes from context's importantDates array
- [x] T017 [US2] Wire ImportantDatesTab into SidebarPanel in app/components/working/SidebarPanel.tsx
  - Render ImportantDatesTab in dates TabsContent
  - Connect store actions for add/delete

**Checkpoint**: Can add deadlines to active context. Can delete deadlines. List shows countdown and sorts by urgency.

---

## Phase 5: User Story 3 - Manage Reminders from Work Mode (Priority: P2)

**Goal**: Add and delete reminders directly from the sidebar panel

**Independent Test**: Open Reminders tab. Click Add button. Create reminder using form. Verify it appears in list. Delete it and confirm removal.

### Implementation for User Story 3

- [x] T018 [US3] Create RemindersTab component in app/components/working/RemindersTab.tsx
  - List view showing existing ReminderListItem for each reminder
  - Add button that opens inline ReminderForm or modal
  - Empty state message when no reminders
  - Uses existing deleteReminder store action
  - Props: reminders, onDeleteReminder, onAddReminder
- [x] T019 [US3] Wire RemindersTab into SidebarPanel in app/components/working/SidebarPanel.tsx
  - Render RemindersTab in reminders TabsContent
  - Manage form open/close state
  - Connect store actions

**Checkpoint**: Can add reminders from sidebar. Can delete reminders. Reuses existing reminder components.

---

## Phase 6: User Story 6 - Filter Deadlines by Scope (Priority: P2)

**Goal**: Toggle between showing all session deadlines or only active context deadlines, with persistent preference

**Independent Test**: View deadlines from multiple contexts. Toggle to "Active context only". Verify only active context deadlines shown. Reload page. Verify toggle state persisted.

### Implementation for User Story 6

- [x] T020 [US6] Add scope filter toggle UI to ImportantDatesTab in app/components/working/ImportantDatesTab.tsx
  - Add toggle/switch component at top of tab
  - Labels: "All contexts" vs "Active context only"
  - Call onScopeFilterChange when toggled
- [x] T021 [US6] Implement scope filtering logic in WorkingSidebar in app/components/working/WorkingSidebar.tsx
  - Read scopeFilter from store.sidebarPreferences
  - Filter allDeadlines based on scopeFilter and activeContextId
  - Update badge count to reflect filtered deadlines
- [x] T022 [US6] Connect scope filter to store persistence in WorkingSidebar in app/components/working/WorkingSidebar.tsx
  - Call updateSidebarPreferences when scope filter changes
  - Preference persists to localStorage automatically via store

**Checkpoint**: Scope toggle filters deadline list. Preference persists across sessions. Badge count reflects filter.

---

## Phase 7: User Story 4 - Delete Tasks from Work Mode (Priority: P3)

**Goal**: Delete tasks directly from the working task list

**Independent Test**: View task in working task list. Click delete action. Confirm deletion. Verify task removed.

### Implementation for User Story 4

- [x] T023 [US4] Add delete action to WorkingTaskItem in app/components/working/WorkingTaskItem.tsx
  - Add delete button (Trash icon) in item actions
  - Add AlertDialog for delete confirmation
  - Call existing deleteTask store action on confirm
- [x] T024 [US4] Add deleteTask prop passing in WorkingTaskList in app/components/working/WorkingTaskList.tsx
  - Ensure deleteTask action is passed from store to items

**Checkpoint**: Tasks can be deleted from working mode with confirmation.

---

## Phase 8: User Story 7 - Responsive Sidebar Behavior (Priority: P3)

**Goal**: Sidebar adapts for mobile - icon rail hidden, header toggle reveals panel

**Independent Test**: Resize viewport to mobile. Verify icon rail hidden. Verify toggle button in header. Open panel. Tap outside to close.

### Implementation for User Story 7

- [x] T025 [US7] Add responsive classes to SidebarIconRail in app/components/working/SidebarIconRail.tsx
  - Hide on mobile: hidden lg:flex
- [x] T026 [US7] Add mobile toggle button to WorkingModeView header in app/components/working/WorkingModeView.tsx
  - Show on mobile only: lg:hidden
  - Icon button that opens sidebar panel
  - Pass mobile state to WorkingSidebar
- [x] T027 [US7] Convert mobile sidebar to Sheet component in app/components/working/WorkingSidebar.tsx
  - Use Sheet with side="right" on mobile
  - Keep absolute panel on desktop
  - Detect viewport with useMediaQuery or similar

**Checkpoint**: Icon rail visible on desktop, hidden on mobile. Mobile has header toggle. Panel works on both.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T028 [P] Add keyboard accessibility to SidebarIconRail in app/components/working/SidebarIconRail.tsx
  - Ensure icon buttons are keyboard navigable
  - Add aria-labels for screen readers
- [x] T029 [P] Add keyboard accessibility to SidebarPanel in app/components/working/SidebarPanel.tsx
  - Escape key closes panel (if not already)
  - Tab navigation works correctly
- [x] T030 Add empty state handling for edge cases in ImportantDatesTab and RemindersTab
  - "No deadlines - click Add to create one"
  - "No reminders configured"
  - Link to switch scope filter if active-context is empty
- [x] T031 Run manual testing per quickstart.md validation checklist
- [x] T032 Run `pnpm build` to verify no TypeScript errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1+5 (P1) → Core sidebar interaction (MVP)
  - US2 (P2) → Depends on US1+5 for panel structure
  - US3 (P2) → Depends on US1+5 for panel structure
  - US6 (P2) → Depends on US2 for ImportantDatesTab
  - US4 (P3) → Independent of sidebar (modifies WorkingTaskItem)
  - US7 (P3) → Depends on US1+5 for sidebar structure
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Setup (T001-T005)
    ↓
Foundational (T006-T008)
    ↓
    ├── US1+5: Sidebar Interaction (T009-T012) ← MVP
    │       ↓
    │   ├── US2: Manage Deadlines (T013-T017)
    │   │       ↓
    │   │   └── US6: Filter Scope (T020-T022)
    │   │
    │   └── US3: Manage Reminders (T018-T019)
    │
    └── US7: Responsive (T025-T027)

US4: Delete Tasks (T023-T024) ← Independent, can run in parallel with sidebar work
```

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003, T004, T005 can run in parallel

**Phase 3 (US1+5)**:
- T009, T010 can run in parallel (different files)

**Phase 4 (US2)**:
- T013, T014 can run in parallel (different files)

**Phase 7 (US4)**:
- Can run entirely in parallel with Phases 4-6

**Phase 9 (Polish)**:
- T028, T029 can run in parallel

---

## Parallel Example: User Story 1+5

```bash
# Launch both core components together:
Task: "Create SidebarIconRail component in app/components/working/SidebarIconRail.tsx"
Task: "Create SidebarPanel component shell in app/components/working/SidebarPanel.tsx"

# Then wire together:
Task: "Add urgency detection logic to WorkingSidebar"
Task: "Wire SidebarIconRail and SidebarPanel into WorkingSidebar"
```

---

## Parallel Example: User Story 2

```bash
# Launch both item components together:
Task: "Create ImportantDateItem component in app/components/working/ImportantDateItem.tsx"
Task: "Create ImportantDateForm component in app/components/working/ImportantDateForm.tsx"

# Then create tab and wire up:
Task: "Create ImportantDatesTab component"
Task: "Add store actions"
Task: "Wire into SidebarPanel"
```

---

## Implementation Strategy

### MVP First (User Stories 1+5 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T008)
3. Complete Phase 3: User Story 1+5 (T009-T012)
4. **STOP and VALIDATE**: Test sidebar interaction independently
5. Deploy/demo if ready - icon rail with badges, expandable panel with tabs

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1+5 → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Deadlines) → Test independently → Deploy/Demo
4. Add US3 (Reminders) → Test independently → Deploy/Demo
5. Add US6 (Scope Filter) → Test independently → Deploy/Demo
6. Add US4 (Task Delete) → Test independently → Deploy/Demo
7. Add US7 (Responsive) → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Single Developer Strategy

Recommended order for solo implementation:
1. Setup (T001-T005) - ~30 min
2. Foundational (T006-T008) - ~1 hour
3. US1+5: Core Interaction (T009-T012) - ~2 hours
4. US2: Deadline Management (T013-T017) - ~2 hours
5. US6: Scope Filter (T020-T022) - ~30 min
6. US3: Reminder Management (T018-T019) - ~1 hour
7. US4: Task Delete (T023-T024) - ~30 min
8. US7: Responsive (T025-T027) - ~1 hour
9. Polish (T028-T032) - ~1 hour

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- US1 and US5 are combined as they implement the same core interaction pattern
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All components use 'use client' directive (React client components)
- Follow existing patterns from ReminderForm, ReminderListItem for consistency
