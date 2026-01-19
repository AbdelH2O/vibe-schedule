// Reminder scheduling utilities

import {
  Reminder,
  ReminderConfig,
  FixedTimeReminderConfig,
  DayOfWeek,
} from './types';

/**
 * Calculate the next trigger time for a reminder
 * Returns null if the reminder is disabled or cannot be scheduled
 */
export function getNextTriggerTime(reminder: Reminder, now: Date = new Date()): Date | null {
  if (!reminder.enabled) return null;

  switch (reminder.config.type) {
    case 'interval':
      return getNextIntervalTrigger(reminder, now);
    case 'fixed-time':
      return getNextFixedTimeTrigger(reminder.config, now);
    case 'prayer':
      // Prayer time triggers are handled separately via prayerTimes.ts
      return null;
  }
}

/**
 * Calculate next trigger time for interval-based reminders
 */
function getNextIntervalTrigger(reminder: Reminder, now: Date): Date {
  const lastTriggered = reminder.lastTriggeredAt
    ? new Date(reminder.lastTriggeredAt)
    : new Date(reminder.createdAt);

  const intervalMs = (reminder.config as { intervalMinutes: number }).intervalMinutes * 60 * 1000;
  let nextTrigger = new Date(lastTriggered.getTime() + intervalMs);

  // Strip milliseconds to align with scheduler second boundaries
  // This prevents timing race conditions where the scheduler checks at
  // second boundaries but trigger times have millisecond offsets
  nextTrigger.setMilliseconds(0);

  // If next trigger is in the past, calculate the next future trigger
  // This handles cases where the app was closed for a while
  while (nextTrigger < now) {
    nextTrigger = new Date(nextTrigger.getTime() + intervalMs);
  }

  return nextTrigger;
}

/**
 * Calculate next trigger time for fixed-time reminders
 */
export function getNextFixedTimeTrigger(config: FixedTimeReminderConfig, now: Date): Date {
  const [hours, minutes] = config.time.split(':').map(Number);

  // Start from today
  const candidate = new Date(now);
  candidate.setHours(hours, minutes, 0, 0);

  // If today's time has passed, start from tomorrow
  if (candidate < now) {
    candidate.setDate(candidate.getDate() + 1);
  }

  // If days are specified, find the next matching day
  if (config.days && config.days.length > 0) {
    // Search up to 7 days to find a matching day
    for (let i = 0; i < 7; i++) {
      const dayOfWeek = candidate.getDay() as DayOfWeek;
      if (config.days.includes(dayOfWeek)) {
        return candidate;
      }
      candidate.setDate(candidate.getDate() + 1);
    }
  }

  return candidate;
}

/**
 * Check if a reminder is overdue (missed its trigger window)
 * Returns true if the reminder should have triggered but hasn't
 *
 * This handles cases where:
 * - Browser throttled background tabs
 * - System sleep/wake
 * - High CPU usage delayed setInterval
 * - Page visibility changes
 */
export function isReminderOverdue(reminder: Reminder, now: Date = new Date()): boolean {
  if (!reminder.enabled) return false;
  if (reminder.config.type === 'prayer') return false; // Prayer handled separately

  const lastTriggered = reminder.lastTriggeredAt
    ? new Date(reminder.lastTriggeredAt)
    : new Date(reminder.createdAt);

  if (reminder.config.type === 'interval') {
    const intervalMs = reminder.config.intervalMinutes * 60 * 1000;
    const expectedTriggerTime = new Date(lastTriggered.getTime() + intervalMs);
    expectedTriggerTime.setMilliseconds(0);

    // Overdue if we're more than 1 second past expected trigger
    // (1 second is the normal trigger window)
    return now.getTime() > expectedTriggerTime.getTime() + 1000;
  }

  if (reminder.config.type === 'fixed-time') {
    const config = reminder.config;
    const [hours, minutes] = config.time.split(':').map(Number);
    const todayTrigger = new Date(now);
    todayTrigger.setHours(hours, minutes, 0, 0);

    // Check if today is a valid day (if days are specified)
    if (config.days && config.days.length > 0 && config.days.length < 7) {
      const dayOfWeek = now.getDay() as DayOfWeek;
      if (!config.days.includes(dayOfWeek)) {
        return false; // Today is not a scheduled day
      }
    }

    // Only overdue if: today's trigger time has passed AND we haven't triggered today
    const triggeredToday = lastTriggered.toDateString() === now.toDateString() &&
                          lastTriggered >= todayTrigger;

    return now > todayTrigger && !triggeredToday;
  }

  return false;
}

/**
 * Check if a reminder should trigger right now
 */
export function shouldTriggerNow(reminder: Reminder, now: Date = new Date()): boolean {
  if (!reminder.enabled) return false;

  const nextTrigger = getNextTriggerTime(reminder, now);
  if (!nextTrigger) return false;

  // Trigger if we're within 1 second of the scheduled time
  const diff = nextTrigger.getTime() - now.getTime();
  return diff <= 0 && diff > -1000;
}

/**
 * Format a reminder's schedule for display
 */
export function formatReminderSchedule(config: ReminderConfig): string {
  switch (config.type) {
    case 'interval':
      const mins = config.intervalMinutes;
      if (mins < 60) {
        return `Every ${mins} minute${mins === 1 ? '' : 's'}`;
      }
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      if (remainingMins === 0) {
        return `Every ${hours} hour${hours === 1 ? '' : 's'}`;
      }
      return `Every ${hours}h ${remainingMins}m`;

    case 'fixed-time':
      const timeStr = config.time;
      const daysStr = formatDaysOfWeek(config.days);
      return daysStr ? `${timeStr} on ${daysStr}` : `Daily at ${timeStr}`;

    case 'prayer':
      const prayers = config.prayers.join(', ');
      const offset = config.minutesBefore;
      if (offset === 0) {
        return `At ${prayers}`;
      }
      return `${offset}min before ${prayers}`;
  }
}

/**
 * Format days of week for display
 */
function formatDaysOfWeek(days: DayOfWeek[] | undefined): string {
  if (!days || days.length === 0 || days.length === 7) {
    return ''; // Every day
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check for weekdays (Mon-Fri)
  if (days.length === 5 &&
      days.includes(1) && days.includes(2) && days.includes(3) &&
      days.includes(4) && days.includes(5) &&
      !days.includes(0) && !days.includes(6)) {
    return 'Weekdays';
  }

  // Check for weekends (Sat-Sun)
  if (days.length === 2 && days.includes(0) && days.includes(6)) {
    return 'Weekends';
  }

  return days.map(d => dayNames[d]).join(', ');
}

/**
 * Format time until next trigger for display
 */
export function formatTimeUntilTrigger(nextTrigger: Date | null, now: Date = new Date()): string {
  if (!nextTrigger) return 'Not scheduled';

  const diff = nextTrigger.getTime() - now.getTime();
  if (diff <= 0) return 'Now';

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `in ${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `in ${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `in ${minutes}m`;
  }
  return 'in less than a minute';
}

/**
 * Validate reminder interval (1-1440 minutes)
 */
export function validateIntervalMinutes(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 1440;
}

/**
 * Validate time string format (HH:MM)
 */
export function validateTimeString(time: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}
