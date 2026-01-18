# Feature Specification: Definition Mode - Context Management

**Feature Branch**: `002-context-management`
**Created**: 2026-01-18
**Status**: Draft
**Input**: Phase 2 from implementation plan - Users can create and manage contexts with properties like name, priority, min/max durations, weight, and important dates

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Context (Priority: P1)

A user wants to create a new context to organize their work around a focus area. They access the context creation interface, enter a name for the context, and save it. The context appears in their context list immediately and persists across browser sessions.

**Why this priority**: Creating contexts is the foundational action - without it, users cannot organize any work. This is the core value proposition of the application.

**Independent Test**: Can be fully tested by creating a context with just a name and verifying it appears in the list and persists after page refresh.

**Acceptance Scenarios**:

1. **Given** the user is in Definition Mode with no contexts, **When** they create a context named "Deep Work", **Then** the context appears in the sidebar context list
2. **Given** the user has created a context, **When** they refresh the page, **Then** the context still appears in the list
3. **Given** the user is creating a context, **When** they leave the name field empty, **Then** the system prevents saving and indicates name is required

---

### User Story 2 - Set Context Properties (Priority: P2)

A user wants to configure a context's properties to control how time is allocated during work sessions. They can set priority level, minimum duration, maximum duration, weight, and add important dates with countdown indicators.

**Why this priority**: Properties control time allocation behavior, which is central to the app's value. Without configurable properties, contexts would just be simple folders.

**Independent Test**: Can be tested by editing a context's properties and verifying the values are saved and displayed correctly.

**Acceptance Scenarios**:

1. **Given** a context exists, **When** the user sets priority to level 2, **Then** the priority is saved and displayed on the context
2. **Given** a context exists, **When** the user sets minimum duration to 30 minutes, **Then** the value is saved and visible in context details
3. **Given** a context exists, **When** the user sets maximum duration to 90 minutes, **Then** the value is saved and visible in context details
4. **Given** a context exists, **When** the user sets weight to 2.5, **Then** the weight is saved and visible in context details
5. **Given** a context exists, **When** the user adds an important date labeled "Project Deadline" for 2026-02-15, **Then** the date appears with a countdown indicator showing days remaining

---

### User Story 3 - Edit an Existing Context (Priority: P2)

A user wants to modify a context they previously created. They select the context, make changes to any of its properties (name, priority, durations, weight, or important dates), and save. The changes are reflected immediately and persist.

**Why this priority**: Editing is essential for maintaining accurate context configurations as priorities and constraints change over time.

**Independent Test**: Can be tested by modifying each property of an existing context and verifying changes persist after save and page refresh.

**Acceptance Scenarios**:

1. **Given** a context named "Admin" exists, **When** the user changes the name to "Administration", **Then** the updated name appears throughout the application
2. **Given** a context has minimum duration of 30 minutes, **When** the user clears the minimum duration, **Then** the context no longer has a minimum duration constraint
3. **Given** a context has an important date, **When** the user removes that date, **Then** the date no longer appears in the context details

---

### User Story 4 - Delete a Context (Priority: P3)

A user wants to remove a context they no longer need. They select delete for the context, confirm the action, and the context is removed from the system.

**Why this priority**: Deletion is important for maintaining a clean workspace but is less frequently used than creation and editing.

**Independent Test**: Can be tested by deleting a context and verifying it no longer appears in the list and the deletion persists after refresh.

**Acceptance Scenarios**:

1. **Given** a context "Old Project" exists, **When** the user deletes it and confirms, **Then** the context is removed from the sidebar
2. **Given** the user initiates deletion, **When** they cancel the confirmation, **Then** the context remains unchanged
3. **Given** a context has tasks assigned to it, **When** the user deletes the context, **Then** the tasks are moved to the Inbox

---

### User Story 5 - View Context List (Priority: P1)

A user wants to see all their contexts at a glance to understand their work structure. The context list shows each context with key information like name and priority indicator.

**Why this priority**: Viewing contexts is required to navigate and understand the application state - it's foundational to using the app.

**Independent Test**: Can be tested by creating multiple contexts and verifying they all appear in the list with correct information.

**Acceptance Scenarios**:

1. **Given** the user has 5 contexts, **When** they view the sidebar, **Then** all 5 contexts are listed
2. **Given** contexts have different priorities, **When** viewing the list, **Then** each context displays its priority indicator
3. **Given** a context has an upcoming important date within 7 days, **When** viewing the list, **Then** a visual indicator shows the approaching deadline

