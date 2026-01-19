# Feature Specification: Work Mode Sidebar

**Feature Branch**: `008-workmode-sidebar`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "Let's also show the reminders in the work mode. To do so, we will create a column to the right, with two separate boxes: important dates then reminders. Both will be collapsed by default unless one of the events is close to expiring then it will pop up before expanding the accordions. One expanded we will have a scrollable view of deadlines and reminders. We should also be able to add deadlines and reminders from that interface, as well as deleting them, and should be able to delete tasks as well."

## Clarifications

### Session 2026-01-19

- Q: What is the sidebar expansion behavior (persistent column vs Gmail-style icon rail)? → A: Icon rail (collapsed) shows icons for Dates/Reminders; clicking expands panel overlay (no background dim, no focus trap); tabs switch sections
- Q: Which deadlines to display (all session contexts vs active context only)? → A: Show all contexts by default, with a persistent toggle to switch to active context only

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Urgent Events at a Glance (Priority: P1)

As a user working in a session, I want to see urgent deadlines and upcoming reminders in a sidebar so I can stay aware of time-sensitive events without leaving my workflow.

**Why this priority**: Core value proposition - users need visibility into their important dates and reminders while working. Without this, the sidebar has no purpose.

**Independent Test**: Can be fully tested by entering work mode with configured deadlines and reminders, verifying that urgent items auto-expand and display countdowns, delivering immediate situational awareness.

**Acceptance Scenarios**:

1. **Given** a user is in working mode with deadlines within 24 hours, **When** the user clicks the Important Dates icon in the sidebar rail, **Then** the panel expands and displays those urgent deadlines with countdown indicators.
2. **Given** a user is in working mode with a reminder due within 15 minutes, **When** the sidebar panel is open on the Reminders tab, **Then** the imminent reminder is highlighted.
3. **Given** all deadlines and reminders are more than 24 hours away, **When** the user views the icon rail, **Then** icons show counts but no urgency indicators.
4. **Given** the user is in working mode, **When** a deadline becomes urgent (crosses 24-hour threshold), **Then** the icon rail shows an urgency indicator (badge/dot) on the Important Dates icon.

---

### User Story 2 - Manage Deadlines from Work Mode (Priority: P2)

As a user in a work session, I want to add and delete important dates directly from the sidebar so I can capture and manage deadlines without interrupting my workflow.

**Why this priority**: Deadlines are often discovered or become irrelevant during work sessions. The ability to manage them in-context reduces mode-switching friction.

**Independent Test**: Can be fully tested by adding a new deadline via the sidebar, verifying it appears in the list, then deleting it and confirming removal.

**Acceptance Scenarios**:

1. **Given** the sidebar panel is open on the Important Dates tab, **When** the user clicks an "Add" button, **Then** a form appears allowing entry of label and date.
2. **Given** the user fills in deadline details and submits, **When** the form is submitted, **Then** the new deadline appears in the Important Dates list sorted by urgency.
3. **Given** a deadline item is displayed, **When** the user clicks its delete action, **Then** a confirmation is requested.
4. **Given** the user confirms deletion, **When** confirmed, **Then** the deadline is removed from the list immediately.

---

### User Story 3 - Manage Reminders from Work Mode (Priority: P2)

As a user in a work session, I want to add and delete reminders directly from the sidebar so I can set up helpful prompts without navigating away from my work.

**Why this priority**: Equal to deadline management - reminders are time-sensitive and users benefit from managing them in-context.

**Independent Test**: Can be fully tested by opening the reminder form from the sidebar, creating a new reminder, then deleting it via the sidebar interface.

**Acceptance Scenarios**:

1. **Given** the sidebar panel is open on the Reminders tab, **When** the user clicks an "Add" button, **Then** a form appears for creating a new reminder (reusing existing ReminderForm).
2. **Given** the user completes reminder creation, **When** the form is submitted, **Then** the new reminder appears in the Reminders list.
3. **Given** a reminder item is displayed, **When** the user clicks its delete action, **Then** a confirmation dialog appears.
4. **Given** the user confirms deletion, **When** confirmed, **Then** the reminder is removed from the list immediately.

---

### User Story 4 - Delete Tasks from Work Mode (Priority: P3)

As a user reviewing tasks during a session, I want to delete tasks directly from the working task list so I can remove irrelevant items without leaving work mode.

**Why this priority**: Lower than deadline/reminder management since tasks already have completion toggles. Deletion is a less frequent operation.

**Independent Test**: Can be fully tested by deleting a task from the working task list and confirming it no longer appears.

**Acceptance Scenarios**:

