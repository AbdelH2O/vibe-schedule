# Research: Reminders & Notifications

**Feature Branch**: `007-reminders-notifications`
**Date**: 2026-01-19

## Overview

This document consolidates research findings for implementing the Reminders & Notifications feature, resolving all technical decisions needed for Phase 1 design.

---

## 1. Aladhan Prayer Times API Integration

### Decision
Use the Aladhan API's `/v1/timingsByAddress/:date_or_timestamp` endpoint with city-based location input and caching.

### Rationale
- Free, no API key required
- Supports multiple calculation methods for different Islamic schools
- Returns all five prayer times in a single response
- Well-documented with active maintenance

### API Details

**Base URL**: `https://api.aladhan.com/v1`

**Primary Endpoint**: `/timingsByAddress/:date_or_timestamp`
- Accepts a date in DD-MM-YYYY format or Unix timestamp
- Uses address string for location (simpler than coordinates for users)

**Parameters**:
| Parameter | Required | Description |
|-----------|----------|-------------|
| address | Yes | City name or full address (e.g., "London, UK") |
| method | No | Calculation method ID (default varies by region) |

**Response Structure** (relevant fields):
```json
{
  "data": {
    "timings": {
      "Fajr": "05:12",
      "Sunrise": "06:45",
      "Dhuhr": "12:15",
      "Asr": "15:30",
      "Maghrib": "18:45",
      "Isha": "20:15"
    },
    "date": {
      "readable": "19 Jan 2026",
      "gregorian": { "date": "19-01-2026" }
    }
  }
}
```

**Supported Calculation Methods** (commonly used):
| ID | Name | Region |
|----|------|--------|
| 2 | Islamic Society of North America (ISNA) | North America |
| 3 | Muslim World League | Europe, Far East |
| 4 | Umm Al-Qura University, Makkah | Arabian Peninsula |
| 5 | Egyptian General Authority of Survey | Africa, Syria, Lebanon |
| 15 | Moonsighting Committee Worldwide | Global |

### Caching Strategy
- Cache prayer times in localStorage with key: `prayer-times-{address}-{date}`
- Cache duration: 7 days (as specified in FR-016)
- On API failure, use cached data with "outdated" indicator
- Fetch new times at midnight local time or when location changes

### Alternatives Considered
- **MuslimSalat API**: Requires API key, less flexible
- **Local calculation library (adhan-js)**: Adds bundle size, requires precise coordinates
- **Manual coordinate input**: Poor UX compared to city name

---

## 2. Browser Notification API Implementation

### Decision
Use the standard Notification API with a two-step permission flow and in-app modal fallback.

### Rationale
- Native browser support provides system-level notifications
- Two-step flow respects user consent and improves acceptance rate
- In-app fallback ensures functionality when permissions denied

### Implementation Approach

**Permission Request Flow**:
1. User clicks "Enable notifications" in reminders settings (user gesture required)
2. Show explanatory dialog: "Get notified about breaks and prayer times even when the tab is in the background"
3. On confirm, call `Notification.requestPermission()`
4. Store permission state in localStorage to avoid re-prompting

**Permission States**:
```typescript
type NotificationPermission = 'default' | 'granted' | 'denied';
```

**Creating Notifications**:
```typescript
const notification = new Notification(title, {
  body: message,
  icon: '/icon-192.png',
  tag: reminderId, // Prevents duplicate notifications
  requireInteraction: true // Stays visible until user interacts
});
```

**Handling Background Tabs**:
- Browser Notification API works in background tabs when permission granted
- `requireInteraction: true` keeps notification visible until acknowledged
- On notification click, focus the app tab

**In-App Fallback**:
- When `Notification.permission === 'denied'` or API unavailable
- Use modal dialog (ReminderModal) with identical content
- Audio chime (using existing lib/notifications.ts pattern) for attention

### Mobile Considerations
- Most mobile browsers require ServiceWorker for notifications
- For MVP, in-app modal is the primary experience on mobile
- Future enhancement: Add ServiceWorker registration for mobile push

### Best Practices Applied
- Never request permission on page load
- Request only after user expresses interest (clicks bell icon → sees reminders → enables)
- Provide clear value explanation before requesting
- Respect denial with graceful in-app fallback

---

## 3. Timer Scheduling Strategy

### Decision
Use `setInterval` with 1-second granularity and timestamp comparison for reminder scheduling.

### Rationale
- Simple and reliable for client-side scheduling
- Works with tab visibility changes (checks absolute time)
- No external dependencies

### Implementation Approach

**Scheduler Architecture**:
```typescript
interface ReminderScheduler {
  // Check all reminders every second
  tick(): void;

  // Calculate next trigger time for a reminder
  getNextTriggerTime(reminder: Reminder): Date | null;

  // Handle triggered reminder
  onTrigger(reminder: Reminder): void;
}
```

