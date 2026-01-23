# Tasks: Cross-Device Data Synchronization

**Input**: Design documents from `/specs/010-cross-device-sync/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, this is a Next.js App Router project:
- **Components**: `app/components/`
- **Library**: `lib/`
- **Routes**: `app/`
- **UI Components**: `components/ui/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Supabase configuration

- [x] T001 Install Supabase dependencies: `pnpm add @supabase/supabase-js @supabase/ssr`
- [x] T002 [P] Create environment template in `.env.example` with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- [x] T003 [P] Create Supabase browser client in lib/supabase/client.ts
- [x] T004 [P] Create Supabase server client in lib/supabase/server.ts
- [x] T005 [P] Create Supabase middleware helper in lib/supabase/middleware.ts
- [x] T006 Create Next.js middleware in middleware.ts for session refresh

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type System Extensions

- [x] T007 [P] Add SyncMetadata interface to lib/types.ts (syncVersion, lastModifiedBy, deletedAt)
- [x] T008 [P] Add DeviceInfo interface to lib/types.ts (id, name, userAgent, lastSeenAt)
- [x] T009 [P] Add OutboxEntry interface to lib/types.ts (entityType, entityId, operation, payload, attempts)
- [x] T010 [P] Extend Context interface with sync metadata fields in lib/types.ts
- [x] T011 [P] Extend Task interface with sync metadata fields in lib/types.ts
- [x] T012 [P] Extend Session interface with sync metadata and ownership fields in lib/types.ts
- [x] T013 [P] Extend Reminder interface with sync metadata fields in lib/types.ts
- [x] T014 [P] Extend SessionPreset interface with sync metadata fields in lib/types.ts
- [x] T015 [P] Add UserPreferences interface to lib/types.ts

### ID Generation

- [x] T016 Update generateId() function in lib/storage.ts to use crypto.randomUUID()

### Device Management

- [x] T017 Create device registration module in lib/device.ts with getOrCreateDeviceId() and updateDeviceName()

### Supabase Provider Foundation

- [x] T018 Create Supabase DataProvider skeleton in lib/sync/supabaseProvider.ts implementing DataProvider interface

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Sign In and Access Data Across Devices (Priority: P1) 🎯 MVP

**Goal**: Users can sign in via magic link email and access their data from any device

**Independent Test**: Sign in on one device, create data, sign in on second device, verify data appears

### Implementation for User Story 1

#### Auth Infrastructure

- [x] T019 [P] [US1] Create AuthProvider context component in app/components/auth/AuthProvider.tsx with user/session state
- [x] T020 [P] [US1] Create auth callback route handler in app/auth/callback/route.ts for magic link verification
- [x] T021 [US1] Create SignInDialog component in app/components/auth/SignInDialog.tsx with email input and magic link request
- [x] T022 [US1] Create SignOutDialog component in app/components/auth/SignOutDialog.tsx with keep/clear data choice (FR-003)

#### Auth Integration

- [x] T023 [US1] Wrap app with AuthProvider in app/page.tsx
- [x] T024 [US1] Add sign-in/sign-out buttons to app header in app/page.tsx (conditionally rendered based on auth state)

#### Initial Data Fetch on Sign-In

- [x] T025 [US1] Implement fetchAllUserData() in lib/sync/supabaseProvider.ts to load all data on sign-in
- [x] T026 [US1] Integrate initial data fetch into AuthProvider on successful authentication

#### Sign-Out Data Handling

- [x] T027 [US1] Implement clearLocalData() function in lib/storage.ts for sign-out with clear option
- [x] T028 [US1] Connect SignOutDialog actions to auth sign-out and data clearing

**Checkpoint**: At this point, users can sign in, see their cloud data, and sign out with data choice

---

## Phase 4: User Story 2 - Real-Time Data Sync Between Devices (Priority: P1)

**Goal**: Changes made on one device appear on other devices within 2 seconds

**Independent Test**: Open app on two devices, make a change on one, observe it appearing on the other without refresh

### Implementation for User Story 2

#### Realtime Subscription Engine

