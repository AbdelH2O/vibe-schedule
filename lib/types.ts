// Core entity types for Vibe-Schedule

import type { ContextColorName } from './colors';

export interface Context {
  id: string;
  name: string;
  priority: number; // 1-5, where 1 = highest priority, 5 = lowest
  color: ContextColorName; // Color for visual differentiation
  minDuration?: number; // minutes
  maxDuration?: number; // minutes
  weight: number; // relative weight for time distribution (default 1)
  importantDates?: ImportantDate[];
  createdAt: string;
  updatedAt: string;
}

export interface ImportantDate {
  id: string;
  label: string;
  date: string; // ISO date string
}

export interface Task {
  id: string;
  title: string;
  description?: string; // Optional task details
  contextId: string | null; // null = inbox
  deadline?: string; // ISO date string, display only
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// App mode - Definition (planning) vs Working (executing)
export type AppMode = 'definition' | 'working';

// Session state for working mode
export interface Session {
  id: string;
  totalDuration: number; // total session time in minutes
  startedAt: string;
  allocations: ContextAllocation[];
  activeContextId: string | null;
  contextStartedAt: string | null; // when current context began
  status: 'active' | 'paused' | 'suspended' | 'completed';
}

export interface ContextAllocation {
  contextId: string;
  allocatedMinutes: number;    // Original allocation (immutable after session start)
  usedMinutes: number;
  adjustedMinutes: number;     // Runtime adjustment (+/-), default 0
}

// Complete app state stored in localStorage
export interface AppState {
  contexts: Context[];
  tasks: Task[];
  mode: AppMode;
  session: Session | null;
  presets: SessionPreset[];
  // Reminder-related fields
  reminders: Reminder[];
  userLocation: UserLocation | null;
  notificationPermission: 'default' | 'granted' | 'denied';
  // Sidebar preferences
  sidebarPreferences: SidebarPreferences;
}

// Runtime state for notifications (not persisted to localStorage)
export interface NotificationRuntimeState {
  activeNotification: TriggeredNotification | null;
  notificationQueue: TriggeredNotification[];
  isPausedByReminder: boolean;
}

// Default/initial state
export const INITIAL_STATE: AppState = {
  contexts: [],
  tasks: [],
  mode: 'definition',
  session: null,
  presets: [],
  // Reminder-related fields
  reminders: [],
  userLocation: null,
  notificationPermission: 'default',
  // Sidebar preferences
  sidebarPreferences: {
    deadlineScopeFilter: 'all',
  },
};

// Inbox constant - tasks with contextId: null are in inbox
export const INBOX_ID = null;

// Deadline urgency levels for visual styling
export type DeadlineUrgency = 'overdue' | 'urgent' | 'warning' | 'neutral';

// Sidebar preferences - deadline scope filter
export type DeadlineScopeFilter = 'all' | 'active-context';

export interface SidebarPreferences {
  /**
   * Controls which deadlines are displayed in the Important Dates tab.
   * - 'all': Show deadlines from all contexts in the current session
   * - 'active-context': Show only deadlines from the currently active context
   */
  deadlineScopeFilter: DeadlineScopeFilter;
}

// Countdown display information
export interface CountdownDisplay {
  text: string;
  urgency: DeadlineUrgency;
}

// Time progress status for visualizations
export type TimeProgressStatus = 'normal' | 'warning' | 'urgent' | 'overtime';

// Time progress information for progress bars
export interface TimeProgress {
  percentage: number; // 0-100+, can exceed 100 for overtime
  status: TimeProgressStatus;
  remaining: number; // minutes, negative if overtime
}

// User-saved session presets
export interface SessionPreset {
  id: string;
  name: string;
  totalDuration: number; // minutes
  allocations: ContextAllocation[];
  contextIds?: string[]; // which contexts were selected (for restoration)
  createdAt: string;
}

// ============================================
// Reminders & Notifications Types
// ============================================

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

/**
 * Predefined reminder templates
 */
export const REMINDER_TEMPLATES: ReminderTemplate[] = [
  // Health
  {
    id: 'water-hourly',
    name: 'Hourly Water Reminder',
    description: 'Stay hydrated with hourly reminders to drink water',
    category: 'Health',
    defaultConfig: { type: 'interval', intervalMinutes: 60 },
    icon: 'droplet',
  },
  {
    id: 'eye-rest-20-20-20',
    name: '20-20-20 Eye Rest Rule',
    description: 'Every 20 minutes, look at something 20 feet away for 20 seconds',
    category: 'Health',
    defaultConfig: { type: 'interval', intervalMinutes: 20 },
    icon: 'eye',
  },
  {
    id: 'stretch-break',
    name: 'Stretch Break',
    description: 'Take a short break to stretch and move around',
    category: 'Health',
    defaultConfig: { type: 'interval', intervalMinutes: 45 },
    icon: 'activity',
  },
  // Productivity
  {
    id: 'pomodoro-break',
    name: 'Pomodoro Break',
    description: '25 minutes work, 5 minutes break',
    category: 'Productivity',
    defaultConfig: { type: 'interval', intervalMinutes: 25 },
    icon: 'timer',
  },
  // Religious
  {
    id: 'prayer-times',
    name: 'Islamic Prayer Times',
    description: 'Get notified for Fajr, Dhuhr, Asr, Maghrib, and Isha prayers',
    category: 'Religious',
    defaultConfig: { type: 'prayer', requiresLocation: true },
    icon: 'moon',
  },
];
