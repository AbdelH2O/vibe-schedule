'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getOrCreateDeviceId } from '@/lib/device';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type {
  Context,
  Task,
  Session,
  Reminder,
  SessionPreset,
  UserPreferences,
  SyncStatus,
} from '@/lib/types';

// Payload types for realtime events
interface RealtimePayload<T> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
  errors: string[] | null;
}

// Callbacks for handling sync events
export interface SyncCallbacks {
  onContextChange?: (
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    data: Context | null,
    oldData: Context | null
  ) => void;
  onTaskChange?: (
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    data: Task | null,
    oldData: Task | null
  ) => void;
  onSessionChange?: (
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    data: Session | null,
    oldData: Session | null
  ) => void;
  onReminderChange?: (
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    data: Reminder | null,
    oldData: Reminder | null
  ) => void;
  onPresetChange?: (
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    data: SessionPreset | null,
    oldData: SessionPreset | null
  ) => void;
  onPreferencesChange?: (
    eventType: 'INSERT' | 'UPDATE',
    data: UserPreferences | null
  ) => void;
  onStatusChange?: (status: SyncStatus) => void;
}

// Convert snake_case to camelCase
function toCamelCase<T>(row: Record<string, unknown> | null): T | null {
  if (!row) return null;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

/**
 * SyncEngine manages realtime subscriptions for cross-device sync.
 * Uses a single channel per user with filters for all syncable tables.
 */
export class SyncEngine {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private userId: string | null = null;
  private deviceId: string;
  private callbacks: SyncCallbacks = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.supabase = createClient();
    this.deviceId = getOrCreateDeviceId();
  }

  /**
   * Set callbacks for sync events
   */
  setCallbacks(callbacks: SyncCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Connect to realtime sync for the given user
   */
  connect(userId: string): void {
    if (this.isConnected && this.userId === userId) {
      return; // Already connected for this user
    }

    // Disconnect previous subscription if any
    this.disconnect();

    this.userId = userId;
    this.createSubscription();
  }

  /**
   * Disconnect from realtime sync
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.callbacks.onStatusChange?.('offline');
  }

  /**
   * Check if the engine is connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Create the realtime subscription
   */
  private createSubscription(): void {
    if (!this.userId) return;

    const channelName = `user:${this.userId}:sync`;

    this.channel = this.supabase
      .channel(channelName, { config: { private: true } })
      // Contexts
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contexts',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => this.handleContextChange(payload as RealtimePayload<Record<string, unknown>>)
      )
      // Tasks
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => this.handleTaskChange(payload as RealtimePayload<Record<string, unknown>>)
      )
      // Sessions
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => this.handleSessionChange(payload as RealtimePayload<Record<string, unknown>>)
      )
      // Reminders
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => this.handleReminderChange(payload as RealtimePayload<Record<string, unknown>>)
      )
      // Session Presets
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_presets',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => this.handlePresetChange(payload as RealtimePayload<Record<string, unknown>>)
      )
      // User Preferences
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `id=eq.${this.userId}`,
        },
        (payload) => this.handlePreferencesChange(payload as RealtimePayload<Record<string, unknown>>)
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.callbacks.onStatusChange?.('synced');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isConnected = false;
          this.callbacks.onStatusChange?.('error');
          this.handleReconnect();
        } else if (err) {
          console.error('Realtime subscription error:', err);
          this.callbacks.onStatusChange?.('error');
        }
      });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.callbacks.onStatusChange?.('error');
      return;
    }

    const delay = 3000 * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.channel) {
        this.supabase.removeChannel(this.channel);
      }
      this.createSubscription();
    }, delay);
  }

  // Event handlers
  private handleContextChange(payload: RealtimePayload<Record<string, unknown>>): void {
    // Skip changes from this device to avoid echo
    const newData = toCamelCase<Context>(payload.new);
    if (newData?.lastModifiedBy === this.deviceId) return;

    const oldData = toCamelCase<Context>(payload.old);
    this.callbacks.onContextChange?.(payload.eventType, newData, oldData);
  }

  private handleTaskChange(payload: RealtimePayload<Record<string, unknown>>): void {
    const newData = toCamelCase<Task>(payload.new);
    if (newData?.lastModifiedBy === this.deviceId) return;

    const oldData = toCamelCase<Task>(payload.old);
    this.callbacks.onTaskChange?.(payload.eventType, newData, oldData);
  }

  private handleSessionChange(payload: RealtimePayload<Record<string, unknown>>): void {
    const newData = toCamelCase<Session>(payload.new);
    if (newData?.lastModifiedBy === this.deviceId) return;

    const oldData = toCamelCase<Session>(payload.old);
    this.callbacks.onSessionChange?.(payload.eventType, newData, oldData);
  }

  private handleReminderChange(payload: RealtimePayload<Record<string, unknown>>): void {
    const newData = toCamelCase<Reminder>(payload.new);
    if (newData?.lastModifiedBy === this.deviceId) return;

    const oldData = toCamelCase<Reminder>(payload.old);
    this.callbacks.onReminderChange?.(payload.eventType, newData, oldData);
  }

  private handlePresetChange(payload: RealtimePayload<Record<string, unknown>>): void {
    const newData = toCamelCase<SessionPreset>(payload.new);
    if (newData?.lastModifiedBy === this.deviceId) return;

    const oldData = toCamelCase<SessionPreset>(payload.old);
    this.callbacks.onPresetChange?.(payload.eventType, newData, oldData);
  }

  private handlePreferencesChange(payload: RealtimePayload<Record<string, unknown>>): void {
    const newData = toCamelCase<UserPreferences>(payload.new);
    if (newData?.lastModifiedBy === this.deviceId) return;

    // User preferences only support INSERT and UPDATE (no DELETE)
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      this.callbacks.onPreferencesChange?.(payload.eventType, newData);
    }
  }
}

