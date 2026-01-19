# Implementation Plan: Reminders & Notifications

**Branch**: `007-reminders-notifications` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-reminders-notifications/spec.md`

## Summary

Add a reminders system that allows users to create custom interval reminders (e.g., every 30 minutes for stretch breaks), fixed-time reminders (e.g., 9:00 AM daily), and predefined templates including Islamic prayer times via the Aladhan API. Reminders trigger modal notifications that pause the context timer during active sessions, requiring user acknowledgment before resuming. Access is via a header bell icon available in both definition and working modes.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 16.1.3, React 19.2.3, shadcn/ui, Radix UI primitives, Lucide React
**Storage**: Browser localStorage (via existing lib/storage.ts utilities)
**Testing**: Manual testing (no test framework currently configured)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) with Notification API support
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Reminders trigger within 10 seconds of scheduled time; modal displays within 1 second
**Constraints**: Offline-capable, single-device, no server-side sync; localStorage persistence
**Scale/Scope**: Up to 20 active reminders without performance degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Flow Over Rigidity | **REQUIRES JUSTIFICATION** | Modal notifications block user flow, but this is intentional per spec requirement FR-019 to ensure users actually take breaks |
| II. Context-First Architecture | PASS | Reminders are independent of contexts but integrate with session state for timer pause |
| III. Flexible Constraints | PASS | Reminders are configurable (interval, fixed-time, scope); snooze provides flexibility |
| IV. Simplicity First | PASS | Single entity type with type discrimination; no unnecessary abstractions |
| V. Dual-Mode Clarity | PASS | Reminders accessible in both modes via header; timer pause only affects working mode |

### Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Modal blocking (Principle I) | User explicitly requested timer pause until acknowledgment to ensure breaks are actually taken | Non-blocking toasts would allow users to ignore reminders, defeating the purpose |

## Project Structure

### Documentation (this feature)

```text
specs/007-reminders-notifications/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API routes)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── components/
│   ├── reminders/           # NEW: Reminder feature components
│   │   ├── ReminderModal.tsx       # Triggered reminder notification modal
│   │   ├── ReminderForm.tsx        # Create/edit reminder form
│   │   ├── ReminderList.tsx        # List of user reminders
│   │   ├── ReminderListItem.tsx    # Individual reminder row
│   │   ├── ReminderSheet.tsx       # Sheet container for reminders panel
│   │   ├── ReminderTemplates.tsx   # Browse predefined templates
│   │   └── LocationPicker.tsx      # Location input for prayer times
│   ├── Header.tsx           # MODIFY: Add bell icon for reminders access
│   └── working/
│       └── ContextTimer.tsx # MODIFY: Integrate timer pause on reminder
├── page.tsx                 # MODIFY: Add ReminderModal provider

lib/
├── types.ts                 # MODIFY: Add Reminder, ReminderTemplate types
├── store.tsx                # MODIFY: Add reminder state and actions
├── storage.ts               # MODIFY: Add reminder persistence
├── reminders.ts             # NEW: Reminder scheduling logic
├── prayerTimes.ts           # NEW: Aladhan API integration and caching
└── notifications.ts         # MODIFY: Add browser Notification API support

components/ui/               # Existing shadcn/ui components (no changes expected)
```

**Structure Decision**: Follows existing Next.js App Router pattern with feature-specific component folder (`app/components/reminders/`) and utility modules in `lib/`. No new top-level directories needed.
