# Feature Specification: Reminders & Notifications

**Feature Branch**: `007-reminders-notifications`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "I want to add a feature of 'reminders' that work like notifications: users can define notifications that get triggered at a certain interval, or use predefined ones (like prayer times pulled from https://aladhan.com/prayer-times-api, or regular 30mins interval reminders to do some exercises)"

## Clarifications

### Session 2026-01-19

- Q: Should the context timer pause automatically when a reminder notification appears? → A: Timer pauses automatically on reminder; resumes only when user acknowledges or dismisses (snooze keeps timer paused)
- Q: Where should users access the reminders management screen? → A: Header icon (bell) accessible in both definition and working modes
- Q: How should triggered reminder notifications appear in the app? → A: Modal/dialog overlay that requires interaction (acknowledge/snooze/dismiss) before continuing

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Custom Interval Reminder (Priority: P1)

As a user, I want to create a recurring reminder that notifies me at a fixed interval (e.g., every 30 minutes) so that I can be prompted to take breaks, stretch, or perform regular activities during my work sessions.

**Why this priority**: This is the core functionality that enables personalized productivity habits. Interval reminders are universally applicable to all users regardless of their specific needs.

**Independent Test**: Can be fully tested by creating a 5-minute interval reminder and verifying notifications appear at the expected times. Delivers immediate value for break reminders, hydration, posture checks, etc.

**Acceptance Scenarios**:

1. **Given** I am on the reminders management screen, **When** I create a new reminder with title "Stretch break" and interval "30 minutes", **Then** the reminder is saved and appears in my reminders list with a visual indicator showing the interval
2. **Given** I have an active 30-minute interval reminder, **When** 30 minutes have passed since the last notification, **Then** I receive a notification with the reminder title and can acknowledge or snooze it
3. **Given** I have multiple interval reminders active, **When** two reminders are scheduled at the same time, **Then** both notifications are delivered without one being lost

---

### User Story 2 - Manage and Toggle Reminders (Priority: P1)

As a user, I want to view, enable, disable, edit, and delete my reminders so that I have full control over which reminders are active at any given time.

**Why this priority**: Essential for usability - without management capabilities, users cannot adjust reminders to fit changing schedules or correct mistakes.

**Independent Test**: Can be tested by creating a reminder, then toggling it off, editing its interval, and finally deleting it. Each operation should persist correctly.

**Acceptance Scenarios**:

1. **Given** I have created 3 reminders, **When** I view the reminders list, **Then** I see all 3 reminders with their titles, types (interval/scheduled), and enabled/disabled status
2. **Given** I have an enabled reminder, **When** I toggle it to disabled, **Then** the reminder stops triggering notifications until I re-enable it
3. **Given** I have an interval reminder set to 30 minutes, **When** I edit it to 45 minutes, **Then** the next notification uses the updated interval
4. **Given** I want to remove a reminder, **When** I delete it, **Then** it is permanently removed from my reminders list

---

### User Story 3 - Use Predefined Prayer Times Reminder (Priority: P2)

As a Muslim user, I want to enable predefined prayer time reminders that automatically calculate and notify me of the five daily prayer times based on my location, so that I never miss a prayer during my work sessions.

**Why this priority**: Prayer times is a highly valuable predefined template that serves a significant user base with complex time calculations that would be difficult for users to configure manually.

**Independent Test**: Can be tested by enabling prayer times, setting a location, and verifying notifications appear at the correct calculated prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha).

**Acceptance Scenarios**:

1. **Given** I am on the predefined reminders screen, **When** I enable the "Islamic Prayer Times" template, **Then** I am prompted to provide my location (city or coordinates)
2. **Given** I have enabled prayer times with my location set, **When** a prayer time arrives (e.g., Dhuhr at 12:15 PM), **Then** I receive a notification indicating the prayer name and time
3. **Given** the prayer times have changed due to seasonal variation, **When** a new day begins, **Then** the prayer times are recalculated automatically for that day

---

### User Story 4 - Create Fixed-Time Reminder (Priority: P2)

As a user, I want to create a reminder that triggers at specific times of day (e.g., 9:00 AM, 2:00 PM) so that I can be reminded of daily routines like taking medication or attending meetings.

**Why this priority**: Complements interval reminders by supporting users with fixed daily schedules. Important for medication reminders and daily standup meetings.

**Independent Test**: Can be tested by creating a reminder for a time 2 minutes from now and verifying the notification arrives at the specified time.

**Acceptance Scenarios**:

1. **Given** I am creating a new reminder, **When** I select "Fixed time" type and set time to "9:00 AM" daily, **Then** I receive a notification every day at 9:00 AM
2. **Given** I have a fixed-time reminder for 2:00 PM, **When** it is 2:00 PM and my device is idle, **Then** the notification still appears
3. **Given** I want a reminder only on weekdays, **When** I configure the reminder with "Weekdays only" option, **Then** the reminder does not trigger on Saturday or Sunday

---

### User Story 5 - Browse and Enable Predefined Templates (Priority: P3)

As a user, I want to browse a library of predefined reminder templates (e.g., Pomodoro breaks, hourly water reminder, eye strain prevention 20-20-20 rule) so that I can quickly enable common productivity reminders without manual configuration.

**Why this priority**: Improves onboarding experience and provides value with minimal user effort. Templates showcase the feature's potential and serve as examples for custom reminders.

**Independent Test**: Can be tested by browsing the templates library, selecting "20-20-20 Rule", enabling it, and verifying notifications appear every 20 minutes.

**Acceptance Scenarios**:

