/**
 * DataProvider implementation for localStorage
 * Wraps existing storage.ts functions and adds export/import capabilities
 */

import { loadState, saveState, clearState } from './storage';
import {
  AppState,
  DataProvider,
  DataCategory,
  ExportPackage,
  ExportMetadata,
  ExportData,
  ImportMode,
  ImportResult,
  ImportWarning,
  DataSummary,
  EXPORT_FORMAT_VERSION,
  LAST_EXPORT_KEY,
  Context,
  Task,
  Reminder,
  SessionPreset,
} from './types';
import { needsMigration, migrateExportPackage } from './migration';

const STORAGE_KEY = 'vibe-schedule-state';
const APP_VERSION = '0.1.0'; // Should match package.json

/**
 * LocalStorage implementation of DataProvider
 */
export const localStorageProvider: DataProvider = {
  id: 'localStorage',
  name: 'Local Storage',

  async load(): Promise<AppState> {
    return loadState();
  },

  async save(state: AppState): Promise<void> {
    saveState(state);
  },

  async clear(): Promise<void> {
    clearState();
  },

  async createExport(categories: DataCategory[]): Promise<ExportPackage> {
    const state = loadState();
    const data: ExportData = {};

    // Build data payload based on selected categories
    if (categories.includes('contexts')) {
      data.contexts = state.contexts;
    }
    if (categories.includes('tasks')) {
      data.tasks = state.tasks;
    }
    if (categories.includes('reminders')) {
      data.reminders = state.reminders;
    }
    if (categories.includes('presets')) {
      data.presets = state.presets;
    }
    if (categories.includes('session')) {
      data.session = state.session;
    }
    if (categories.includes('preferences')) {
      data.preferences = {
        sidebarPreferences: state.sidebarPreferences,
        userLocation: state.userLocation,
        notificationPermission: state.notificationPermission,
      };
    }

    const meta: ExportMetadata = {
      version: EXPORT_FORMAT_VERSION,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      categories,
      counts: {
        contexts: state.contexts.length,
        tasks: state.tasks.length,
        reminders: state.reminders.length,
        presets: state.presets.length,
      },
    };

    return { meta, data };
  },

  async applyImport(pkg: ExportPackage, mode: ImportMode): Promise<ImportResult> {
    const warnings: ImportWarning[] = [];
    let migratedFrom: string | undefined;

    // Check if migration is needed
    if (needsMigration(pkg)) {
      const migrated = migrateExportPackage(pkg);
      if (!migrated) {
        return {
          success: false,
          mode,
          counts: {
            contextsImported: 0,
            tasksImported: 0,
            remindersImported: 0,
            presetsImported: 0,
            skipped: 0,
            renamed: 0,
            orphaned: 0,
          },
          warnings: [],
          error: `Cannot migrate from version ${pkg.meta.version}`,
        };
      }
      migratedFrom = pkg.meta.version;
      pkg = migrated;
      warnings.push({
        code: 'MIGRATED',
        message: `Data migrated from version ${migratedFrom} to ${EXPORT_FORMAT_VERSION}`,
      });
    }

    const currentState = loadState();
    let newState: AppState;

    if (mode === 'replace') {
      // Replace mode: start fresh with imported data
      newState = buildStateFromPackage(pkg, currentState);
    } else {
      // Merge mode: combine with existing data
      const mergeResult = mergeStateWithPackage(currentState, pkg);
      newState = mergeResult.state;
      warnings.push(...mergeResult.warnings);
    }

    // Save the new state
    try {
      saveState(newState);
    } catch (error) {
      // Handle localStorage quota exceeded error
      const errorMessage = error instanceof Error ? error.message : 'Failed to save imported data';
      const isQuotaError = error instanceof DOMException && (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        // Older Safari
        error.code === 22
      );

      return {
        success: false,
        mode,
        counts: {
          contextsImported: 0,
          tasksImported: 0,
          remindersImported: 0,
          presetsImported: 0,
          skipped: 0,
          renamed: 0,
          orphaned: 0,
        },
        warnings,
        error: isQuotaError
          ? 'Storage quota exceeded. Try clearing some browser data or using a smaller export file.'
          : errorMessage,
      };
    }

    // Calculate counts
    const counts = calculateImportCounts(pkg, mode, warnings);

    return {
      success: true,
      mode,
      counts,
      warnings,
      migratedFrom,
    };
  },

  validateExportPackage(data: unknown): ExportPackage | null {
    if (!data || typeof data !== 'object') {
      return null;
    }

    const obj = data as Record<string, unknown>;

    // Check for required top-level keys
    if (!obj.meta || !obj.data) {
      return null;
    }

    const meta = obj.meta as Record<string, unknown>;
    const exportData = obj.data as Record<string, unknown>;

    // Validate meta structure
    if (
      typeof meta.version !== 'string' ||
      typeof meta.appVersion !== 'string' ||
      typeof meta.exportedAt !== 'string' ||
      !Array.isArray(meta.categories) ||
      !meta.counts ||
      typeof meta.counts !== 'object'
    ) {
      return null;
    }

    // Validate counts structure
    const counts = meta.counts as Record<string, unknown>;
    if (
      typeof counts.contexts !== 'number' ||
      typeof counts.tasks !== 'number' ||
      typeof counts.reminders !== 'number' ||
      typeof counts.presets !== 'number'
    ) {
      return null;
    }

    // Validate data arrays if present
    if (exportData.contexts !== undefined && !Array.isArray(exportData.contexts)) {
      return null;
    }
    if (exportData.tasks !== undefined && !Array.isArray(exportData.tasks)) {
      return null;
    }
    if (exportData.reminders !== undefined && !Array.isArray(exportData.reminders)) {
      return null;
    }
    if (exportData.presets !== undefined && !Array.isArray(exportData.presets)) {
      return null;
    }

    return data as ExportPackage;
  },

  getDataSummary(): DataSummary {
    const state = loadState();
    const completedTasks = state.tasks.filter((t) => t.completed).length;

    // Estimate storage usage
    let storageUsedBytes = 0;
    if (typeof window !== 'undefined') {
      const serialized = localStorage.getItem(STORAGE_KEY);
      storageUsedBytes = serialized ? new Blob([serialized]).size : 0;
    }

    return {
      counts: {
        contexts: state.contexts.length,
        tasks: state.tasks.length,
        reminders: state.reminders.length,
        presets: state.presets.length,
        completedTasks,
        activeSession: state.session !== null,
      },
      lastExportedAt: this.getLastExportDate(),
      storageUsedBytes,
    };
  },

  getLastExportDate(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(LAST_EXPORT_KEY);
  },

  setLastExportDate(date: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(LAST_EXPORT_KEY, date);
  },
};

