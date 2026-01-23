# Feature Specification: Cross-Device Data Synchronization

**Feature Branch**: `010-cross-device-sync`
**Created**: 2026-01-21
**Status**: Draft
**Input**: Implement real-time cross-device synchronization for vibe-schedule with offline-first architecture

## Clarifications

### Session 2026-01-21

- Q: How long do authentication sessions remain valid before requiring re-authentication? → A: 30-day inactivity timeout, otherwise persistent until explicit sign-out
- Q: Can users continue using the app without signing in (local-only mode)? → A: Yes, local-only mode available; sync features require sign-in
- Q: What happens to local data when a user signs out? → A: Prompt user to choose: keep or clear local data
- Q: Should there be a limit on offline queued changes? → A: No limit; warn user when device storage is low
- Q: How long before session ownership auto-releases for other devices? → A: 30 minutes of inactivity

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In and Access Data Across Devices (Priority: P1)

A user opens vibe-schedule on their work laptop and signs in using their email address. They can now access all their contexts, tasks, sessions, and settings from any device where they sign in with the same account.

**Why this priority**: User authentication is the foundation for all sync functionality. Without identifying users, data cannot be associated with accounts or synced across devices.

**Independent Test**: Can be fully tested by signing in on one device, creating data, then signing in on a second device and verifying the data appears. Delivers secure, personalized access to user's data.

**Acceptance Scenarios**:

1. **Given** a user with no account, **When** they enter their email address and request sign-in, **Then** they receive a magic link email to complete authentication
2. **Given** a user clicks the magic link, **When** authentication completes, **Then** they are signed in and their local data is associated with their account
3. **Given** a signed-in user on Device A, **When** they sign in on Device B with the same account, **Then** they see all their existing data on Device B
4. **Given** a signed-in user, **When** they sign out, **Then** they are prompted to keep or clear local data, and their cloud data remains accessible upon next sign-in

---

### User Story 2 - Real-Time Data Sync Between Devices (Priority: P1)

A user edits a task description on their phone while their laptop is also open. The change appears on the laptop within seconds without manual refresh.

**Why this priority**: Real-time sync is the core value proposition. Users expect changes to propagate immediately across devices for a seamless experience.

**Independent Test**: Open the app on two devices, make a change on one, observe it appearing on the other within seconds without refreshing.

**Acceptance Scenarios**:

1. **Given** a user signed in on two devices, **When** they create a new context on Device A, **Then** the context appears on Device B within 2 seconds
2. **Given** a user signed in on two devices, **When** they edit a task on Device A, **Then** the updated task appears on Device B within 2 seconds
3. **Given** a user signed in on two devices, **When** they delete a reminder on Device A, **Then** the reminder disappears from Device B within 2 seconds
4. **Given** a user signed in on two devices, **When** they update preferences on Device A, **Then** the preferences are reflected on Device B within 2 seconds

---

### User Story 3 - Offline Work with Automatic Sync (Priority: P1)

A user makes changes while on an airplane without internet. When they reconnect, all changes automatically sync without data loss.

**Why this priority**: Offline-first is essential for a productivity app. Users must never lose work due to network issues, and the sync should be invisible when connectivity returns.

**Independent Test**: Put device in airplane mode, make several changes, reconnect, verify all changes synced without user intervention.

**Acceptance Scenarios**:

1. **Given** a signed-in user without internet, **When** they create, edit, or delete data, **Then** changes are saved locally and queued for sync
2. **Given** a user with pending offline changes, **When** internet connectivity returns, **Then** all queued changes automatically sync to the server
3. **Given** a user reconnects after offline changes, **When** sync completes, **Then** they see a confirmation indicator that sync succeeded
4. **Given** offline changes exist, **When** the user closes and reopens the app while still offline, **Then** the offline changes persist and remain queued

---

### User Story 4 - Active Timer Session Handoff Between Devices (Priority: P2)

A user starts a work session timer on their desktop. They need to leave, so they suspend the session and continue it on their phone seamlessly.

**Why this priority**: Session handoff is unique to this app's timer functionality. While slightly more complex, it's critical for users who work across multiple devices throughout the day.

**Independent Test**: Start a timer on Device A, suspend it, claim and resume it on Device B, verify timer state is preserved.

