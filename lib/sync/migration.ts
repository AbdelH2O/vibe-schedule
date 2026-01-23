/**
 * Migration module for migrating existing local data to cloud on first sign-in.
 * Handles ID remapping and foreign key reference updates.
 */

import { generateId, now } from '@/lib/storage';
import { getSupabaseProvider } from './supabaseProvider';
import type {
  AppState,
  Context,
  Task,
  Session,
  Reminder,
  SessionPreset,
  ContextAllocation,
} from '@/lib/types';

/**
 * Mapping of old IDs to new UUIDs
 */
export interface IdMapping {
  contexts: Record<string, string>;
  tasks: Record<string, string>;
  reminders: Record<string, string>;
  presets: Record<string, string>;
  sessions: Record<string, string>;
}

/**
 * Migration state for tracking progress
 */
export type MigrationState = 'idle' | 'pending' | 'in-progress' | 'complete' | 'error';

/**
 * Migration progress information
 */
export interface MigrationProgress {
  state: MigrationState;
  totalItems: number;
  processedItems: number;
  currentStep: string;
  error?: string;
}

/**
 * Check if an ID looks like a UUID (already migrated)
 */
function isUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Check if local data needs migration (has non-UUID IDs)
 */
export function needsMigration(state: AppState): boolean {
  // Check contexts
  for (const ctx of state.contexts) {
    if (!isUUID(ctx.id)) return true;
  }
  // Check tasks
  for (const task of state.tasks) {
    if (!isUUID(task.id)) return true;
  }
  // Check reminders
  for (const reminder of state.reminders || []) {
    if (!isUUID(reminder.id)) return true;
  }
  // Check presets
  for (const preset of state.presets || []) {
    if (!isUUID(preset.id)) return true;
  }
  // Check session
  if (state.session && !isUUID(state.session.id)) return true;

  return false;
}

/**
 * Generate ID mapping for all entities that need new UUIDs
 */
export function generateIdMapping(state: AppState): IdMapping {
  const mapping: IdMapping = {
    contexts: {},
    tasks: {},
    reminders: {},
    presets: {},
    sessions: {},
  };

  // Map context IDs
  for (const ctx of state.contexts) {
    if (!isUUID(ctx.id)) {
      mapping.contexts[ctx.id] = generateId();
    } else {
      mapping.contexts[ctx.id] = ctx.id; // Keep existing UUID
    }
  }

  // Map task IDs
  for (const task of state.tasks) {
    if (!isUUID(task.id)) {
      mapping.tasks[task.id] = generateId();
    } else {
      mapping.tasks[task.id] = task.id;
    }
  }

  // Map reminder IDs
  for (const reminder of state.reminders || []) {
    if (!isUUID(reminder.id)) {
      mapping.reminders[reminder.id] = generateId();
    } else {
      mapping.reminders[reminder.id] = reminder.id;
    }
  }

  // Map preset IDs
  for (const preset of state.presets || []) {
    if (!isUUID(preset.id)) {
      mapping.presets[preset.id] = generateId();
    } else {
      mapping.presets[preset.id] = preset.id;
    }
  }

  // Map session ID
  if (state.session) {
    if (!isUUID(state.session.id)) {
      mapping.sessions[state.session.id] = generateId();
    } else {
      mapping.sessions[state.session.id] = state.session.id;
    }
  }

  return mapping;
}

/**
 * Remap context with new ID
 */
function remapContext(ctx: Context, mapping: IdMapping): Context {
  return {
    ...ctx,
    id: mapping.contexts[ctx.id] || ctx.id,
    updatedAt: now(),
  };
}

/**
 * Remap task with new ID and contextId reference
 */
function remapTask(task: Task, mapping: IdMapping): Task {
  return {
    ...task,
    id: mapping.tasks[task.id] || task.id,
    contextId: task.contextId
      ? mapping.contexts[task.contextId] || task.contextId
      : null,
    updatedAt: now(),
  };
}

/**
 * Remap reminder with new ID
 */
function remapReminder(reminder: Reminder, mapping: IdMapping): Reminder {
  return {
    ...reminder,
    id: mapping.reminders[reminder.id] || reminder.id,
    updatedAt: now(),
  };
}

/**
 * Remap allocations with new context IDs
 */
function remapAllocations(
  allocations: ContextAllocation[],
  mapping: IdMapping
): ContextAllocation[] {
  return allocations.map((alloc) => ({
    ...alloc,
    contextId: mapping.contexts[alloc.contextId] || alloc.contextId,
  }));
}

