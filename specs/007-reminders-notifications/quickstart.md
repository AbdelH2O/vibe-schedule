# Quickstart: Reminders & Notifications

**Feature Branch**: `007-reminders-notifications`
**Date**: 2026-01-19

## Overview

This guide provides a quick reference for implementing the Reminders & Notifications feature.

---

## Setup Steps

### 1. Add New Types to `lib/types.ts`

```typescript
// Add after existing types

export type ReminderType = 'interval' | 'fixed-time' | 'prayer';
export type ReminderScope = 'session-only' | 'always';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface IntervalReminderConfig {
  type: 'interval';
  intervalMinutes: number;
}

export interface FixedTimeReminderConfig {
  type: 'fixed-time';
  time: string;
  days: DayOfWeek[];
}

export interface PrayerReminderConfig {
  type: 'prayer';
  prayers: ('Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha')[];
  minutesBefore: number;
}

export type ReminderConfig =
  | IntervalReminderConfig
  | FixedTimeReminderConfig
  | PrayerReminderConfig;

export interface Reminder {
  id: string;
  title: string;
  message?: string;
  config: ReminderConfig;
  enabled: boolean;
  scope: ReminderScope;
  templateId?: string;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLocation {
  city: string;
  method: number;
}

// Update AppState
export interface AppState {
  // ... existing fields
  reminders: Reminder[];
  userLocation: UserLocation | null;
  notificationPermission: 'default' | 'granted' | 'denied';
}
```

### 2. Create `lib/reminders.ts`

```typescript
// Reminder scheduling utilities

export function getNextTriggerTime(reminder: Reminder, now: Date): Date | null {
  if (!reminder.enabled) return null;

  switch (reminder.config.type) {
    case 'interval':
      return getNextIntervalTrigger(reminder, now);
    case 'fixed-time':
      return getNextFixedTimeTrigger(reminder.config, now);
    case 'prayer':
      return getNextPrayerTrigger(reminder.config, now);
  }
}

function getNextIntervalTrigger(reminder: Reminder, now: Date): Date {
  const lastTriggered = reminder.lastTriggeredAt
    ? new Date(reminder.lastTriggeredAt)
    : new Date(reminder.createdAt);
  const intervalMs = reminder.config.intervalMinutes * 60 * 1000;
  return new Date(lastTriggered.getTime() + intervalMs);
}

// ... implement other functions
```

### 3. Create `lib/prayerTimes.ts`

```typescript
// Aladhan API integration

const API_BASE = 'https://api.aladhan.com/v1';
const CACHE_KEY = 'prayer-times-cache';
const CACHE_DAYS = 7;

export async function fetchPrayerTimes(
  city: string,
  method: number,
  date: Date
): Promise<DailyPrayerTimes> {
  const dateStr = formatDateForApi(date); // DD-MM-YYYY
  const url = `${API_BASE}/timingsByAddress/${dateStr}?address=${encodeURIComponent(city)}&method=${method}`;

  const response = await fetch(url);
  const data = await response.json();

  return {
    date: formatDateForStorage(date), // YYYY-MM-DD
    times: data.data.timings,
    fetchedAt: new Date().toISOString(),
  };
}

export function getCachedPrayerTimes(date: Date): DailyPrayerTimes | null {
  // Check localStorage cache
}

export function cachePrayerTimes(times: DailyPrayerTimes): void {
  // Store in localStorage
}
```

### 4. Add Bell Icon to Header

```typescript
// In app/components/Header.tsx

import { Bell } from 'lucide-react';
import { useState } from 'react';
import { ReminderSheet } from './reminders/ReminderSheet';

export function Header({ onMenuClick, rightContent }: HeaderProps) {
  const [remindersOpen, setRemindersOpen] = useState(false);

  return (
    <header className="...">
      {/* ... existing content */}

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRemindersOpen(true)}
          aria-label="Open reminders"
        >
          <Bell className="size-5" />
        </Button>
        {rightContent}
      </div>

      <ReminderSheet open={remindersOpen} onOpenChange={setRemindersOpen} />
    </header>
  );
}
```

### 5. Create ReminderModal Component

```typescript
// app/components/reminders/ReminderModal.tsx

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReminderModalProps {
  notification: TriggeredNotification | null;
  onAcknowledge: () => void;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
}

export function ReminderModal({
  notification,
  onAcknowledge,
  onSnooze,
  onDismiss,
}: ReminderModalProps) {
  if (!notification) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{notification.title}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">{notification.message}</p>
        <div className="flex gap-2 mt-4">
          <Button onClick={onAcknowledge}>Got it</Button>
          <Button variant="outline" onClick={() => onSnooze(5)}>Snooze 5m</Button>
          <Button variant="ghost" onClick={onDismiss}>Dismiss</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Key Integration Points

### Timer Pause (ContextTimer.tsx)

```typescript
// Add to ContextTimer component
const { activeNotification } = useStore();
const isPausedByReminder = activeNotification !== null;

useEffect(() => {
  if (isPausedByReminder || status !== 'active') return;

  const interval = setInterval(() => {
    // ... existing timer logic
  }, 1000);

  return () => clearInterval(interval);
}, [isPausedByReminder, status, /* ... */]);
```

### Notification Permission Request

```typescript
// In ReminderSheet or settings
async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied';

  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission();
    updateNotificationPermission(result);
    return result;
  }

  return Notification.permission;
}
```

### Browser Notification

```typescript
// In lib/reminders.ts
export function showBrowserNotification(title: string, message: string, id: string) {
  if (Notification.permission !== 'granted') return false;

  const notification = new Notification(title, {
    body: message,
    tag: id,
    requireInteraction: true,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return true;
}
```

---

## Testing Checklist

- [ ] Create interval reminder (30 min) → verify triggers
- [ ] Create fixed-time reminder → verify triggers at time
- [ ] Enable prayer times → verify location prompt
- [ ] Trigger reminder during session → verify timer pauses
- [ ] Acknowledge reminder → verify timer resumes
- [ ] Snooze reminder → verify timer stays paused, re-triggers
- [ ] Dismiss reminder → verify timer resumes
- [ ] Deny notification permission → verify in-app modal works
- [ ] Close and reopen app → verify reminders persist
- [ ] Test offline → verify cached prayer times work

---

## Common Patterns

### Discriminated Union for Reminder Config

```typescript
function getReminderDescription(config: ReminderConfig): string {
  switch (config.type) {
    case 'interval':
      return `Every ${config.intervalMinutes} minutes`;
    case 'fixed-time':
      return `Daily at ${config.time}`;
    case 'prayer':
      return `Prayer times: ${config.prayers.join(', ')}`;
  }
}
```

### Snooze Duration Options

```typescript
const SNOOZE_OPTIONS = [
  { label: '5 minutes', minutes: 5 },
  { label: '10 minutes', minutes: 10 },
  { label: '15 minutes', minutes: 15 },
];
```
