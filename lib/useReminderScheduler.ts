'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from './store';
import { getNextTriggerTime } from './reminders';
import { showBrowserNotification } from './notifications';
import { getPrayerTimesForToday, getNextPrayerTime } from './prayerTimes';
import type { Reminder, TriggeredNotification, DailyPrayerTimes, PrayerReminderConfig } from './types';

const SCHEDULER_INTERVAL_MS = 1000; // Check every second

/**
 * Hook that manages the reminder scheduler
 * Checks reminders every second and triggers notifications when due
 */
export function useReminderScheduler() {
  const {
    state,
    isHydrated,
    getEnabledReminders,
    updateReminderLastTriggered,
    triggerNotification,
    notificationState,
  } = useStore();

  const lastCheckRef = useRef<number>(0);
  const snoozedNotificationsRef = useRef<Map<string, TriggeredNotification>>(new Map());
  const prayerTimesRef = useRef<DailyPrayerTimes | null>(null);
  const lastPrayerFetchRef = useRef<string>('');

  // Process snoozed notifications
  const processSnoozedNotifications = useCallback(() => {
    const now = new Date();
    const { notificationQueue } = notificationState;

    // Check snoozed notifications in the queue
    notificationQueue.forEach((notification) => {
      if (notification.status === 'snoozed' && notification.snoozedUntil) {
        const snoozeEnd = new Date(notification.snoozedUntil);
        if (now >= snoozeEnd) {
          // Re-trigger the notification by updating its status
          // The notification is already in the queue, it will be processed when active notification is cleared
        }
      }
    });
  }, [notificationState]);

  // Fetch prayer times for today if needed
  const fetchPrayerTimesIfNeeded = useCallback(async () => {
    if (!state.userLocation) return;

    const today = new Date().toISOString().split('T')[0];
    if (lastPrayerFetchRef.current === today && prayerTimesRef.current) {
      return; // Already fetched today
    }

    try {
      const times = await getPrayerTimesForToday(state.userLocation);
      if (times) {
        prayerTimesRef.current = times;
        lastPrayerFetchRef.current = today;
      }
    } catch (error) {
      console.error('Failed to fetch prayer times:', error);
    }
  }, [state.userLocation]);

  // Check prayer time reminders
  const checkPrayerReminders = useCallback(
    (reminder: Reminder, now: Date) => {
      if (reminder.config.type !== 'prayer') return;
      if (!prayerTimesRef.current) return;

      const config = reminder.config as PrayerReminderConfig;
      const nextPrayer = getNextPrayerTime(prayerTimesRef.current, config.prayers, now);

      if (!nextPrayer) return;

      // Apply offset
      const triggerTime = new Date(nextPrayer.time.getTime() - config.minutesBefore * 60 * 1000);

      // Check if we should trigger (within 1 second window)
      const diff = triggerTime.getTime() - now.getTime();
      if (diff <= 0 && diff > -SCHEDULER_INTERVAL_MS) {
        // Update last triggered to prevent duplicate triggers
        updateReminderLastTriggered(reminder.id, now.toISOString());

        // Create prayer-specific notification
        const message =
          config.minutesBefore > 0
            ? `${config.minutesBefore} minutes until ${nextPrayer.prayer}`
            : `Time for ${nextPrayer.prayer} prayer`;

        showBrowserNotification(
          reminder.title || `${nextPrayer.prayer} Prayer`,
          message,
          `${reminder.id}-${nextPrayer.prayer}`,
          () => window.focus()
        );

        triggerNotification({
          reminderId: reminder.id,
          title: reminder.title || `${nextPrayer.prayer} Prayer`,
          message,
        });
      }
    },
    [updateReminderLastTriggered, triggerNotification]
  );

  // Check and trigger reminders
  const checkReminders = useCallback(() => {
    if (!isHydrated) return;

    const now = new Date();
    const enabledReminders = getEnabledReminders();
    const isSessionActive = state.session?.status === 'active';

    enabledReminders.forEach((reminder) => {
      // Skip session-only reminders when not in an active session
      if (reminder.scope === 'session-only' && !isSessionActive) {
        return;
      }

      if (reminder.config.type === 'prayer') {
        // Handle prayer reminders
        checkPrayerReminders(reminder, now);
      } else {
        // Handle interval and fixed-time reminders
        const nextTrigger = getNextTriggerTime(reminder, now);
        if (!nextTrigger) return;

        // Check if we should trigger (within 1 second window)
        const diff = nextTrigger.getTime() - now.getTime();
        if (diff <= 0 && diff > -SCHEDULER_INTERVAL_MS) {
          // Trigger the reminder
          handleReminderTrigger(reminder);
        }
      }
    });

    // Process any snoozed notifications that are ready
    processSnoozedNotifications();

    lastCheckRef.current = now.getTime();
  }, [isHydrated, getEnabledReminders, checkPrayerReminders, processSnoozedNotifications, state.session?.status]);

  // Handle triggering a reminder
  const handleReminderTrigger = useCallback(
    (reminder: Reminder) => {
      const now = new Date().toISOString();

      // Update last triggered time
      updateReminderLastTriggered(reminder.id, now);

      // Create notification content
      const message = reminder.message || getDefaultMessage(reminder);

      // Try to show browser notification
      showBrowserNotification(
        reminder.title,
        message,
        reminder.id,
        () => {
          // Focus window on click
          window.focus();
        }
      );

      // Trigger in-app notification (modal)
      triggerNotification({
        reminderId: reminder.id,
        title: reminder.title,
        message,
      });
    },
    [updateReminderLastTriggered, triggerNotification]
  );

  // Fetch prayer times on mount and when location changes
  useEffect(() => {
    if (!isHydrated) return;
    fetchPrayerTimesIfNeeded();
  }, [isHydrated, fetchPrayerTimesIfNeeded]);

  // Set up the scheduler interval
  useEffect(() => {
    if (!isHydrated) return;

    const intervalId = setInterval(checkReminders, SCHEDULER_INTERVAL_MS);

    // Also check immediately on mount and when visibility changes
    checkReminders();

    // Handle visibility change (tab becomes visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkReminders();
        // Refresh prayer times when tab becomes visible (in case it's a new day)
        fetchPrayerTimesIfNeeded();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHydrated, checkReminders, fetchPrayerTimesIfNeeded]);

  // Return nothing - this hook just sets up the scheduler
  return null;
}

/**
 * Generate default message based on reminder type
 */
function getDefaultMessage(reminder: Reminder): string {
  switch (reminder.config.type) {
    case 'interval':
      return `Time for your ${reminder.config.intervalMinutes}-minute reminder`;
    case 'fixed-time':
      return `Scheduled reminder for ${reminder.config.time}`;
    case 'prayer':
      return 'Prayer time reminder';
    default:
      return 'Time for your reminder';
  }
}