**Scheduling Logic**:
1. Store `lastTriggeredAt` timestamp for each reminder
2. Every second, check: `now >= lastTriggeredAt + intervalMs`
3. For fixed-time reminders: compare current time (HH:MM) with scheduled time
4. For prayer times: compare current time with cached prayer times for today

**Tab Visibility Handling**:
- On tab becoming visible after being hidden, immediately check all reminders
- If a reminder was missed while hidden, trigger it immediately
- This handles browser throttling of background tabs

**Multiple Simultaneous Reminders** (FR-015):
- Queue triggered reminders in array
- Display one modal at a time
- On acknowledge/dismiss, show next queued reminder

### Timer Pause Integration

**Session Timer Pause** (FR-017):
```typescript
// In ContextTimer component
const [isPausedByReminder, setIsPausedByReminder] = useState(false);

// When reminder triggers:
setIsPausedByReminder(true);
// Timer useEffect checks this flag and skips incrementing

// When reminder acknowledged/dismissed:
setIsPausedByReminder(false);
```

**Snooze Behavior**:
- Snooze sets `snoozedUntil` timestamp on TriggeredNotification
- Timer remains paused during snooze
- When snooze expires, re-trigger the notification

### Alternatives Considered
- **setTimeout per reminder**: Complex to manage, drift issues
- **Web Workers**: Overkill for this use case, adds complexity
- **Service Worker timers**: Better for background, but requires PWA setup

---

## 4. State Management Integration

### Decision
Extend existing AppState in lib/types.ts and store.tsx with reminder-specific state.

### Rationale
- Consistent with existing architecture
- Single source of truth for all app state
- Automatic persistence via existing localStorage utilities

### State Structure
```typescript
// Added to AppState
interface AppState {
  // ... existing fields
  reminders: Reminder[];
  userLocation: UserLocation | null;
  activeNotification: TriggeredNotification | null;
  notificationQueue: TriggeredNotification[];
}
```

### New Actions
```typescript
type ReminderAction =
  | { type: 'ADD_REMINDER'; payload: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_REMINDER'; payload: { id: string; updates: Partial<Reminder> } }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'TOGGLE_REMINDER_ENABLED'; payload: string }
  | { type: 'SET_USER_LOCATION'; payload: UserLocation | null }
  | { type: 'TRIGGER_NOTIFICATION'; payload: TriggeredNotification }
  | { type: 'ACKNOWLEDGE_NOTIFICATION'; payload: string }
  | { type: 'SNOOZE_NOTIFICATION'; payload: { id: string; snoozedUntil: string } }
  | { type: 'DISMISS_NOTIFICATION'; payload: string };
```

---

## 5. Predefined Templates

### Decision
Store templates as static constants; instantiate as Reminder when user enables.

### Rationale
- Templates are read-only, don't need persistence
- Keeps template definitions separate from user data
- Easy to add new templates without migration

### Template Definitions

```typescript
const REMINDER_TEMPLATES: ReminderTemplate[] = [
  // Health
  {
    id: 'water-hourly',
    name: 'Hourly Water Reminder',
    description: 'Stay hydrated with hourly reminders to drink water',
    category: 'Health',
    defaultConfig: { type: 'interval', intervalMinutes: 60 },
    icon: 'droplet'
  },
  {
    id: 'eye-rest-20-20-20',
    name: '20-20-20 Eye Rest Rule',
    description: 'Every 20 minutes, look at something 20 feet away for 20 seconds',
    category: 'Health',
    defaultConfig: { type: 'interval', intervalMinutes: 20 },
    icon: 'eye'
  },
  // Productivity
  {
    id: 'pomodoro-break',
    name: 'Pomodoro Break',
    description: '25 minutes work, 5 minutes break',
    category: 'Productivity',
    defaultConfig: { type: 'interval', intervalMinutes: 25 },
    icon: 'timer'
  },
  // Religious
  {
    id: 'prayer-times',
    name: 'Islamic Prayer Times',
    description: 'Get notified for Fajr, Dhuhr, Asr, Maghrib, and Isha prayers',
    category: 'Religious',
    defaultConfig: { type: 'prayer', requiresLocation: true },
    icon: 'moon'
  }
];
```

---

## Summary of Decisions

| Topic | Decision | Key Rationale |
|-------|----------|---------------|
| Prayer Times API | Aladhan `/v1/timingsByAddress` | Free, no auth, city-based input |
| Notification API | Two-step permission + in-app fallback | Best practices compliance, accessibility |
| Timer Scheduling | 1-second interval with timestamp comparison | Simple, handles background tabs |
| State Management | Extend existing AppState/reducer | Consistency with architecture |
| Templates | Static constants, instantiated on enable | Separation of concerns |

---

## References

- [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api)
- [MDN Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API)
- [Chrome Best Practices: Notification Permission](https://developer.chrome.com/docs/lighthouse/best-practices/notification-on-start)