/**
 * Build a fresh AppState from an ExportPackage (for replace mode)
 */
function buildStateFromPackage(pkg: ExportPackage, currentState: AppState): AppState {
  return {
    contexts: pkg.data.contexts ?? [],
    tasks: pkg.data.tasks ?? [],
    reminders: pkg.data.reminders ?? [],
    presets: pkg.data.presets ?? [],
    session: pkg.data.session ?? null,
    mode: 'definition', // Always start in definition mode after import
    sidebarPreferences: pkg.data.preferences?.sidebarPreferences ?? currentState.sidebarPreferences,
    userLocation: pkg.data.preferences?.userLocation ?? currentState.userLocation,
    notificationPermission: pkg.data.preferences?.notificationPermission ?? currentState.notificationPermission,
  };
}

/**
 * Merge an ExportPackage with existing state (for merge mode)
 */
function mergeStateWithPackage(
  currentState: AppState,
  pkg: ExportPackage
): { state: AppState; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];

  // Merge contexts
  const { merged: mergedContexts, warnings: contextWarnings } = mergeContexts(
    currentState.contexts,
    pkg.data.contexts ?? []
  );
  warnings.push(...contextWarnings);

  // Build a set of valid context IDs for orphan detection
  const validContextIds = new Set(mergedContexts.map((c) => c.id));

  // Merge tasks (with orphan handling)
  const { merged: mergedTasks, warnings: taskWarnings } = mergeTasks(
    currentState.tasks,
    pkg.data.tasks ?? [],
    validContextIds
  );
  warnings.push(...taskWarnings);

  // Merge reminders
  const { merged: mergedReminders, warnings: reminderWarnings } = mergeReminders(
    currentState.reminders,
    pkg.data.reminders ?? []
  );
  warnings.push(...reminderWarnings);

  // Merge presets
  const { merged: mergedPresets, warnings: presetWarnings } = mergePresets(
    currentState.presets,
    pkg.data.presets ?? []
  );
  warnings.push(...presetWarnings);

  return {
    state: {
      ...currentState,
      contexts: mergedContexts,
      tasks: mergedTasks,
      reminders: mergedReminders,
      presets: mergedPresets,
      // Keep current session, mode, and preferences in merge mode
    },
    warnings,
  };
}

/**
 * Merge contexts: skip ID duplicates, rename name conflicts
 */
function mergeContexts(
  existing: Context[],
  imported: Context[]
): { merged: Context[]; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];
  const existingIds = new Set(existing.map((c) => c.id));
  const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));

  const newContexts = imported
    .filter((c) => {
      if (existingIds.has(c.id)) {
        warnings.push({
          code: 'ID_COLLISION',
          message: `Context "${c.name}" skipped (ID already exists)`,
          details: { entityType: 'contexts', entityId: c.id },
        });
        return false;
      }
      return true;
    })
    .map((c) => {
      if (existingNames.has(c.name.toLowerCase())) {
        const newName = `${c.name} (imported)`;
        warnings.push({
          code: 'NAME_CONFLICT',
          message: `Context renamed from "${c.name}" to "${newName}"`,
          details: {
            entityType: 'contexts',
            entityId: c.id,
            originalName: c.name,
            newName,
          },
        });
        return { ...c, name: newName };
      }
      return c;
    });

  return { merged: [...existing, ...newContexts], warnings };
}

