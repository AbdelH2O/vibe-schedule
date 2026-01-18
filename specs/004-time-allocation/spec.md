# Feature Specification: Time Allocation Engine

**Feature Branch**: `004-time-allocation`
**Created**: 2026-01-18
**Status**: Draft
**Input**: User description: "Phase 4: Time Allocation Engine - Implement the algorithm that distributes session time across contexts based on priorities, weights, and duration constraints"

## Clarifications

### Session 2026-01-18

- Q: How does context priority factor into time allocation? → A: Priority affects only which context is suggested first in working mode, not time allocation amounts. Weights alone determine proportional distribution.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Setup Session with Available Time (Priority: P1)

A user wants to begin a focused work session by specifying how much time they have available. They enter their total session duration and the system prepares to distribute this time across their defined contexts.

**Why this priority**: This is the fundamental entry point for working mode. Without session setup, no time allocation can occur. Users must be able to define their available time before any distribution logic applies.

**Independent Test**: Can be tested by entering a session duration (e.g., "4 hours") and verifying the system accepts and displays the total time correctly.

**Acceptance Scenarios**:

1. **Given** a user is in Definition Mode with at least one context defined, **When** they initiate a new session and enter "240 minutes", **Then** the system accepts the input and shows "4h 0m" as total session time.
2. **Given** a user attempts to start a session, **When** they enter an invalid duration (0, negative, or non-numeric), **Then** the system displays a validation error and prevents session creation.
3. **Given** a user enters session time, **When** the input is accepted, **Then** the system proceeds to calculate and preview time allocations.

---

### User Story 2 - Preview Time Allocations Before Starting (Priority: P1)

After entering session duration, the user wants to see how their time will be distributed across contexts before committing to start the session. This preview allows them to understand and validate the allocation before beginning work.

**Why this priority**: Users need transparency into how their time will be spent. The preview acts as a confirmation step and builds trust in the allocation algorithm. Users can adjust context weights or constraints if the preview doesn't match their expectations.

**Independent Test**: Can be tested by setting up contexts with various weights/constraints, entering session time, and verifying the preview shows correct time allocations for each context.

**Acceptance Scenarios**:

1. **Given** a user has 3 contexts with equal weights and no duration constraints, **When** they enter 180 minutes session time, **Then** the preview shows 60 minutes allocated to each context.
2. **Given** a user has 2 contexts where Context A has minimum 30 minutes and Context B has no constraints, **When** they enter 90 minutes session time, **Then** the preview shows 30 minutes for Context A and 60 minutes for Context B.
3. **Given** a user views the allocation preview, **When** they review the distribution, **Then** each context shows its allocated time and the total equals the session duration.
4. **Given** a user views the preview, **When** they are satisfied with the allocation, **Then** they can confirm and start the session.

---

### User Story 3 - Time Distribution with Minimum Durations (Priority: P2)

Users who have set minimum duration requirements on contexts expect those minimums to be guaranteed before any remaining time is distributed. This ensures critical focus areas receive their required time.

**Why this priority**: Minimum durations represent user commitments to certain contexts. The allocation algorithm must honor these constraints first to maintain user trust and ensure important work areas receive dedicated time.

**Independent Test**: Can be tested by creating contexts with minimum durations that sum to less than session time, then verifying each minimum is met in the allocation preview.

**Acceptance Scenarios**:

1. **Given** Context A has minimum 60 minutes, Context B has minimum 30 minutes, Context C has no minimum, **When** user enters 150 minutes session time, **Then** A gets at least 60 minutes, B gets at least 30 minutes, and C receives the remaining 60 minutes.
2. **Given** Context A has minimum 60 minutes and weight 2, Context B has minimum 30 minutes and weight 1, **When** user enters 180 minutes session time, **Then** minimums are satisfied first (90 total), and remaining 90 minutes is distributed by weight (60 to A, 30 to B).
3. **Given** minimum durations exist, **When** the preview is generated, **Then** each context with a minimum shows at least that minimum duration.

---

### User Story 4 - Time Distribution by Weights (Priority: P2)

Users can assign weights to contexts to influence how remaining time (after minimums) is distributed. Higher-weighted contexts receive proportionally more time.

**Why this priority**: Weight-based distribution is core to the system's value proposition of flexible time allocation. It allows users to express relative importance without rigid scheduling.

**Independent Test**: Can be tested by setting up contexts with different weights, entering session time, and verifying proportional distribution in the preview.

**Acceptance Scenarios**:

1. **Given** Context A has weight 3, Context B has weight 1, neither has constraints, **When** user enters 120 minutes session time, **Then** A receives 90 minutes (75%), B receives 30 minutes (25%).
2. **Given** Context A has weight 2 and minimum 30 minutes, Context B has weight 2 with no constraints, **When** user enters 90 minutes, **Then** A gets 30 (minimum) + 30 (half of remaining 60) = 60 minutes, B gets 30 minutes.
3. **Given** all contexts have equal weights, **When** time is distributed, **Then** remaining time after minimums is split equally.

---

### User Story 5 - Maximum Duration Caps (Priority: P2)

Users who set maximum duration caps on contexts expect those limits to be respected, preventing any single context from consuming too much session time even if weights would otherwise allocate more.

**Why this priority**: Maximum caps help users avoid over-committing to any single focus area. This supports balanced work distribution and prevents tunnel vision.

**Independent Test**: Can be tested by setting a context with a low maximum, high weight, and verifying the allocation doesn't exceed the cap.

**Acceptance Scenarios**:

