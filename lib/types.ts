// Core entity types for Vibe-Schedule

import type { ContextColorName } from './colors';

// ============================================
// Sync Metadata Types (Cross-Device Sync)
// ============================================

/**
 * Sync metadata applied to all syncable entities.
 * Enables conflict resolution and soft delete.
 */
export interface SyncMetadata {
  /** Server-assigned sequence number for ordering */
  syncVersion: number;
  /** Device ID that made the last change */
  lastModifiedBy: string;
  /** ISO timestamp for soft delete (null = active) */
  deletedAt: string | null;
  /** User's auth.users.id (owner of this entity) */
  userId: string;
}

/**
 * Device information for tracking connected devices.
 */
export interface DeviceInfo {
  /** UUID, generated once per device */
  id: string;
  /** User-friendly name (optional) */
  name: string | null;
  /** Browser/OS info for identification */
  userAgent: string;
  /** Last activity timestamp */
  lastSeenAt: string;
  /** When the device was first registered */
  createdAt: string;
}

/**
 * Operation type for offline queue entries.
 */
export type OutboxOperation = 'create' | 'update' | 'delete';

/**
 * An entry in the offline change queue.
 * Persisted to localStorage for offline-first sync.
 */
export interface OutboxEntry {
  /** UUID */
  id: string;
  /** Which entity type this change affects */
  entityType: DataCategory;
  /** ID of the affected entity */
  entityId: string;
  /** What operation was performed */
  operation: OutboxOperation;
  /** Entity data (for create/update) or null (delete) */
  payload: unknown;
  /** When the change was made */
  createdAt: string;
  /** Retry count */
  attempts: number;
  /** Last sync attempt timestamp */
  lastAttemptAt: string | null;
  /** Last error message */
  error: string | null;
}

/**
 * User preferences synced across devices.
 * 1:1 relationship with user (id = user's auth.users.id).
 */
export interface UserPreferences {
  /** User's auth.users.id (1:1 with user) */
  id: string;
  /** Sidebar display preferences */
  sidebarPreferences: SidebarPreferences;
  /** User location for prayer times */
  userLocation: UserLocation | null;
  /** Browser notification permission state */
  notificationPermission: 'default' | 'granted' | 'denied';
  /** Sync metadata */
  syncVersion: number;
  lastModifiedBy: string;
  updatedAt: string;
}

/**
 * Session ownership tracking for timer handoff between devices.
 */
export interface SessionOwnership {
  /** Which device owns the timer */
  activeDeviceId: string | null;
  /** When ownership was claimed */
  ownershipClaimedAt: string | null;
}

/**
 * Sync status for UI indicators.
 */
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

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
  // Sync metadata (optional for offline-first compatibility)
  userId?: string;
  syncVersion?: number;
  lastModifiedBy?: string;
  deletedAt?: string | null;
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
  // Sync metadata (optional for offline-first compatibility)
  userId?: string;
  syncVersion?: number;
  lastModifiedBy?: string;
  deletedAt?: string | null;
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
  // Sync metadata (optional for offline-first compatibility)
  userId?: string;
  syncVersion?: number;
  lastModifiedBy?: string;
  deletedAt?: string | null;
  // Ownership tracking for timer handoff between devices
  activeDeviceId?: string | null;
  ownershipClaimedAt?: string | null;
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
  // Sync metadata (optional for offline-first compatibility)
  userId?: string;
  syncVersion?: number;
  lastModifiedBy?: string;
  deletedAt?: string | null;
  updatedAt?: string; // Added for LWW conflict resolution
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
  // Sync metadata (optional for offline-first compatibility)
  userId?: string;
  syncVersion?: number;
  lastModifiedBy?: string;
  deletedAt?: string | null;
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

// ============================================
// Data Export & Import Types
// ============================================

/**
 * Enumeration of exportable data categories.
 * Used for selective export functionality.
 */
export type DataCategory =
  | 'contexts'
  | 'tasks'
  | 'reminders'
  | 'presets'
  | 'session'
  | 'preferences';

/**
 * All available data categories for UI checkboxes
 */
export const ALL_DATA_CATEGORIES: DataCategory[] = [
  'contexts',
  'tasks',
  'reminders',
  'presets',
  'session',
  'preferences',
];

/** Current export format version */
export const EXPORT_FORMAT_VERSION = '1.0.0';