/**
 * Merge tasks: skip ID duplicates, move orphans to inbox
 */
function mergeTasks(
  existing: Task[],
  imported: Task[],
  validContextIds: Set<string>
): { merged: Task[]; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];
  const existingIds = new Set(existing.map((t) => t.id));

  const newTasks = imported
    .filter((t) => {
      if (existingIds.has(t.id)) {
        warnings.push({
          code: 'ID_COLLISION',
          message: `Task "${t.title}" skipped (ID already exists)`,
          details: { entityType: 'tasks', entityId: t.id },
        });
        return false;
      }
      return true;
    })
    .map((t) => {
      // Check if task's context exists
      if (t.contextId !== null && !validContextIds.has(t.contextId)) {
        warnings.push({
          code: 'ORPHANED_TASK',
          message: `Task "${t.title}" moved to inbox (context not found)`,
          details: { entityType: 'tasks', entityId: t.id },
        });
        return { ...t, contextId: null };
      }
      return t;
    });

  return { merged: [...existing, ...newTasks], warnings };
}

/**
 * Merge reminders: skip ID duplicates
 */
function mergeReminders(
  existing: Reminder[],
  imported: Reminder[]
): { merged: Reminder[]; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];
  const existingIds = new Set(existing.map((r) => r.id));

  const newReminders = imported.filter((r) => {
    if (existingIds.has(r.id)) {
      warnings.push({
        code: 'ID_COLLISION',
        message: `Reminder "${r.title}" skipped (ID already exists)`,
        details: { entityType: 'reminders', entityId: r.id },
      });
      return false;
    }
    return true;
  });

  return { merged: [...existing, ...newReminders], warnings };
}

/**
 * Merge presets: skip ID duplicates, rename name conflicts
 */
function mergePresets(
  existing: SessionPreset[],
  imported: SessionPreset[]
): { merged: SessionPreset[]; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];
  const existingIds = new Set(existing.map((p) => p.id));
  const existingNames = new Set(existing.map((p) => p.name.toLowerCase()));

  const newPresets = imported
    .filter((p) => {
      if (existingIds.has(p.id)) {
        warnings.push({
          code: 'ID_COLLISION',
          message: `Preset "${p.name}" skipped (ID already exists)`,
          details: { entityType: 'presets', entityId: p.id },
        });
        return false;
      }
      return true;
    })
    .map((p) => {
      if (existingNames.has(p.name.toLowerCase())) {
        const newName = `${p.name} (imported)`;
        warnings.push({
          code: 'NAME_CONFLICT',
          message: `Preset renamed from "${p.name}" to "${newName}"`,
          details: {
            entityType: 'presets',
            entityId: p.id,
            originalName: p.name,
            newName,
          },
        });
        return { ...p, name: newName };
      }
      return p;
    });

  return { merged: [...existing, ...newPresets], warnings };
}

/**
 * Calculate import counts based on package and warnings
 */
function calculateImportCounts(
  pkg: ExportPackage,
  mode: ImportMode,
  warnings: ImportWarning[]
): ImportResult['counts'] {
  const skipped = warnings.filter((w) => w.code === 'ID_COLLISION').length;
  const renamed = warnings.filter((w) => w.code === 'NAME_CONFLICT').length;
  const orphaned = warnings.filter((w) => w.code === 'ORPHANED_TASK').length;

  if (mode === 'replace') {
    return {
      contextsImported: pkg.data.contexts?.length ?? 0,
      tasksImported: pkg.data.tasks?.length ?? 0,
      remindersImported: pkg.data.reminders?.length ?? 0,
      presetsImported: pkg.data.presets?.length ?? 0,
      skipped: 0,
      renamed: 0,
      orphaned: 0,
    };
  }

  // Merge mode: subtract skipped from totals
  const contextSkipped = warnings.filter(
    (w) => w.code === 'ID_COLLISION' && w.details?.entityType === 'contexts'
  ).length;
  const taskSkipped = warnings.filter(
    (w) => w.code === 'ID_COLLISION' && w.details?.entityType === 'tasks'
  ).length;
  const reminderSkipped = warnings.filter(
    (w) => w.code === 'ID_COLLISION' && w.details?.entityType === 'reminders'
  ).length;
  const presetSkipped = warnings.filter(
    (w) => w.code === 'ID_COLLISION' && w.details?.entityType === 'presets'
  ).length;

  return {
    contextsImported: (pkg.data.contexts?.length ?? 0) - contextSkipped,
    tasksImported: (pkg.data.tasks?.length ?? 0) - taskSkipped,
    remindersImported: (pkg.data.reminders?.length ?? 0) - reminderSkipped,
    presetsImported: (pkg.data.presets?.length ?? 0) - presetSkipped,
    skipped,
    renamed,
    orphaned,
  };
}
