# Tasks: Reminders & Notifications

**Input**: Design documents from `/specs/007-reminders-notifications/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No test framework configured - manual testing only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **App components**: `app/components/`
- **Lib utilities**: `lib/`
- **UI components**: `components/ui/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add new types, state management, and core utilities needed by all user stories

- [X] T001 Add Reminder types and interfaces to lib/types.ts (ReminderType, ReminderScope, ReminderConfig, Reminder, TriggeredNotification)
- [X] T002 Add UserLocation and PrayerTimesCache types to lib/types.ts
- [X] T003 Add ReminderTemplate type and REMINDER_TEMPLATES constant to lib/types.ts
- [X] T004 Extend AppState interface with reminders, userLocation, and notificationPermission fields in lib/types.ts
- [X] T005 Update INITIAL_STATE with new reminder fields in lib/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Add reminder actions to store reducer (ADD_REMINDER, UPDATE_REMINDER, DELETE_REMINDER, TOGGLE_REMINDER_ENABLED) in lib/store.tsx
- [X] T007 Add notification actions to store reducer (TRIGGER_NOTIFICATION, ACKNOWLEDGE_NOTIFICATION, SNOOZE_NOTIFICATION, DISMISS_NOTIFICATION) in lib/store.tsx
- [X] T008 Add SET_USER_LOCATION and SET_NOTIFICATION_PERMISSION actions to store reducer in lib/store.tsx
- [X] T009 Add reminder-related methods to StoreContextType interface and StoreProvider in lib/store.tsx
- [X] T010 [P] Create lib/reminders.ts with getNextTriggerTime function for interval reminders
- [X] T011 [P] Add browser Notification API support to lib/notifications.ts (requestPermission, showBrowserNotification)
- [X] T012 Create app/components/reminders/ directory structure
- [X] T013 Create ReminderModal component for triggered notifications in app/components/reminders/ReminderModal.tsx
- [X] T014 Add bell icon button to Header component in app/components/Header.tsx
- [X] T015 Create ReminderSheet component (sheet container opened by bell icon) in app/components/reminders/ReminderSheet.tsx
- [X] T016 Integrate ReminderModal into app/page.tsx as global provider

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Custom Interval Reminder (Priority: P1) 🎯 MVP

**Goal**: Users can create recurring interval reminders (e.g., every 30 minutes for stretch breaks)

**Independent Test**: Create a 1-minute interval reminder and verify notification appears after 1 minute

### Implementation for User Story 1

- [X] T017 [US1] Create ReminderForm component with interval type support in app/components/reminders/ReminderForm.tsx
- [X] T018 [US1] Implement interval duration input (1-1440 minutes) with validation in ReminderForm
- [X] T019 [US1] Create ReminderListItem component displaying title, interval, and enabled status in app/components/reminders/ReminderListItem.tsx
- [X] T020 [US1] Create ReminderList component rendering all reminders in app/components/reminders/ReminderList.tsx
- [X] T021 [US1] Implement reminder scheduler using setInterval (1-second tick) in lib/reminders.ts
- [X] T022 [US1] Add useReminderScheduler hook to manage scheduler lifecycle in lib/useReminderScheduler.ts
- [X] T023 [US1] Integrate useReminderScheduler into app/page.tsx or ClientProvider
- [X] T024 [US1] Implement notification queue for multiple simultaneous reminders in store
- [X] T025 [US1] Add acknowledge button handler in ReminderModal that resumes timer
- [X] T026 [US1] Add snooze button handler (5/10/15 min options) in ReminderModal
- [X] T027 [US1] Add dismiss button handler in ReminderModal

**Checkpoint**: User Story 1 complete - interval reminders work independently

---

## Phase 4: User Story 2 - Manage and Toggle Reminders (Priority: P1)

**Goal**: Users can view, enable, disable, edit, and delete reminders

**Independent Test**: Create a reminder, toggle it off, edit its interval, then delete it

### Implementation for User Story 2

- [X] T028 [US2] Add toggle enabled/disabled switch to ReminderListItem in app/components/reminders/ReminderListItem.tsx
- [X] T029 [US2] Add edit button to ReminderListItem that opens ReminderForm in edit mode
- [X] T030 [US2] Implement edit mode in ReminderForm (pre-populate fields, save updates) in app/components/reminders/ReminderForm.tsx
- [X] T031 [US2] Add delete button with confirmation to ReminderListItem
- [X] T032 [US2] Display next scheduled trigger time in ReminderListItem using getNextTriggerTime
- [X] T033 [US2] Ensure disabled reminders are skipped by scheduler in lib/reminders.ts
- [X] T034 [US2] Add empty state to ReminderList when no reminders exist

**Checkpoint**: User Stories 1 AND 2 complete - full CRUD for interval reminders

---

## Phase 5: User Story 3 - Prayer Times Reminder (Priority: P2)

**Goal**: Users can enable Islamic prayer time reminders that fetch times from Aladhan API

**Independent Test**: Enable prayer times, set location to "London, UK", verify notification at next prayer time

### Implementation for User Story 3

- [X] T035 [P] [US3] Create lib/prayerTimes.ts with Aladhan API fetch function
- [X] T036 [P] [US3] Implement prayer times caching in localStorage (7-day TTL) in lib/prayerTimes.ts
- [X] T037 [US3] Create LocationPicker component for city input and method selection in app/components/reminders/LocationPicker.tsx
- [X] T038 [US3] Add prayer reminder config type handling to ReminderForm in app/components/reminders/ReminderForm.tsx
- [X] T039 [US3] Implement getNextPrayerTrigger function in lib/prayerTimes.ts
- [X] T040 [US3] Integrate prayer times into scheduler (fetch/cache on enable, check daily) in lib/useReminderScheduler.ts
- [X] T041 [US3] Handle API errors with cached fallback and "outdated" indicator in lib/prayerTimes.ts
- [X] T042 [US3] Display prayer names (Fajr, Dhuhr, etc.) in notification title