1. **Given** a task is displayed in the working task list, **When** the user triggers the delete action, **Then** a confirmation dialog appears.
2. **Given** the user confirms deletion, **When** confirmed, **Then** the task is removed from the list immediately.
3. **Given** the user cancels deletion, **When** canceled, **Then** the task remains unchanged.

---

### User Story 5 - Gmail-Style Sidebar Interaction (Priority: P1)

As a user in work mode, I want to access the sidebar via a compact icon rail that expands into a panel when clicked, so I can view details without disrupting my main workflow.

**Why this priority**: This is the core interaction pattern that enables all other sidebar functionality. Without the icon rail + expandable panel, users cannot access deadlines or reminders.

**Independent Test**: Can be fully tested by clicking an icon in the rail to expand the panel, switching tabs, and clicking outside to collapse, verifying no focus trap or background dimming occurs.

**Acceptance Scenarios**:

1. **Given** the user is in working mode, **When** viewing the screen, **Then** a vertical icon rail is visible on the right edge with icons for Important Dates and Reminders.
2. **Given** the icon rail is visible, **When** the user clicks the Important Dates icon, **Then** a panel expands from the rail showing the Important Dates content without dimming the background or trapping focus.
3. **Given** the panel is expanded, **When** the user clicks the Reminders icon/tab, **Then** the panel switches to show Reminders content.
4. **Given** the panel is expanded, **When** the user clicks outside the panel (on main content), **Then** the panel collapses back to the icon rail.
5. **Given** the panel is expanded, **When** the user interacts with main page content, **Then** the interaction succeeds (no focus trap prevents it).

---

### User Story 6 - Filter Deadlines by Scope (Priority: P2)

As a user viewing important dates, I want to toggle between seeing all session deadlines or only deadlines from my active context, so I can focus on what's most relevant to my current work.

**Why this priority**: Provides flexibility for users who want comprehensive awareness vs focused view. Complements the core deadline visibility feature.

**Independent Test**: Can be fully tested by toggling the scope filter and verifying the list updates to show all contexts or active context only, and that the preference persists across sessions.

**Acceptance Scenarios**:

1. **Given** the Important Dates panel is open, **When** viewing by default, **Then** deadlines from all contexts in the session are displayed.
2. **Given** deadlines from multiple contexts are visible, **When** the user toggles to "Active context only", **Then** only deadlines from the currently active context are shown.
3. **Given** the user sets the toggle to "Active context only", **When** the user closes and reopens the sidebar or starts a new session, **Then** the toggle remains set to "Active context only".
4. **Given** the toggle is set to "Active context only", **When** the user switches to a different context, **Then** the deadline list updates to show the new active context's deadlines.

---

### User Story 7 - Responsive Sidebar Behavior (Priority: P3)

As a user on different screen sizes, I want the sidebar to adapt to my device so the work mode remains usable on both desktop and mobile.

**Why this priority**: Polish feature that improves usability but doesn't block core functionality.

**Independent Test**: Can be fully tested by resizing the viewport and verifying the sidebar transforms appropriately at breakpoints.

**Acceptance Scenarios**:

1. **Given** the user is on a desktop-sized viewport, **When** viewing work mode, **Then** the icon rail is visible on the right edge.
2. **Given** the user is on a mobile/tablet viewport, **When** viewing work mode, **Then** the icon rail is hidden and a toggle button in the header provides access to the sidebar panel.
3. **Given** the sidebar panel is open on mobile, **When** the user taps outside the panel, **Then** it closes automatically.

---

### Edge Cases

- What happens when there are no deadlines or reminders configured? Display empty state message with guidance to add items in the expanded panel.
- What happens when all deadlines are past (overdue)? Show them with overdue styling, sorted at top of list; icon shows urgency indicator.
- What happens when the user deletes the only deadline/reminder? Panel shows empty state; icon count updates to zero.
- What happens when a reminder triggers while the sidebar panel is open? Notification modal takes precedence; sidebar panel remains open and updates when dismissed.
- What happens if adding a deadline fails (storage error)? Show error toast and preserve form state for retry.
- What happens when user clicks an icon while panel is already open on that tab? Panel remains open (no toggle behavior).
- What happens when user clicks the same icon while panel is open on different tab? Panel switches to clicked tab.
- What happens when "Active context only" is selected but active context has no deadlines? Show empty state with option to switch to "All contexts" view.

## Requirements *(mandatory)*

### Functional Requirements

