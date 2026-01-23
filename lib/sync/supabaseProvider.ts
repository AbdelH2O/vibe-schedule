/**
 * Supabase DataProvider implementation for cross-device sync.
 * Implements the DataProvider interface for cloud storage operations.
 */

import { createClient } from '@/lib/supabase/client';
import { getOrCreateDeviceId } from '@/lib/device';
import { now } from '@/lib/storage';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AppState,
  Context,
  Task,
  Session,
  Reminder,
  SessionPreset,
  UserPreferences,
  DataProvider,
  DataCategory,
  ExportPackage,
  ImportMode,
  ImportResult,
  DataSummary,
  INITIAL_STATE,
} from '@/lib/types';

// Database table names
const TABLES = {
  contexts: 'contexts',
  tasks: 'tasks',
  sessions: 'sessions',
  reminders: 'reminders',
  sessionPresets: 'session_presets',
  userPreferences: 'user_preferences',
  devices: 'devices',
} as const;

/**
 * Convert snake_case database row to camelCase entity
 */
function toCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

/**
 * Convert camelCase entity to snake_case for database
 */
function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

export class SupabaseDataProvider implements Partial<DataProvider> {
  readonly id = 'supabase';
  readonly name = 'Supabase Cloud';

  private supabase: SupabaseClient;
  private userId: string | null = null;
  private deviceId: string;

  constructor() {
    this.supabase = createClient();
    this.deviceId = getOrCreateDeviceId();
  }

  /**
   * Set the current user ID (called after authentication)
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Get the current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Check if the provider is authenticated
   */
  isAuthenticated(): boolean {
    return this.userId !== null;
  }

  // ===== Core State Operations =====

  /**
   * Fetch all user data from Supabase.
   * Called on sign-in to load cloud data.
   */
  async fetchAllUserData(): Promise<Partial<AppState>> {
    if (!this.userId) {
      throw new Error('Not authenticated');
    }

    const [
      contextsResult,
      tasksResult,
      sessionsResult,
      remindersResult,
      presetsResult,
      preferencesResult,
    ] = await Promise.all([
      this.supabase.from(TABLES.contexts).select('*'),
      this.supabase.from(TABLES.tasks).select('*'),
      this.supabase.from(TABLES.sessions).select('*'),
      this.supabase.from(TABLES.reminders).select('*'),
      this.supabase.from(TABLES.sessionPresets).select('*'),
      this.supabase.from(TABLES.userPreferences).select('*').single(),
    ]);

    // Convert snake_case to camelCase for all results
    const contexts = (contextsResult.data || []).map((row) => toCamelCase<Context>(row));
    const tasks = (tasksResult.data || []).map((row) => toCamelCase<Task>(row));
    const sessions = (sessionsResult.data || []).map((row) => toCamelCase<Session>(row));
    const reminders = (remindersResult.data || []).map((row) => toCamelCase<Reminder>(row));
    const presets = (presetsResult.data || []).map((row) => toCamelCase<SessionPreset>(row));

    // Get the most recent non-completed session (if any)
    const activeSession = sessions.find(
      (s) => s.status === 'active' || s.status === 'paused' || s.status === 'suspended'
    ) || null;

    // Build preferences from result or use defaults
    const preferences = preferencesResult.data
      ? toCamelCase<UserPreferences>(preferencesResult.data)
      : null;

    return {
      contexts,
      tasks,
      session: activeSession,
      presets,
      reminders,
      userLocation: preferences?.userLocation ?? null,
      notificationPermission: preferences?.notificationPermission ?? 'default',
      sidebarPreferences: preferences?.sidebarPreferences ?? { deadlineScopeFilter: 'all' },
    };
  }

  // ===== Upsert Operations =====

  /**
   * Upsert a context to Supabase
   */
  async upsertContext(context: Context): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const row = {
      ...toSnakeCase(context as unknown as Record<string, unknown>),
      user_id: this.userId,
      last_modified_by: this.deviceId,
      updated_at: now(),
    };

    const { error } = await this.supabase
      .from(TABLES.contexts)
      .upsert(row, { onConflict: 'id' });