- [x] T029 [P] [US2] Create SyncEngine class skeleton in lib/sync/SyncEngine.ts with connect/disconnect methods
- [x] T030 [US2] Implement createSyncSubscription() in lib/sync/SyncEngine.ts per contracts/realtime.md pattern
- [x] T031 [US2] Add postgres_changes listener for contexts table in lib/sync/SyncEngine.ts
- [x] T032 [US2] Add postgres_changes listener for tasks table in lib/sync/SyncEngine.ts
- [x] T033 [US2] Add postgres_changes listener for sessions table in lib/sync/SyncEngine.ts
- [x] T034 [US2] Add postgres_changes listener for reminders table in lib/sync/SyncEngine.ts
- [x] T035 [US2] Add postgres_changes listener for session_presets table in lib/sync/SyncEngine.ts
- [x] T036 [US2] Add postgres_changes listener for user_preferences table in lib/sync/SyncEngine.ts

#### Sync Dispatch to Store

- [x] T037 [US2] Add SYNC_INSERT, SYNC_UPDATE, SYNC_DELETE action types to lib/store.tsx reducer
- [x] T038 [US2] Implement handleRealtimeChange() dispatcher in lib/sync/SyncEngine.ts to map payloads to store actions

#### Upload Changes to Supabase

- [x] T039 [US2] Implement upsertContext() in lib/sync/supabaseProvider.ts
- [x] T040 [US2] Implement upsertTask() in lib/sync/supabaseProvider.ts
- [x] T041 [US2] Implement upsertSession() in lib/sync/supabaseProvider.ts
- [x] T042 [US2] Implement upsertReminder() in lib/sync/supabaseProvider.ts
- [x] T043 [US2] Implement upsertSessionPreset() in lib/sync/supabaseProvider.ts
- [x] T044 [US2] Implement upsertUserPreferences() in lib/sync/supabaseProvider.ts
- [x] T045 [US2] Implement softDelete() method in lib/sync/supabaseProvider.ts for tombstone deletion

#### Store Integration

- [x] T046 [US2] Connect SyncEngine to app via useSyncEngine hook in lib/sync/SyncEngine.ts
- [x] T047 [US2] Integrate SyncEngine initialization in app/components/auth/AuthProvider.tsx (start on sign-in)
- [ ] T048 [US2] Update store dispatch functions to call supabaseProvider methods when authenticated

**Checkpoint**: At this point, changes sync in real-time across devices

---

## Phase 5: User Story 3 - Offline Work with Automatic Sync (Priority: P1)

**Goal**: Users can work offline and changes automatically sync when reconnected

**Independent Test**: Enable airplane mode, make changes, reconnect, verify all changes synced

### Implementation for User Story 3

#### Outbox Queue

- [x] T049 [P] [US3] Create outbox module in lib/sync/outbox.ts with OutboxEntry storage in localStorage
- [x] T050 [US3] Implement addToOutbox() function in lib/sync/outbox.ts
- [x] T051 [US3] Implement getOutboxEntries() function in lib/sync/outbox.ts
- [x] T052 [US3] Implement removeFromOutbox() function in lib/sync/outbox.ts
- [x] T053 [US3] Implement persistOutbox() to survive app restarts in lib/sync/outbox.ts

#### Network Detection

- [x] T054 [US3] Create useNetworkStatus hook in lib/sync/SyncEngine.ts using navigator.onLine and online/offline events
- [x] T055 [US3] Integrate network status into SyncEngine to pause/resume sync operations

#### Offline-First Write Path

- [ ] T056 [US3] Update store dispatch to write to outbox when offline in lib/store.tsx
- [x] T057 [US3] Implement flushOutbox() in lib/sync/SyncEngine.ts to sync queued changes on reconnect
- [ ] T058 [US3] Add automatic outbox flush on network reconnection in lib/sync/SyncEngine.ts

#### Storage Quota Warning

- [x] T059 [US3] Implement checkStorageHealth() in lib/sync/outbox.ts per research.md patterns
- [x] T060 [US3] Add storage warning toast when quota exceeds 75% threshold in lib/sync/outbox.ts

**Checkpoint**: At this point, offline work syncs automatically on reconnection

---

## Phase 6: User Story 4 - Active Timer Session Handoff Between Devices (Priority: P2)

