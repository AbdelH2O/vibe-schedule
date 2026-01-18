# vibe-schedule

A context-driven productivity system that blends task management with flexible time allocation. Unlike traditional calendar apps with rigid time blocks, vibe-schedule lets you define *what* you want to work on and allocates time dynamically based on priorities and weights—starting only when you're ready.

## Core Concepts

### Contexts (Topics)
Contexts are the top-level organizational units—think of them as work modes or focus areas (e.g., "Deep Work", "Admin", "Learning", "Project X"). Instead of scheduling fixed calendar events, you define contexts and let the system distribute your available time across them.

Each context can have:
- **Priority level** — influences scheduling order
- **Minimum duration** — guaranteed time allocation (optional)
- **Maximum duration** — time cap to prevent overcommitment (optional)
- **Weight** — relative importance for time distribution when no minimums are set
- **Important dates** — deadlines or milestones that display as countdown indicators

### Tasks
Tasks are actionable items that live within contexts. They represent the actual work to be done.

- Tasks can exist in an **Inbox** before being assigned to a context
- Once assigned, tasks appear when working within that context
- Tasks can optionally have deadlines (shown as indicators, not scheduling drivers)

### Time Allocation
When starting a work session, you define how much time you have available (e.g., "I have 4 hours today"). The system then distributes this time across your contexts based on:

1. **Minimum durations** — contexts with minimums get their guaranteed time first
2. **Weights/priorities** — remaining time is distributed proportionally
3. **Maximum durations** — caps prevent any single context from dominating

If no minimums or weights are defined, time is distributed equally across all contexts.

## Modes

### Definition Mode
The planning and organization phase where you:
- Create and manage contexts
- Add tasks to the inbox or directly to contexts
- Set priorities, weights, and duration constraints for contexts
- Assign deadlines and important dates
- Review your overall structure

### Working Mode
The focused execution phase:
- Activated by clicking **Start** and defining your available session time
- Begin with your highest-priority context
- See only the tasks belonging to your current context
- Switch contexts freely at any time—time consumption transfers to the new context
- Track remaining time per context as you work

## How It Works

1. **Define** your contexts and populate them with tasks
2. **Start** a session by specifying your available time
3. **Work** within the suggested context, completing tasks
4. **Switch** contexts as needed—each context's clock runs only while active
5. **Finish** when your session time is exhausted or you choose to stop

## Design Philosophy

- **Flow over rigidity** — No fixed start/end times; work begins when you begin
- **Context over calendar** — Organize by *what* you're doing, not *when*
- **Flexible commitment** — Minimums and maximums provide guardrails without strictness
- **Indicators over alarms** — Deadlines inform but don't interrupt