/** localStorage key for last export date */
export const LAST_EXPORT_KEY = 'vibe-schedule-last-export';

/**
 * Metadata embedded in every export file.
 * Enables versioning, migration, and validation.
 */
export interface ExportMetadata {
  /** Export format version (semver) */
  version: string;
  /** App version at export time */
  appVersion: string;
  /** ISO 8601 timestamp of export */
  exportedAt: string;
  /** Which data categories are included */
  categories: DataCategory[];
  /** Count of items per category */
  counts: {
    contexts: number;
    tasks: number;
    reminders: number;
    presets: number;
  };
}

/**
 * The actual data payload within an export.
 * Keys are optional based on selected categories.
 */
export interface ExportData {
  contexts?: Context[];
  tasks?: Task[];
  reminders?: Reminder[];
  presets?: SessionPreset[];
  session?: Session | null;
  preferences?: {
    sidebarPreferences: SidebarPreferences;
    userLocation: UserLocation | null;
    notificationPermission: 'default' | 'granted' | 'denied';
  };
}

/**
 * Complete export file structure.
 * This is what gets serialized to JSON.
 */
export interface ExportPackage {
  meta: ExportMetadata;
  data: ExportData;
}

/**
 * Import behavior mode.
 * - replace: Clear existing data, apply imported data
 * - merge: Combine imported with existing (skip ID dupes, rename name conflicts)
 */
export type ImportMode = 'replace' | 'merge';

/**
 * Warning codes for non-fatal import issues.
 */
export type ImportWarningCode =
  | 'ID_COLLISION'    // Skipped due to existing ID (merge mode)
  | 'NAME_CONFLICT'   // Renamed due to existing name (merge mode)
  | 'ORPHANED_TASK'   // Task moved to inbox (missing context)
  | 'MIGRATED';       // Data was migrated from older version

/**
 * Non-fatal issue encountered during import.
 */
export interface ImportWarning {
  code: ImportWarningCode;
  message: string;
  details?: {
    entityType: DataCategory;
    entityId: string;
    originalName?: string;
    newName?: string;
  };
}

/**
 * Result of an import operation.
 */
export interface ImportResult {
  /** Whether import completed successfully */
  success: boolean;
  /** Mode used for this import */
  mode: ImportMode;
  /** Counts of items processed */
  counts: {
    contextsImported: number;
    tasksImported: number;
    remindersImported: number;
    presetsImported: number;
    skipped: number;    // Due to ID collisions (merge mode)
    renamed: number;    // Due to name conflicts (merge mode)
    orphaned: number;   // Tasks moved to inbox (missing context)
  };
  /** Non-fatal warnings */
  warnings: ImportWarning[];
  /** Error message if success === false */
  error?: string;
  /** Original version if migration occurred */
  migratedFrom?: string;
}

/**
 * Summary of current data for Data Management UI.
 */
export interface DataSummary {
  counts: {
    contexts: number;
    tasks: number;
    reminders: number;
    presets: number;
    completedTasks: number;
    activeSession: boolean;
  };
  /** ISO timestamp of last export, or null if never */
  lastExportedAt: string | null;
  /** Approximate localStorage usage in bytes */
  storageUsedBytes: number;
}

/**
 * Abstract interface for storage operations.
 * localStorage implements this first; future cloud providers will too.
 */
export interface DataProvider {
  /** Unique identifier for this provider */
  readonly id: string;
  /** Display name */
  readonly name: string;

  // --- Core State Operations ---

  /** Load current state from storage */
  load(): Promise<AppState>;
  /** Save state to storage (atomic) */
  save(state: AppState): Promise<void>;
  /** Clear all data */
  clear(): Promise<void>;

  // --- Export/Import Operations ---

  /** Create export package from current state */
  createExport(categories: DataCategory[]): Promise<ExportPackage>;
  /** Apply import to current state */
  applyImport(pkg: ExportPackage, mode: ImportMode): Promise<ImportResult>;

  // --- Validation ---

  /** Validate and parse an export package, returns null if invalid */
  validateExportPackage(data: unknown): ExportPackage | null;

  // --- Metadata ---

  /** Get summary of current data */
  getDataSummary(): DataSummary;
  /** Get last export timestamp */
  getLastExportDate(): string | null;
  /** Update last export timestamp */
  setLastExportDate(date: string): void;
}