---

### User Story 6 - View Context Details (Priority: P2)

A user wants to see all properties and configuration of a specific context. They select a context and view its complete details including name, priority, durations, weight, and important dates with countdowns.

**Why this priority**: Detailed view is necessary for understanding and verifying context configuration before starting work sessions.

**Independent Test**: Can be tested by selecting a fully-configured context and verifying all properties are displayed correctly.

**Acceptance Scenarios**:

1. **Given** a context has all properties set, **When** the user views its details, **Then** name, priority, min duration, max duration, weight, and important dates are all visible
2. **Given** a context has an important date 10 days away, **When** viewing details, **Then** the countdown shows "10 days remaining"
3. **Given** a context has optional fields unset, **When** viewing details, **Then** those fields show appropriate empty states or are hidden

---

### Edge Cases

- What happens when user tries to create a context with a duplicate name?
  - System allows duplicate names but each context has a unique internal identifier
- How does system handle very long context names?
  - Names are truncated in the list view with full name visible on hover/details
- What happens when minimum duration exceeds maximum duration?
  - System validates and prevents saving with an error message
- How does system handle past important dates?
  - Past dates show as "overdue" with a distinct visual indicator
- What happens when user has many contexts (10+)?
  - List becomes scrollable; no artificial limit imposed
- What happens when deleting the only context?
  - System allows deletion, leaving an empty context list with guidance to create a new context

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create a new context with at minimum a name
- **FR-002**: System MUST require context names to be non-empty
- **FR-003**: System MUST assign a unique identifier to each context automatically
- **FR-004**: System MUST allow users to set a priority level (1-5, where 1 is highest priority)
- **FR-005**: System MUST default priority to 3 (medium) when not specified
- **FR-006**: System MUST allow users to set an optional minimum duration in minutes
- **FR-007**: System MUST allow users to set an optional maximum duration in minutes
- **FR-008**: System MUST validate that minimum duration does not exceed maximum duration when both are set
- **FR-009**: System MUST allow users to set a weight value for time distribution (default: 1)
- **FR-010**: System MUST allow users to add multiple important dates to a context
- **FR-011**: System MUST store a label and date for each important date
- **FR-012**: System MUST display countdown indicators for important dates
- **FR-013**: System MUST allow users to edit all properties of an existing context
- **FR-014**: System MUST allow users to delete a context with confirmation
- **FR-015**: System MUST move tasks from a deleted context to the Inbox
- **FR-016**: System MUST display all contexts in a list view in the sidebar
- **FR-017**: System MUST persist all context data to local storage
- **FR-018**: System MUST display detailed context information when a context is selected
- **FR-019**: System MUST track creation and last-updated timestamps for each context
- **FR-020**: System MUST visually indicate overdue important dates differently from upcoming dates

### Key Entities

- **Context**: A focus area or work mode that organizes related tasks. Contains name (required), priority (1-5), optional min/max duration constraints in minutes, weight for time allocation, and optional important dates. Each context has unique identifier and timestamps.

- **Important Date**: A deadline or milestone associated with a context. Contains a descriptive label and a target date. Displayed as countdown indicators showing time remaining or overdue status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new context with a name in under 10 seconds
- **SC-002**: All context data persists correctly after page refresh with 100% accuracy
- **SC-003**: Users can configure all context properties (priority, durations, weight, dates) in a single editing session without multiple saves
- **SC-004**: Important date countdowns update daily to show accurate days remaining
- **SC-005**: Context deletion with task reassignment completes in under 2 seconds
- **SC-006**: Users can manage up to 20 contexts without performance degradation
- **SC-007**: 95% of users can successfully create and configure a context on first attempt without documentation

## Assumptions

- Users are already in Definition Mode when managing contexts (Working Mode restricts structural changes)
- Context names do not need to be unique - users may choose to have similarly named contexts
- Duration values are always in minutes for simplicity
- Weight values can be decimal numbers (e.g., 1.5, 2.0) for fine-grained control
- Important dates are calendar dates only, not date-times
- "Upcoming" important date indicators apply to dates within 7 days
- The existing data model from Phase 1 (lib/types.ts) defines the Context entity structure
- The sidebar navigation from Phase 1 will be enhanced to support context management