1. **Given** I am on the reminders screen, **When** I tap "Browse Templates", **Then** I see a categorized list of predefined reminders (Health, Productivity, Religious)
2. **Given** I am viewing the templates library, **When** I tap on "Hourly Water Reminder", **Then** I see a description of the reminder and can enable it with one tap
3. **Given** I have enabled a template, **When** I want to customize it, **Then** I can edit the template's interval or message while keeping the original template available

---

### Edge Cases

- What happens when the app is closed or the browser tab is in the background?
  - Notifications should still be delivered via browser Notification API if permission was granted, or queued and shown when app regains focus
- How does the system handle time zone changes (e.g., user travels)?
  - Fixed-time reminders should adjust to the device's current time zone; prayer times should recalculate based on new location if GPS is enabled or user updates location
- What happens if the user denies notification permissions?
  - The app should show in-app alerts for reminders and prompt user to enable notifications with explanation of benefits
- How are reminders handled when a session ends or is paused?
  - Reminders configured as "session only" should pause with the session; global reminders continue regardless of session state
- What happens when the user's device clock is significantly off?
  - Fixed-time reminders use device time; the app does not attempt to correct for clock drift
- What happens if the Aladhan API is unavailable?
  - The app should cache the last successful prayer times for up to 7 days and display a notice that times may be outdated
- What happens to the context timer when a reminder fires during an active session?
  - The timer pauses automatically; it resumes only when the user acknowledges or dismisses the reminder. Snoozing keeps the timer paused until the snoozed reminder is finally acknowledged or dismissed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create custom interval reminders with configurable duration (minimum 1 minute, maximum 24 hours)
- **FR-002**: System MUST allow users to create fixed-time reminders for specific times of day with optional day-of-week filtering
- **FR-003**: System MUST provide predefined reminder templates including:
  - Islamic Prayer Times (requires location)
  - 20-20-20 Eye Rest Rule (every 20 minutes)
  - Hourly Water Reminder
  - Pomodoro Break (25 minutes work, 5 minutes break)
- **FR-004**: System MUST fetch Islamic prayer times from the Aladhan API based on user-provided location
- **FR-005**: System MUST persist all reminder configurations in local storage
- **FR-006**: Users MUST be able to enable, disable, edit, and delete any reminder
- **FR-007**: System MUST deliver notifications via the browser Notification API when permission is granted
- **FR-008**: System MUST provide in-app notification display as fallback when browser notifications are denied or unavailable
- **FR-009**: System MUST allow users to snooze a triggered reminder for a configurable duration (default options: 5, 10, 15 minutes)
- **FR-010**: System MUST allow users to acknowledge/dismiss a triggered reminder
- **FR-011**: System MUST support reminders scoped to "session only" (pause when session ends) or "always active" (independent of session state)
- **FR-012**: System MUST request notification permission from the user with clear explanation of why it's needed
- **FR-013**: System MUST display the next scheduled time for each reminder in the reminders list
- **FR-014**: System MUST categorize predefined templates (Health, Productivity, Religious) for easy browsing
- **FR-015**: System MUST handle multiple simultaneous reminders without losing any notifications
- **FR-016**: System MUST cache prayer times locally and function offline for up to 7 days using cached data
- **FR-017**: System MUST pause the active context timer when a reminder fires during an active session; timer resumes only when user acknowledges or dismisses the reminder (snooze keeps timer paused)
- **FR-018**: System MUST provide access to reminders management via a header icon (bell) visible in both definition and working modes
- **FR-019**: System MUST display triggered reminders as a modal/dialog overlay requiring user interaction (acknowledge, snooze, or dismiss) before the user can continue

### Key Entities

- **Reminder**: A user-configured or template-based notification trigger. Key attributes: id, title, message, type (interval/fixed-time/prayer), enabled status, scope (session-only/always), configuration (interval duration or time of day), day-of-week filter (for fixed-time), created/updated timestamps
- **ReminderTemplate**: A predefined reminder configuration that users can enable. Key attributes: id, name, description, category (Health/Productivity/Religious), default configuration, icon
- **TriggeredNotification**: An instance of a reminder that has fired. Key attributes: reminder id, triggered timestamp, status (pending/acknowledged/snoozed), snooze-until timestamp
- **UserLocation**: Location data for prayer time calculation. Key attributes: latitude, longitude, city name, calculation method preference

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create and activate a custom reminder in under 30 seconds
- **SC-002**: 95% of interval reminders trigger within 10 seconds of their scheduled time when the app is open
- **SC-003**: Prayer time calculations match the Aladhan API results with no discrepancy
- **SC-004**: Users can browse and enable a predefined template in under 10 seconds (2 taps)
- **SC-005**: 100% of reminder configurations persist correctly across browser sessions
- **SC-006**: Users who enable reminders report improved awareness of break times and scheduled activities
- **SC-007**: In-app fallback notifications display within 1 second when browser notifications are unavailable
- **SC-008**: Users can manage (view, edit, delete) up to 20 active reminders without performance degradation

## Assumptions

- Users have modern browsers that support the Notification API (Chrome, Firefox, Safari, Edge)
- Users are comfortable granting notification permissions for productivity features
- The Aladhan API remains free and publicly accessible for prayer time calculations
- Local storage is sufficient for persisting reminder data (no server-side sync needed for MVP)
- Default snooze options of 5, 10, and 15 minutes cover most user needs
- Reminders are personal and do not need to be shared across devices (single-device, offline-capable architecture consistent with existing app)
- Reminder entities will integrate with existing state management patterns (AppState in lib/types.ts, reducer actions in lib/store.tsx, localStorage persistence via lib/storage.ts)
