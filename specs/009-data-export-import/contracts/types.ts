/**
 * Export/Import Types Contract
 * Feature: 009-data-export-import
 *
 * These types will be added to lib/types.ts during implementation.
 * This file serves as the contract specification.
 */

import type {
  AppState,
  Context,
  Task,
  Reminder,
  SessionPreset,
  Session,
  SidebarPreferences,
  UserLocation,
} from '../../../lib/types';

// ============================================
// Data Categories
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

// ============================================
// Export Package Types
// ============================================

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

// ============================================
// Import Types
// ============================================

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

// ============================================
// Data Summary Types
// ============================================

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

// ============================================
// DataProvider Interface
// ============================================

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

// ============================================
// Constants
// ============================================

/** Current export format version */
export const EXPORT_FORMAT_VERSION = '1.0.0';

/** File extension for exports */
export const EXPORT_FILE_EXTENSION = '.json';

/** Default filename pattern */
export const EXPORT_FILENAME_PATTERN = 'vibe-schedule-export-{date}.json';

/** localStorage key for last export date */
export const LAST_EXPORT_KEY = 'vibe-schedule-last-export';