    if (error) throw error;
  }

  /**
   * Upsert a task to Supabase
   */
  async upsertTask(task: Task): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const row = {
      ...toSnakeCase(task as unknown as Record<string, unknown>),
      user_id: this.userId,
      last_modified_by: this.deviceId,
      updated_at: now(),
    };

    const { error } = await this.supabase
      .from(TABLES.tasks)
      .upsert(row, { onConflict: 'id' });

    if (error) throw error;
  }

  /**
   * Upsert a session to Supabase
   */
  async upsertSession(session: Session): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const row = {
      ...toSnakeCase(session as unknown as Record<string, unknown>),
      user_id: this.userId,
      last_modified_by: this.deviceId,
      updated_at: now(),
    };

    const { error } = await this.supabase
      .from(TABLES.sessions)
      .upsert(row, { onConflict: 'id' });

    if (error) throw error;
  }

  /**
   * Upsert a reminder to Supabase
   */
  async upsertReminder(reminder: Reminder): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const row = {
      ...toSnakeCase(reminder as unknown as Record<string, unknown>),
      user_id: this.userId,
      last_modified_by: this.deviceId,
      updated_at: now(),
    };

    const { error } = await this.supabase
      .from(TABLES.reminders)
      .upsert(row, { onConflict: 'id' });

    if (error) throw error;
  }

  /**
   * Upsert a session preset to Supabase
   */
  async upsertSessionPreset(preset: SessionPreset): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const row = {
      ...toSnakeCase(preset as unknown as Record<string, unknown>),
      user_id: this.userId,
      last_modified_by: this.deviceId,
      updated_at: now(),
    };

    const { error } = await this.supabase
      .from(TABLES.sessionPresets)
      .upsert(row, { onConflict: 'id' });

    if (error) throw error;
  }

  /**
   * Upsert user preferences to Supabase
   */
  async upsertUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const row = {
      id: this.userId,
      ...toSnakeCase(preferences as unknown as Record<string, unknown>),
      last_modified_by: this.deviceId,
      updated_at: now(),
    };

    const { error } = await this.supabase
      .from(TABLES.userPreferences)
      .upsert(row, { onConflict: 'id' });

    if (error) throw error;
  }

  // ===== Soft Delete =====

  /**
   * Soft delete an entity by setting deleted_at timestamp.
   * The entity remains in the database for sync purposes.
   */
  async softDelete(table: keyof typeof TABLES, id: string): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const { error } = await this.supabase
      .from(TABLES[table])
      .update({
        deleted_at: now(),
        last_modified_by: this.deviceId,
        updated_at: now(),
      })
      .eq('id', id);

    if (error) throw error;
  }

  // ===== Session Ownership =====

  /**
   * Claim ownership of a session for timer operations.
   * Returns false if session is already owned by another device (within timeout).
   */
  async claimSessionOwnership(sessionId: string): Promise<boolean> {
    if (!this.userId) throw new Error('Not authenticated');

    // First check if session is owned by another device (within 30 min timeout)
    const { data: session } = await this.supabase
      .from(TABLES.sessions)
      .select('active_device_id, ownership_claimed_at')
      .eq('id', sessionId)
      .single();

    if (session?.active_device_id && session.active_device_id !== this.deviceId) {
      const claimedAt = new Date(session.ownership_claimed_at).getTime();
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

      if (claimedAt > thirtyMinutesAgo) {
        // Session is owned by another device and not timed out
        return false;
      }
    }

    // Claim ownership
    const { error } = await this.supabase
      .from(TABLES.sessions)
      .update({
        active_device_id: this.deviceId,
        ownership_claimed_at: now(),
        last_modified_by: this.deviceId,
        updated_at: now(),
      })
      .eq('id', sessionId);

    return !error;
  }

  /**
   * Release ownership of a session (on suspend/complete).
   */
  async releaseSessionOwnership(sessionId: string): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const { error } = await this.supabase
      .from(TABLES.sessions)
      .update({
        active_device_id: null,
        ownership_claimed_at: null,
        last_modified_by: this.deviceId,
        updated_at: now(),
      })
      .eq('id', sessionId);

    if (error) throw error;
  }

  /**
   * Check if a session is owned by another device.
   */
  async isSessionOwnedByOtherDevice(sessionId: string): Promise<boolean> {
    const { data: session } = await this.supabase
      .from(TABLES.sessions)
      .select('active_device_id, ownership_claimed_at')
      .eq('id', sessionId)
      .single();

    if (!session?.active_device_id || session.active_device_id === this.deviceId) {
      return false;
    }

    // Check if ownership has timed out (30 minutes)
    const claimedAt = new Date(session.ownership_claimed_at).getTime();
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    return claimedAt > thirtyMinutesAgo;
  }

  // ===== Device Registration =====

  /**
   * Register or update this device in the database.
   */
  async registerDevice(): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const { error } = await this.supabase.from(TABLES.devices).upsert(
      {
        id: this.deviceId,
        user_id: this.userId,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        last_seen_at: now(),
      },
      { onConflict: 'id' }
    );

    if (error) throw error;
  }

  /**
   * Update device last_seen_at timestamp (heartbeat).
   */
  async updateDeviceHeartbeat(): Promise<void> {
    if (!this.userId) throw new Error('Not authenticated');

    const { error } = await this.supabase
      .from(TABLES.devices)
      .update({ last_seen_at: now() })
      .eq('id', this.deviceId);

    if (error) throw error;
  }

  // ===== Check for Existing Data =====

  /**
   * Check if user has any data in the cloud.
   * Used to determine if migration is needed on first sign-in.
   */
  async hasCloudData(): Promise<boolean> {
    if (!this.userId) throw new Error('Not authenticated');

    const { count } = await this.supabase
      .from(TABLES.contexts)
      .select('*', { count: 'exact', head: true });

    return (count ?? 0) > 0;
  }
}

// Singleton instance
let providerInstance: SupabaseDataProvider | null = null;

/**
 * Get the SupabaseDataProvider singleton instance.
 */
export function getSupabaseProvider(): SupabaseDataProvider {
  if (!providerInstance) {
    providerInstance = new SupabaseDataProvider();
  }
  return providerInstance;
}