**Acceptance Scenarios**:

1. **Given** an active session on Device A, **When** the user suspends it, **Then** the session ownership is released and other devices can claim it
2. **Given** a suspended session available for handoff, **When** the user resumes it on Device B, **Then** Device B claims ownership and the timer continues from where it left off
3. **Given** a session is active on Device A, **When** Device B attempts to activate the same session, **Then** Device B is informed that another device is currently using the session
4. **Given** multiple devices showing the same session, **When** the session is active, **Then** only the owning device shows the timer as running; other devices show it as active elsewhere

---

### User Story 5 - Conflict Resolution for Simultaneous Edits (Priority: P2)

Two family members share an account (or the same user edits on two devices while offline). When both make conflicting changes to the same item, the system resolves it predictably without losing recent work.

**Why this priority**: Conflict resolution ensures data integrity. While conflicts should be rare, handling them gracefully prevents user frustration and data loss.

**Independent Test**: Edit the same task on two offline devices with different values, reconnect both, verify the most recent change wins.

**Acceptance Scenarios**:

1. **Given** the same task is edited on two offline devices, **When** both reconnect, **Then** the edit with the most recent timestamp is preserved
2. **Given** a conflict occurs, **When** the losing edit's device syncs, **Then** it receives the winning version silently (no disruptive notifications)
3. **Given** a session's timer data conflicts, **When** resolving, **Then** the system preserves the maximum time spent per context to avoid losing tracked work
4. **Given** an entity is deleted on one device and edited on another, **When** syncing, **Then** the more recent action (delete or edit) takes precedence

---

### User Story 6 - Initial Data Migration to Cloud (Priority: P3)

An existing user with local data signs in for the first time. Their existing contexts, tasks, sessions, reminders, and settings are migrated to the cloud without losing anything.

**Why this priority**: Migration enables adoption by existing users. Without it, users would have to start fresh, which is unacceptable for a productivity tool.

**Independent Test**: Use the app locally, accumulate data, sign in for the first time, verify all local data is now synced to the cloud.

**Acceptance Scenarios**:

1. **Given** a user with existing local data, **When** they sign in for the first time, **Then** all local data is uploaded to their cloud account
2. **Given** local data has old-style IDs, **When** migration occurs, **Then** IDs are updated to globally unique format while preserving all relationships
3. **Given** migration is in progress, **When** the user views the app, **Then** they see a progress indicator showing migration status
4. **Given** migration completes, **When** the user checks their data, **Then** all contexts, tasks, sessions, reminders, presets, and preferences are intact

---

### User Story 7 - Sync Status Visibility (Priority: P3)

A user wants to know if their data is up-to-date, syncing, or if there's a problem. They can see a clear indicator of sync status at a glance.

**Why this priority**: Transparency builds trust. Users need to know when sync is working, pending, or failing to make informed decisions about their workflow.

**Independent Test**: Observe sync status indicator during normal operation, offline mode, and after reconnection.

**Acceptance Scenarios**:

1. **Given** the app is connected and synced, **When** the user checks the sync indicator, **Then** they see a "synced" status
2. **Given** changes are pending upload, **When** the user checks the sync indicator, **Then** they see a "syncing" status with pending count
3. **Given** the app is offline, **When** the user checks the sync indicator, **Then** they see an "offline" status
4. **Given** sync fails repeatedly, **When** the user checks the sync indicator, **Then** they see an error status with option to retry

---

### Edge Cases

- What happens when a user signs in on a new device while another device is offline with pending changes? (Both changes sync when the offline device reconnects; conflicts resolved by timestamp)
- How does the system handle very large data sets during initial migration? (Migration progresses incrementally with status updates; partial failures can be retried)
- What happens if a session ownership claim times out? (Ownership automatically releases after 30 minutes of inactivity, allowing other devices to claim)
- How does the system handle network interruptions during sync? (Queued changes persist locally; retry logic resumes sync when connectivity returns)
- What happens if a user deletes their account? (All cloud data is permanently deleted; local data remains but is no longer synced)
- How does the system handle simultaneous sign-ins on more than two devices? (All devices can sync data; session ownership limited to one device at a time)

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication
- **FR-001**: System MUST allow users to sign in using passwordless email authentication (magic link)
- **FR-002**: System MUST maintain user session across browser refreshes until explicit sign-out or 30 days of inactivity
- **FR-003**: System MUST allow users to sign out and prompt them to keep or clear local data from that device
- **FR-004**: System MUST isolate user data so users can only access their own data
- **FR-004a**: System MUST allow full app functionality in local-only mode without requiring sign-in; sync features activate only after authentication