/**
 * Remap preset with new ID and context references
 */
function remapPreset(preset: SessionPreset, mapping: IdMapping): SessionPreset {
  return {
    ...preset,
    id: mapping.presets[preset.id] || preset.id,
    allocations: remapAllocations(preset.allocations, mapping),
    contextIds: preset.contextIds?.map(
      (id) => mapping.contexts[id] || id
    ),
    updatedAt: now(),
  };
}

/**
 * Remap session with new IDs
 */
function remapSession(session: Session, mapping: IdMapping): Session {
  return {
    ...session,
    id: mapping.sessions[session.id] || session.id,
    allocations: remapAllocations(session.allocations, mapping),
    activeContextId: session.activeContextId
      ? mapping.contexts[session.activeContextId] || session.activeContextId
      : null,
  };
}

/**
 * Remap all entity IDs in the state
 */
export function remapEntityIds(state: AppState, mapping: IdMapping): AppState {
  return {
    ...state,
    contexts: state.contexts.map((ctx) => remapContext(ctx, mapping)),
    tasks: state.tasks.map((task) => remapTask(task, mapping)),
    reminders: (state.reminders || []).map((r) => remapReminder(r, mapping)),
    presets: (state.presets || []).map((p) => remapPreset(p, mapping)),
    session: state.session ? remapSession(state.session, mapping) : null,
  };
}

/**
 * Migrate local data to cloud.
 * This is the main orchestrator function for first-time sign-in migration.
 */
export async function migrateLocalDataToCloud(
  localState: AppState,
  onProgress?: (progress: MigrationProgress) => void
): Promise<{ success: boolean; error?: string; mapping?: IdMapping }> {
  const provider = getSupabaseProvider();

  if (!provider.isAuthenticated()) {
    return { success: false, error: 'Not authenticated' };
  }

  // Calculate total items
  const totalItems =
    localState.contexts.length +
    localState.tasks.length +
    (localState.reminders?.length || 0) +
    (localState.presets?.length || 0) +
    (localState.session ? 1 : 0);

  if (totalItems === 0) {
    return { success: true, mapping: generateIdMapping(localState) };
  }

  let processedItems = 0;

  const updateProgress = (step: string) => {
    onProgress?.({
      state: 'in-progress',
      totalItems,
      processedItems,
      currentStep: step,
    });
  };

  try {
    // Generate ID mapping
    updateProgress('Generating ID mappings...');
    const mapping = generateIdMapping(localState);

    // Migrate contexts first (other entities depend on them)
    updateProgress('Migrating contexts...');
    for (const ctx of localState.contexts) {
      const remapped = remapContext(ctx, mapping);
      await provider.upsertContext(remapped);
      processedItems++;
      updateProgress(`Migrating contexts (${processedItems}/${localState.contexts.length})...`);
    }

    // Migrate tasks
    updateProgress('Migrating tasks...');
    for (const task of localState.tasks) {
      const remapped = remapTask(task, mapping);
      await provider.upsertTask(remapped);
      processedItems++;
      updateProgress(`Migrating tasks (${processedItems - localState.contexts.length}/${localState.tasks.length})...`);
    }

    // Migrate reminders
    if (localState.reminders?.length) {
      updateProgress('Migrating reminders...');
      for (const reminder of localState.reminders) {
        const remapped = remapReminder(reminder, mapping);
        await provider.upsertReminder(remapped);
        processedItems++;
      }
    }

    // Migrate presets
    if (localState.presets?.length) {
      updateProgress('Migrating presets...');
      for (const preset of localState.presets) {
        const remapped = remapPreset(preset, mapping);
        await provider.upsertSessionPreset(remapped);
        processedItems++;
      }
    }

    // Migrate active session
    if (localState.session) {
      updateProgress('Migrating session...');
      const remapped = remapSession(localState.session, mapping);
      await provider.upsertSession(remapped);
      processedItems++;
    }

    // Migrate preferences
    updateProgress('Migrating preferences...');
    await provider.upsertUserPreferences({
      sidebarPreferences: localState.sidebarPreferences,
      userLocation: localState.userLocation,
      notificationPermission: localState.notificationPermission,
    });

    onProgress?.({
      state: 'complete',
      totalItems,
      processedItems: totalItems,
      currentStep: 'Migration complete',
    });

    return { success: true, mapping };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onProgress?.({
      state: 'error',
      totalItems,
      processedItems,
      currentStep: 'Migration failed',
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}