1. **Given** Context A has maximum 45 minutes and weight 10, Context B has no maximum and weight 1, **When** user enters 120 minutes session time, **Then** A receives 45 minutes (capped), B receives 75 minutes (remaining).
2. **Given** Context A has maximum 60 minutes and minimum 30 minutes, **When** allocation would exceed maximum, **Then** Context A receives exactly 60 minutes.
3. **Given** multiple contexts have maximum caps, **When** allocation is calculated, **Then** excess time from capped contexts is redistributed to uncapped contexts.

---

### User Story 6 - Equal Distribution Fallback (Priority: P3)

When contexts have no weights, minimums, or maximums defined, the system distributes session time equally across all contexts. This ensures sensible behavior even without explicit configuration.

**Why this priority**: This is a fallback scenario that ensures the system works out-of-the-box without requiring users to configure weights or constraints.

**Independent Test**: Can be tested by creating contexts with default settings (no weights/constraints) and verifying equal distribution.

**Acceptance Scenarios**:

1. **Given** 4 contexts with no weights or duration constraints, **When** user enters 120 minutes session time, **Then** each context receives 30 minutes.
2. **Given** contexts have default weight values (1), **When** time is distributed, **Then** distribution is equal across all contexts.

---

### User Story 7 - Handle Over-Committed Minimums (Priority: P3)

When the sum of all minimum durations exceeds the available session time, the system must handle this gracefully by informing the user and providing options.

**Why this priority**: This edge case prevents users from starting sessions where constraints cannot be satisfied. Clear feedback helps users adjust their setup.

**Independent Test**: Can be tested by setting minimums that total more than session time and verifying the system shows a warning with actionable options.

**Acceptance Scenarios**:

1. **Given** Context A has minimum 60 minutes, Context B has minimum 90 minutes, **When** user enters 120 minutes session time, **Then** the system displays a warning that minimums exceed available time by 30 minutes.
2. **Given** minimums exceed session time, **When** the warning is displayed, **Then** the user sees options: extend session time, reduce minimums, or proceed with proportionally reduced allocations.
3. **Given** user chooses to proceed with reduced allocations, **When** the session starts, **Then** time is distributed proportionally to minimums (A: 48 min, B: 72 min for 120-minute session).

---

### User Story 8 - Handle Zero Contexts (Priority: P3)

When a user attempts to start a session with no contexts defined, the system should provide helpful feedback rather than failing silently.

**Why this priority**: This prevents confusion for new users and guides them toward proper setup before starting a session.

**Independent Test**: Can be tested by having no contexts and attempting to start a session.

**Acceptance Scenarios**:

1. **Given** no contexts are defined, **When** user attempts to start a session, **Then** the system displays a message explaining that at least one context is required.
2. **Given** the no-contexts message is displayed, **When** the user reads it, **Then** they are directed to create a context first.

---

### Edge Cases

- What happens when session time is exactly equal to the sum of all minimums? (All minimums are satisfied, no remaining time to distribute)
- How does the system handle contexts with minimum equal to maximum? (Context gets exactly that duration)
- What happens when a single context exists? (That context receives all session time, respecting min/max)
- How are fractional minutes handled? (Round to nearest minute, with remainder going to highest-priority context)
- What if all contexts have maximum caps that sum to less than session time? (Warn user that not all time can be allocated)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to input session duration in minutes or hours:minutes format.
- **FR-002**: System MUST validate session duration input (positive number, reasonable range 1-720 minutes).
- **FR-003**: System MUST calculate time allocations based on the defined algorithm before session starts.
- **FR-004**: System MUST display allocation preview showing each context's allocated time.
- **FR-005**: System MUST allocate minimum durations first, before distributing remaining time.
- **FR-006**: System MUST distribute remaining time (after minimums) proportionally based on context weights. Context priority does NOT affect allocation amounts; priority only determines suggested work order in working mode.
- **FR-007**: System MUST enforce maximum duration caps, redistributing excess to uncapped contexts.
- **FR-008**: System MUST distribute time equally when no weights or constraints are defined.
- **FR-009**: System MUST display a warning when minimum durations exceed available session time.
- **FR-010**: System MUST offer options when over-committed: extend time, reduce minimums, or proceed with proportional reduction.
- **FR-011**: System MUST prevent session start when no contexts exist, with helpful guidance.
- **FR-012**: System MUST show the total allocated time equals session duration (validation).
- **FR-013**: System MUST handle fractional minute allocations by rounding to whole minutes.
- **FR-014**: System MUST allow user to cancel/modify session setup before confirming start.
- **FR-015**: System MUST persist session configuration until user confirms or cancels.

### Key Entities

- **Session**: Represents a planned work session. Contains total duration, start time (once started), and collection of context allocations.
- **Allocation**: Represents time assigned to a specific context within a session. Contains context reference, allocated duration, and consumed duration (for tracking during working mode).
- **AllocationPreview**: Temporary representation of calculated allocations before session confirmation. Used for display and validation before committing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set up a session and view allocation preview in under 30 seconds.
- **SC-002**: 100% of sessions have total allocations equal to session duration (no time lost or over-allocated).
- **SC-003**: Users understand their time distribution at a glance from the preview (validated by clear visual breakdown).
- **SC-004**: Edge case warnings (over-committed minimums, zero contexts) appear immediately with actionable guidance.
- **SC-005**: Allocation calculations complete instantly (no perceptible delay for typical setups of 1-20 contexts).
- **SC-006**: Users can modify session duration and see updated preview without restarting the setup flow.