**Checkpoint**: User Story 3 complete - prayer time reminders work independently

---

## Phase 6: User Story 4 - Fixed-Time Reminder (Priority: P2)

**Goal**: Users can create reminders at specific times of day with optional day-of-week filtering

**Independent Test**: Create a reminder for current time + 2 minutes, verify notification arrives

### Implementation for User Story 4

- [X] T043 [US4] Add fixed-time type option to ReminderForm in app/components/reminders/ReminderForm.tsx
- [X] T044 [US4] Implement time picker input (HH:MM) with validation in ReminderForm
- [X] T045 [US4] Implement day-of-week selection (checkboxes for Mon-Sun, or "Every day") in ReminderForm
- [X] T046 [US4] Create getNextFixedTimeTrigger function in lib/reminders.ts
- [X] T047 [US4] Integrate fixed-time into scheduler in lib/useReminderScheduler.ts
- [X] T048 [US4] Display scheduled time and days in ReminderListItem

**Checkpoint**: User Story 4 complete - fixed-time reminders work independently

---

## Phase 7: User Story 5 - Predefined Templates (Priority: P3)

**Goal**: Users can browse and enable predefined reminder templates (Water, 20-20-20, Pomodoro)

**Independent Test**: Browse templates, enable "20-20-20 Rule", verify notification every 20 minutes

### Implementation for User Story 5

- [X] T049 [US5] Create ReminderTemplates component with categorized template list in app/components/reminders/ReminderTemplates.tsx
- [X] T050 [US5] Implement template card UI showing name, description, icon, and category
- [X] T051 [US5] Add "Enable" button that creates Reminder from template with templateId reference
- [X] T052 [US5] Add "Browse Templates" button to ReminderSheet header
- [X] T053 [US5] Implement toggle between "My Reminders" and "Templates" views in ReminderSheet
- [X] T054 [US5] Allow editing template-created reminders while preserving original template

**Checkpoint**: User Story 5 complete - all reminder types available

---

## Phase 8: Timer Pause Integration

**Purpose**: Integrate reminder notifications with working mode timer pause (FR-017)

- [X] T055 Add isPausedByReminder flag to runtime state in lib/store.tsx
- [X] T056 Modify ContextTimer to pause when activeNotification is present in app/components/working/WorkingModeView.tsx
- [X] T057 Ensure timer resumes on acknowledge/dismiss but NOT on snooze
- [X] T058 Handle notification trigger during paused session (queue without pausing again)
- [X] T059 Add scope handling (session-only reminders pause with session) to scheduler

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T060 [P] Add notification permission request UI with explanation in ReminderSheet
- [X] T061 [P] Add visual indicator on bell icon when reminders are active
- [X] T062 [P] Add badge count for pending notifications on bell icon
- [X] T063 Implement in-app fallback when browser notifications denied
- [X] T064 Add sound/chime option for notifications (extend lib/notifications.ts)
- [X] T065 Add accessibility labels and keyboard navigation to all reminder components
- [X] T066 Run production build to verify no TypeScript errors
- [ ] T067 Manual testing: verify all acceptance scenarios from spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 and share components - recommended to do sequentially
  - US3 and US4 are both P2 and independent - can proceed in parallel
  - US5 is P3 and depends on US1/US2 components existing
- **Timer Pause (Phase 8)**: Depends on US1 being complete (needs working notifications)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - Core interval reminders
- **User Story 2 (P1)**: Depends on US1 components - Extends ReminderListItem and ReminderForm
- **User Story 3 (P2)**: Can start after US1 - Independent prayer times functionality
- **User Story 4 (P2)**: Can start after US1 - Independent fixed-time functionality
- **User Story 5 (P3)**: Depends on US1/US2 - Uses existing reminder infrastructure

### Within Each User Story

- Models/types before services
- Services before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T010, T011 (lib utilities) can run in parallel
- T035, T036 (prayer times lib) can run in parallel
- T060, T061, T062 (polish tasks) can run in parallel
- US3 and US4 can be worked on in parallel after US2 is complete

---

## Parallel Example: User Story 3

```bash
# Launch prayer times lib tasks in parallel:
Task: "Create lib/prayerTimes.ts with Aladhan API fetch function"
Task: "Implement prayer times caching in localStorage"

# Then sequentially:
Task: "Create LocationPicker component"
Task: "Integrate prayer times into scheduler"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (store, scheduler, modal)
3. Complete Phase 3: User Story 1 (create interval reminders)
4. Complete Phase 4: User Story 2 (manage reminders)
5. **STOP and VALIDATE**: Test creating, editing, toggling, deleting reminders
6. Deploy/demo if ready - basic reminders work!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 → MVP with interval reminders
3. Add US3 → Prayer times available
4. Add US4 → Fixed-time reminders available
5. Add US5 → Templates library available
6. Add Timer Pause → Full integration with working mode
7. Polish → Production ready

### Suggested MVP Scope

**MVP = Phases 1-4 (Setup + Foundational + US1 + US2)**

This delivers:
- Create interval reminders
- Modal notifications with acknowledge/snooze/dismiss
- Full CRUD (create, read, update, delete)
- Enable/disable toggle
- Persistence across sessions

**Post-MVP** (Phases 5-9):
- Prayer times integration
- Fixed-time reminders
- Predefined templates
- Timer pause integration
- Polish and accessibility

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No test framework - use manual testing per quickstart.md scenarios
