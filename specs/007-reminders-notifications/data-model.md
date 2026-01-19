# Data Model: Reminders & Notifications

**Feature Branch**: `007-reminders-notifications`
**Date**: 2026-01-19

## Overview

This document defines the TypeScript interfaces and state structure for the Reminders & Notifications feature, extending the existing data model in `lib/types.ts`.

---

## New Types

### Reminder

The core entity representing a user-configured or template-based notification trigger.

```typescript
/**
 * Type discriminator for reminder trigger types
 */
export type ReminderType = 'interval' | 'fixed-time' | 'prayer';

/**
 * Scope determines when reminders are active
 */
export type ReminderScope = 'session-only' | 'always';

/**
 * Days of week for fixed-time reminders
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Saturday = 6

/**
 * Configuration for interval-based reminders
 */
export interface IntervalReminderConfig {
  type: 'interval';
  intervalMinutes: number; // 1 to 1440 (24 hours)
}

/**
 * Configuration for fixed-time reminders
 */
export interface FixedTimeReminderConfig {
  type: 'fixed-time';
  time: string; // HH:MM format (24-hour)
  days: DayOfWeek[]; // Which days to trigger (empty = every day)
}

/**
 * Configuration for prayer time reminders
 */
export interface PrayerReminderConfig {
  type: 'prayer';
  prayers: ('Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha')[]; // Which prayers to notify
  minutesBefore: number; // Notify N minutes before prayer time (0 = at prayer time)
}

/**
 * Union type for all reminder configurations
 */
export type ReminderConfig =
  | IntervalReminderConfig
  | FixedTimeReminderConfig
  | PrayerReminderConfig;

/**
 * A user-configured reminder
 */
export interface Reminder {
  id: string;
  title: string;
  message?: string; // Optional custom message
  config: ReminderConfig;
  enabled: boolean;
  scope: ReminderScope;
  templateId?: string; // If created from a template
  lastTriggeredAt?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}
```

### ReminderTemplate

Predefined reminder configurations that users can enable.

```typescript
/**
 * Category for organizing templates
 */
export type TemplateCategory = 'Health' | 'Productivity' | 'Religious';

/**
 * Default configuration for a template
 */
export type TemplateDefaultConfig =
  | { type: 'interval'; intervalMinutes: number }
  | { type: 'fixed-time'; time: string; days?: DayOfWeek[] }
  | { type: 'prayer'; requiresLocation: true };

/**
 * A predefined reminder template
 */
export interface ReminderTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  defaultConfig: TemplateDefaultConfig;
  icon: string; // Lucide icon name
}
```

### TriggeredNotification

Represents an instance of a reminder that has fired and requires user interaction.

```typescript
/**
 * Status of a triggered notification
 */
export type NotificationStatus = 'pending' | 'acknowledged' | 'snoozed' | 'dismissed';

/**
 * An instance of a reminder that has fired
 */
export interface TriggeredNotification {
  id: string;
  reminderId: string;
  title: string;
  message: string;
  triggeredAt: string; // ISO date string
  status: NotificationStatus;
  snoozedUntil?: string; // ISO date string, only if status === 'snoozed'
}
```

### UserLocation

Location data for prayer time calculations.

```typescript
/**
 * Prayer time calculation method ID
 * Common methods:
 * 2 = ISNA (North America)
 * 3 = Muslim World League (Europe)
 * 4 = Umm Al-Qura (Arabian Peninsula)
 * 5 = Egyptian (Africa)
 */
export type CalculationMethodId = 0 | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 99;

/**
 * User location for prayer time calculation
 */
export interface UserLocation {
  city: string; // City name for display and API
  method: CalculationMethodId; // Calculation method preference
}
```

### PrayerTimesCache

Cached prayer times from the Aladhan API.

```typescript
/**
 * Prayer times for a single day
 */
export interface DailyPrayerTimes {
  date: string; // YYYY-MM-DD
  times: {
    Fajr: string; // HH:MM
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  fetchedAt: string; // ISO date string
}

/**
 * Cached prayer times stored in localStorage
 */
export interface PrayerTimesCache {
  location: UserLocation;
  days: DailyPrayerTimes[];
  lastUpdated: string; // ISO date string
}
```

---

## State Structure

### Extended AppState

```typescript
/**
 * Complete app state stored in localStorage
 * Extended with reminder-related fields
 */
export interface AppState {
  // Existing fields
  contexts: Context[];
  tasks: Task[];
  mode: AppMode;
  session: Session | null;
  presets: SessionPreset[];

  // New fields for reminders
  reminders: Reminder[];
  userLocation: UserLocation | null;
  notificationPermission: 'default' | 'granted' | 'denied';
}

/**
 * Runtime state (not persisted)
 */
export interface RuntimeState {
  activeNotification: TriggeredNotification | null;
  notificationQueue: TriggeredNotification[];
  isPausedByReminder: boolean;
}
```

### Updated INITIAL_STATE

```typescript
export const INITIAL_STATE: AppState = {
  // Existing
  contexts: [],
  tasks: [],
  mode: 'definition',
  session: null,
  presets: [],

  // New
  reminders: [],
  userLocation: null,
  notificationPermission: 'default',
};
```

---

## Relationships

```
┌─────────────────┐
│ ReminderTemplate│ (static, read-only)
│  id             │
│  name           │
│  defaultConfig  │
└────────┬────────┘
         │ creates (optional)
         ▼
┌─────────────────┐      triggers      ┌─────────────────────┐
│    Reminder     │ ─────────────────► │ TriggeredNotification│
│  id             │                    │  id                  │
│  config         │                    │  reminderId          │
│  enabled        │                    │  status              │
│  scope          │                    │  snoozedUntil        │
│  templateId?    │                    └─────────────────────┘
└────────┬────────┘
         │ uses (if type=prayer)
         ▼
┌─────────────────┐
│  UserLocation   │
│  city           │
│  method         │
└────────┬────────┘
         │ fetches
         ▼
┌─────────────────┐
│PrayerTimesCache │
│  location       │
│  days[]         │
└─────────────────┘
```

---

## Validation Rules

### Reminder

| Field | Rule |
|-------|------|
| title | Required, 1-100 characters |
| config.intervalMinutes | 1-1440 (1 min to 24 hours) |
| config.time | Valid HH:MM format (00:00-23:59) |
| config.prayers | At least one prayer selected |

### UserLocation

| Field | Rule |
|-------|------|
| city | Required, 1-100 characters |
| method | Valid calculation method ID |

---

## State Transitions

### Reminder Lifecycle

```
[Created] ──► [Enabled] ◄──► [Disabled]
                 │
                 ▼ (when trigger time reached)
         [Notification Triggered]
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
[Acknowledged] [Snoozed] [Dismissed]
                 │
                 │ (snooze expires)
                 ▼
         [Notification Triggered]
```

### Session Timer Interaction

```
[Timer Running] ──► [Reminder Fires] ──► [Timer Paused]
                                              │
                    ┌─────────────────────────┤
                    │                         │
                    ▼                         ▼
            [Acknowledged]              [Snoozed]
                    │                    (stays paused)
                    ▼                         │
            [Timer Resumed] ◄─────────────────┘
                                    (on final ack/dismiss)
```

---

## localStorage Keys

| Key | Content | TTL |
|-----|---------|-----|
| `vibe-schedule` | Full AppState including reminders | Permanent |
| `prayer-times-cache` | PrayerTimesCache object | 7 days |

Note: Prayer times cache is stored separately to allow independent cache invalidation and to avoid bloating the main state object.