#### Data Synchronization
- **FR-005**: System MUST sync all user data types: contexts, tasks, sessions, reminders, session presets, and preferences
- **FR-006**: System MUST propagate changes to all connected devices within 2 seconds under normal network conditions
- **FR-007**: System MUST use globally unique identifiers for all entities to prevent ID collisions across devices
- **FR-008**: System MUST track sync version numbers for conflict detection
- **FR-009**: System MUST support soft deletion (tombstones) to properly sync deletions across devices

#### Offline Support
- **FR-010**: System MUST allow full app functionality when offline
- **FR-011**: System MUST queue all changes made offline for later synchronization
- **FR-012**: System MUST persist offline change queue across app restarts
- **FR-013**: System MUST automatically sync queued changes when connectivity returns
- **FR-013a**: System MUST warn users when device storage is running low due to queued offline changes

#### Conflict Resolution
- **FR-014**: System MUST resolve conflicts using last-write-wins based on modification timestamp for contexts, tasks, reminders, presets, and preferences
- **FR-015**: System MUST preserve maximum time values when reconciling session timer conflicts (to prevent losing tracked work)
- **FR-016**: System MUST apply deletion over edit when deletion is more recent; apply edit over deletion when edit is more recent

#### Session Ownership
- **FR-017**: System MUST enforce single-device ownership for active timer sessions
- **FR-018**: System MUST allow a device to claim session ownership when no other device holds it
- **FR-019**: System MUST release session ownership when the owning device suspends the session
- **FR-019a**: System MUST automatically release session ownership after 30 minutes of inactivity on the owning device
- **FR-020**: System MUST display which device currently owns an active session on all devices viewing that session
- **FR-021**: System MUST prevent a device from starting a timer on a session owned by another device

#### Data Migration
- **FR-022**: System MUST migrate existing local data to the cloud on first sign-in
- **FR-023**: System MUST remap old-style IDs to globally unique IDs during migration
- **FR-024**: System MUST preserve all entity relationships during ID remapping
- **FR-025**: System MUST show migration progress during initial data upload

#### Status Indicators
- **FR-026**: System MUST display current sync status (synced, syncing, offline, error)
- **FR-027**: System MUST display count of pending changes when syncing
- **FR-028**: System MUST provide manual retry option when sync errors occur

### Key Entities

- **User Account**: Represents an authenticated user; associated with all user data via user ID
- **Device**: Represents a registered device; has unique ID, optional name, and last-seen timestamp; used to track sync state and session ownership
- **Sync Metadata**: Attached to all syncable entities; includes server-assigned version number, last-modifying device ID, and soft-delete flag
- **Outbox Entry**: Queued local change awaiting sync; includes entity type, operation (create/update/delete), payload, and creation timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Changes made on one device appear on other signed-in devices within 2 seconds under normal network conditions
- **SC-002**: Users can work completely offline for any duration with zero data loss when reconnecting
- **SC-003**: 100% of existing local data is preserved during cloud migration without manual intervention
- **SC-004**: Session timer handoff between devices completes within 3 seconds with no lost time tracking
- **SC-005**: Conflict resolution preserves the most recent change 100% of the time for standard entities
- **SC-006**: Users can determine current sync status within 1 second of looking at the app
- **SC-007**: System supports users signing in on 5+ devices simultaneously without degradation
- **SC-008**: Offline changes queue persists through app restarts and syncs successfully upon reconnection

## Assumptions

- Users have a valid email address for authentication
- Internet connectivity is intermittent but eventually available (not permanently offline deployments)
- Clock skew between devices is minimal (within a few seconds); significant skew could affect conflict resolution
- Users understand that only one device can actively run a timer at a time
- Browser supports localStorage and modern JavaScript APIs (crypto.randomUUID)