**Icon Rail (Collapsed State)**
- **FR-001**: System MUST display a vertical icon rail on the right edge of the working mode screen containing icons for "Important Dates" and "Reminders".
- **FR-002**: System MUST display the Important Dates icon above the Reminders icon in the rail.
- **FR-003**: System MUST show a count badge on each icon indicating the number of items in that section (respecting current filter for Important Dates).
- **FR-004**: System MUST show an urgency indicator (visual badge/dot) on the Important Dates icon when any visible deadline is within 24 hours or overdue.
- **FR-005**: System MUST show an urgency indicator on the Reminders icon when any enabled reminder is scheduled to trigger within 15 minutes.

**Expanded Panel**
- **FR-006**: System MUST expand a panel from the icon rail when the user clicks an icon, without dimming the background.
- **FR-007**: System MUST NOT trap focus within the expanded panel; users can interact with main page content while panel is open.
- **FR-008**: System MUST display tabs at the top of the expanded panel allowing users to switch between Important Dates and Reminders.
- **FR-009**: System MUST collapse the panel back to the icon rail when the user clicks outside the panel.
- **FR-010**: System MUST display a scrollable list of items within the active tab.

**Important Dates Content**
- **FR-011**: System MUST display a countdown indicator for each deadline showing time remaining with urgency styling.
- **FR-012**: System MUST sort deadlines by urgency (overdue first, then urgent, then warning, then neutral).
- **FR-013**: System MUST allow users to add new important dates via a form within the panel (added to the currently active context).
- **FR-014**: System MUST allow users to delete important dates with confirmation.
- **FR-015**: System MUST display deadlines from all session contexts by default.
- **FR-016**: System MUST provide a toggle to filter deadlines to active context only.
- **FR-017**: System MUST persist the deadline scope toggle preference to storage.
- **FR-018**: System MUST indicate which context each deadline belongs to when showing all contexts.

**Reminders Content**
- **FR-019**: System MUST display the next trigger time for each enabled reminder.
- **FR-020**: System MUST allow users to add new reminders via the existing reminder form within the panel.
- **FR-021**: System MUST allow users to delete reminders with confirmation.

**Task Deletion**
- **FR-022**: System MUST allow users to delete tasks from the working task list with confirmation.

**General**
- **FR-023**: System MUST persist all additions and deletions to storage immediately.
- **FR-024**: System MUST show empty state messages when no items exist in a section.
- **FR-025**: System MUST update the sidebar in real-time as urgency thresholds are crossed.
- **FR-026**: System MUST adapt the sidebar for mobile (icon rail hidden, toggle button in header reveals panel).

### Key Entities

- **ImportantDate**: Represents a deadline with label and date. Already exists in Context entity as `importantDates` array. Key attributes: id, label, date.
- **Reminder**: User-configured notification trigger. Already exists in app state. Key attributes: id, title, enabled, config, scope, lastTriggeredAt.
- **Task**: Work item that can be completed or deleted. Already exists. Key attributes: id, title, contextId, deadline, completed.
- **IconRail**: Vertical strip of icons providing collapsed access to sidebar sections. Contains icon buttons with count badges and urgency indicators.
- **SidebarPanel**: Expandable content area that slides out from the icon rail, contains tabs for switching sections and scrollable content lists.
- **SidebarPreferences**: User preferences for sidebar behavior. Key attributes: deadlineScopeFilter ('all' | 'active-context'). Persisted to storage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view urgent deadline count via icon badge within 1 second of entering work mode without any clicks.
- **SC-002**: Users can expand the sidebar panel and view all deadlines with 1 click.
- **SC-003**: Users can add a new deadline in under 30 seconds from the sidebar interface.
- **SC-004**: Users can add a new reminder in under 60 seconds from the sidebar interface.
- **SC-005**: Users can delete any deadline, reminder, or task with 2 clicks (action + confirmation).
- **SC-006**: Sidebar panel expands without blocking interaction with main page content.
- **SC-007**: 100% of urgent items (within threshold) display urgency indicators on their respective icons.
- **SC-008**: All CRUD operations complete and persist within 1 second of user action.
- **SC-009**: Deadline scope toggle preference persists across browser sessions.

## Assumptions

- The urgency threshold for deadlines (24 hours) aligns with the existing `urgent` classification in `getDeadlineUrgency()`.
- The reminder urgency threshold of 15 minutes is a reasonable default for "imminent" reminders.
- Important dates are stored within their associated Context, so adding a deadline requires knowing which context it belongs to. The sidebar will add deadlines to the currently active context.
- The existing ReminderForm and ReminderSheet components can be adapted or reused for sidebar reminder management.
- Mobile breakpoint follows existing app conventions (sm: 640px based on Tailwind defaults).
- Delete confirmations use the existing AlertDialog component for consistency.
- The expanded panel overlays the main content (positioned absolutely) rather than pushing content aside.
- Deadline scope preference is stored separately from main app state (lightweight preference storage).