**Goal**: Users can start a timer on one device and continue it on another device seamlessly

**Independent Test**: Start timer on Device A, suspend it, resume on Device B, verify timer state preserved

### Implementation for User Story 4

#### Ownership Tracking

- [ ] T061 [P] [US4] Add activeDeviceId and ownershipClaimedAt fields to Session display in relevant components
- [ ] T062 [US4] Implement claimSessionOwnership() in lib/sync/supabaseProvider.ts
- [ ] T063 [US4] Implement releaseSessionOwnership() in lib/sync/supabaseProvider.ts
- [ ] T064 [US4] Implement isSessionOwnedByOtherDevice() check in lib/sync/supabaseProvider.ts

#### UI for Ownership

- [ ] T065 [US4] Add "active on another device" indicator to session display in app/components/WorkingMode.tsx
- [ ] T066 [US4] Prevent timer start when session owned by another device in app/components/WorkingMode.tsx
- [ ] T067 [US4] Update suspend action to release ownership in app/components/WorkingMode.tsx

#### Ownership Auto-Release (30 min timeout)

- [ ] T068 [US4] Implement periodic ownership heartbeat (update ownershipClaimedAt) in lib/sync/SyncEngine.ts
- [ ] T069 [US4] Add client-side check for stale ownership before claiming in lib/sync/supabaseProvider.ts

**Checkpoint**: At this point, session handoff works between devices

---

## Phase 7: User Story 5 - Conflict Resolution for Simultaneous Edits (Priority: P2)

**Goal**: Simultaneous edits are resolved predictably using last-write-wins

**Independent Test**: Edit same task on two offline devices, reconnect both, verify most recent change wins

### Implementation for User Story 5

#### LWW Conflict Resolution

- [x] T070 [P] [US5] Create conflict resolution module in lib/sync/conflicts.ts
- [x] T071 [US5] Implement resolveLWW() function in lib/sync/conflicts.ts comparing updatedAt timestamps
- [x] T072 [US5] Implement resolveSessionConflict() in lib/sync/conflicts.ts preserving max usedMinutes per context (FR-015)

#### Integration with Sync

- [ ] T073 [US5] Integrate conflict resolution into SyncEngine handleRealtimeChange() in lib/sync/SyncEngine.ts
- [ ] T074 [US5] Integrate conflict resolution into outbox flush in lib/sync/SyncEngine.ts
- [x] T075 [US5] Handle delete-vs-edit conflicts per FR-016 in lib/sync/conflicts.ts

**Checkpoint**: At this point, conflicts resolve predictably without data loss

---

## Phase 8: User Story 6 - Initial Data Migration to Cloud (Priority: P3)

**Goal**: Existing local data is migrated to cloud on first sign-in

**Independent Test**: Use app locally, accumulate data, sign in for first time, verify all data appears in cloud

### Implementation for User Story 6

#### ID Migration

- [x] T076 [P] [US6] Create migration module in lib/sync/migration.ts
- [x] T077 [US6] Implement generateIdMapping() to create oldId → newId map in lib/sync/migration.ts
- [x] T078 [US6] Implement remapEntityIds() to update all foreign key references in lib/sync/migration.ts
- [x] T079 [US6] Implement migrateLocalDataToCloud() orchestrator function in lib/sync/migration.ts

#### Migration Progress UI

- [x] T080 [US6] Create MigrationProgress component in app/components/sync/MigrationProgress.tsx
- [x] T081 [US6] Add migration state tracking (pending, in-progress, complete, error) in lib/sync/migration.ts
- [ ] T082 [US6] Display MigrationProgress during first sign-in in app/components/auth/AuthProvider.tsx

#### Migration Trigger

- [x] T083 [US6] Detect first-time sign-in (cloud account has no data) in lib/sync/supabaseProvider.ts
- [ ] T084 [US6] Trigger migration automatically on first sign-in in app/components/auth/AuthProvider.tsx

**Checkpoint**: At this point, existing users can migrate their data to cloud

---

## Phase 9: User Story 7 - Sync Status Visibility (Priority: P3)

**Goal**: Users can see current sync status at a glance