// Singleton instance
let engineInstance: SyncEngine | null = null;

/**
 * Get the SyncEngine singleton instance
 */
export function getSyncEngine(): SyncEngine {
  if (!engineInstance) {
    engineInstance = new SyncEngine();
  }
  return engineInstance;
}

/**
 * Hook for using the SyncEngine in React components
 */
export function useSyncEngine(
  userId: string | null,
  callbacks: SyncCallbacks
): {
  isConnected: boolean;
  syncStatus: SyncStatus;
} {
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const engineRef = useRef<SyncEngine | null>(null);
  const isFirstRender = useRef(true);

  // Memoize callbacks to prevent unnecessary reconnections
  const memoizedCallbacks = useCallback(() => ({
    ...callbacks,
    onStatusChange: (status: SyncStatus) => {
      setSyncStatus(status);
      setIsConnected(status === 'synced' || status === 'syncing');
      callbacks.onStatusChange?.(status);
    },
  }), [callbacks]);

  useEffect(() => {
    // Skip the second effect call in strict mode
    if (isFirstRender.current) {
      isFirstRender.current = false;

      if (!userId) {
        return;
      }

      const engine = getSyncEngine();
      engineRef.current = engine;
      engine.setCallbacks(memoizedCallbacks());
      engine.connect(userId);

      return () => {
        engine.disconnect();
        engineRef.current = null;
      };
    }
  }, [userId, memoizedCallbacks]);

  return { isConnected, syncStatus };
}

/**
 * Hook for network status detection
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook for sync status (combines engine status and network status)
 */
export function useSyncStatus(): {
  status: SyncStatus;
  isOnline: boolean;
  pendingCount: number;
} {
  const isOnline = useNetworkStatus();
  const [status, setStatus] = useState<SyncStatus>('offline');
  const [pendingCount, setPendingCount] = useState(0);

  // Update status based on network
  useEffect(() => {
    if (!isOnline) {
      setStatus('offline');
    }
  }, [isOnline]);

  return { status, isOnline, pendingCount };
}