**Independent Test**: Observe sync indicator during normal operation, offline mode, and after reconnection

### Implementation for User Story 7

#### Sync Status State

- [x] T085 [P] [US7] Add SyncStatus type ('synced' | 'syncing' | 'offline' | 'error') to lib/types.ts
- [x] T086 [US7] Add syncStatus and pendingCount state to SyncEngine in lib/sync/SyncEngine.ts
- [x] T087 [US7] Expose sync status via useSyncStatus hook in lib/sync/SyncEngine.ts

#### Status Indicator UI

- [x] T088 [US7] Create SyncStatusIndicator component in app/components/sync/SyncStatusIndicator.tsx
- [x] T089 [US7] Display pending count when syncing in app/components/sync/SyncStatusIndicator.tsx
- [x] T090 [US7] Add retry button when status is error in app/components/sync/SyncStatusIndicator.tsx

#### Integration

- [x] T091 [US7] Add SyncStatusIndicator to app header in app/page.tsx (visible when signed in)
- [ ] T092 [US7] Update SyncEngine to track pending outbox count in lib/sync/SyncEngine.ts

**Checkpoint**: At this point, users can see sync status at a glance

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T093 [P] Add sync section to DataManagement dialog in app/components/settings/DataManagement.tsx
- [ ] T094 [P] Add device name display/edit in settings in app/components/settings/DataManagement.tsx
- [x] T095 Update CLAUDE.md with new technology entries for Supabase
- [x] T096 Verify production build succeeds with `pnpm build`
- [ ] T097 Run quickstart.md validation: test magic link flow end-to-end
- [ ] T098 Run quickstart.md validation: test real-time sync between two browser tabs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 (Auth) should complete first as other stories depend on authenticated state
  - US2 (Realtime Sync) and US3 (Offline) can proceed after US1
  - US4 (Session Handoff) depends on US2 for realtime updates
  - US5 (Conflict Resolution) can proceed after US2
  - US6 (Migration) depends on US1 for auth and US2 for data upload
  - US7 (Status) depends on US2 and US3 for status tracking
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

```
US1 (Auth) ────────────┬──────────► US6 (Migration)
                       │
                       ├──► US2 (Realtime) ──┬──► US4 (Session Handoff)
                       │                     │
                       │                     ├──► US5 (Conflict Resolution)
                       │                     │
                       └──► US3 (Offline) ───┴──► US7 (Status)
```

### Parallel Opportunities

**Within Phase 1 (Setup):**
- T002, T003, T004, T005 can all run in parallel

**Within Phase 2 (Foundational):**
- T007-T015 (type extensions) can all run in parallel

**Within User Stories:**
- Tasks marked [P] can run in parallel within that story

**Across User Stories:**
- After US1 completes: US2 and US3 can run in parallel
- After US2 completes: US4 and US5 can run in parallel

---

## Parallel Example: Phase 2 Foundational Types

```bash
# Launch all type extensions together:
Task: "Add SyncMetadata interface to lib/types.ts"
Task: "Add DeviceInfo interface to lib/types.ts"
Task: "Add OutboxEntry interface to lib/types.ts"
Task: "Extend Context interface with sync metadata fields"
Task: "Extend Task interface with sync metadata fields"
Task: "Extend Session interface with sync metadata and ownership fields"
Task: "Extend Reminder interface with sync metadata fields"
Task: "Extend SessionPreset interface with sync metadata fields"
Task: "Add UserPreferences interface to lib/types.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Auth)
4. **STOP and VALIDATE**: Test sign-in/sign-out flow independently
5. Deploy/demo if ready

### Recommended Order (Full Feature)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Auth) → Test sign-in → MVP!
3. Add User Story 2 (Realtime Sync) → Test two-device sync
4. Add User Story 3 (Offline) → Test offline/reconnect
5. Add User Story 4 (Session Handoff) → Test timer handoff
6. Add User Story 5 (Conflict Resolution) → Test conflict scenarios
7. Add User Story 6 (Migration) → Test existing user migration
8. Add User Story 7 (Status) → Test status indicator
9. Complete Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Database schema must be deployed to Supabase before Phase 3 starts (see quickstart.md)
