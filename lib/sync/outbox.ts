/**
 * Outbox module for offline change queue.
 * Stores pending changes in localStorage for sync when back online.
 */

import { generateId, now } from '@/lib/storage';
import { toast } from 'sonner';
import type { OutboxEntry, OutboxOperation, DataCategory } from '@/lib/types';

const OUTBOX_KEY = 'vibe-schedule-outbox';

// Storage thresholds (percentage)
const STORAGE_THRESHOLDS = {
  WARNING: 75,
  CRITICAL: 90,
};

// Storage health status
export type StorageHealth = 'healthy' | 'warning' | 'critical';

/**
 * Load outbox entries from localStorage
 */
export function getOutboxEntries(): OutboxEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const data = localStorage.getItem(OUTBOX_KEY);
    if (!data) return [];
    return JSON.parse(data) as OutboxEntry[];
  } catch (error) {
    console.error('Failed to load outbox:', error);
    return [];
  }
}

/**
 * Save outbox entries to localStorage
 */
function persistOutbox(entries: OutboxEntry[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to persist outbox:', error);
    // Check if it's a quota error
    if (isQuotaExceededError(error)) {
      toast.error('Storage full', {
        description: 'Unable to save offline changes. Please connect to sync your data.',
      });
    }
  }
}

/**
 * Add an entry to the outbox
 */
export function addToOutbox(
  entityType: DataCategory,
  entityId: string,
  operation: OutboxOperation,
  payload: unknown
): void {
  const entries = getOutboxEntries();

  // Check for existing entry for same entity
  const existingIndex = entries.findIndex(
    (e) => e.entityType === entityType && e.entityId === entityId
  );

  const newEntry: OutboxEntry = {
    id: generateId(),
    entityType,
    entityId,
    operation,
    payload,
    createdAt: now(),
    attempts: 0,
    lastAttemptAt: null,
    error: null,
  };

  if (existingIndex >= 0) {
    // Merge operations intelligently
    const existing = entries[existingIndex];

    if (existing.operation === 'create' && operation === 'update') {
      // Keep as create with updated payload
      entries[existingIndex] = { ...newEntry, operation: 'create' };
    } else if (existing.operation === 'create' && operation === 'delete') {
      // Remove entirely - was created and deleted while offline
      entries.splice(existingIndex, 1);
    } else if (existing.operation === 'update' && operation === 'delete') {
      // Replace with delete
      entries[existingIndex] = newEntry;
    } else {
      // Replace with new entry
      entries[existingIndex] = newEntry;
    }
  } else {
    entries.push(newEntry);
  }

  persistOutbox(entries);
}

/**
 * Remove an entry from the outbox (after successful sync)
 */
export function removeFromOutbox(entryId: string): void {
  const entries = getOutboxEntries();
  const filtered = entries.filter((e) => e.id !== entryId);
  persistOutbox(filtered);
}

/**
 * Mark an entry as failed (increment attempts, record error)
 */
export function markOutboxEntryFailed(entryId: string, error: string): void {
  const entries = getOutboxEntries();
  const updated = entries.map((e) =>
    e.id === entryId
      ? { ...e, attempts: e.attempts + 1, lastAttemptAt: now(), error }
      : e
  );
  persistOutbox(updated);
}

/**
 * Clear all outbox entries
 */
export function clearOutbox(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(OUTBOX_KEY);
  } catch (error) {
    console.error('Failed to clear outbox:', error);
  }
}

/**
 * Get the number of pending outbox entries
 */
export function getOutboxCount(): number {
  return getOutboxEntries().length;
}

/**
 * Check if an error is a QuotaExceededError (cross-browser)
 */
export function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.code === 22 || // Chrome, Safari, Edge
      error.code === 1014 || // Firefox
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

/**
 * Calculate current localStorage usage in bytes
 */
function calculateLocalStorageSize(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) ?? '';
      total += (key.length + value.length) * 2; // UTF-16 = 2 bytes per char
    }
  }
  return total;
}

/**
 * Get storage health status based on usage
 */
function getHealthFromPercent(percentUsed: number): StorageHealth {
  if (percentUsed >= STORAGE_THRESHOLDS.CRITICAL) return 'critical';
  if (percentUsed >= STORAGE_THRESHOLDS.WARNING) return 'warning';
  return 'healthy';
}

/**
 * Check storage health and return status with usage info
 */
export async function checkStorageHealth(): Promise<{
  health: StorageHealth;
  usedBytes: number;
  quotaBytes: number;
  percentUsed: number;
}> {
  // Try StorageManager API first (more accurate, only works on HTTPS)
  if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
    try {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
      return {
        health: getHealthFromPercent(percentUsed),
        usedBytes: usage,
        quotaBytes: quota,
        percentUsed,
      };
    } catch {
      // Fall through to localStorage estimate
    }
  }

  // Fallback: estimate localStorage usage
  const usedBytes = calculateLocalStorageSize();
  const approxLimit = 5 * 1024 * 1024; // 5MB typical limit
  const percentUsed = (usedBytes / approxLimit) * 100;

  return {
    health: getHealthFromPercent(percentUsed),
    usedBytes,
    quotaBytes: approxLimit,
    percentUsed,
  };
}

// Track if we've shown storage warnings to avoid spam
let hasShownStorageWarning = false;

/**
 * Show storage warning toast if needed
 */
export async function showStorageWarningIfNeeded(): Promise<void> {
  if (hasShownStorageWarning) return;

  const { health, percentUsed } = await checkStorageHealth();

  if (health === 'critical') {
    hasShownStorageWarning = true;
    toast.error('Storage almost full', {
      description: `${Math.round(percentUsed)}% of local storage used. Sign in to sync your data to the cloud.`,
      duration: 10000,
    });
  } else if (health === 'warning') {
    hasShownStorageWarning = true;
    toast.warning('Storage getting full', {
      description: `${Math.round(percentUsed)}% of local storage used. Consider signing in to sync your data.`,
      duration: 8000,
    });
  }
}

/**
 * Reset storage warning flag (call after sign-in or storage cleanup)
 */
export function resetStorageWarning(): void {
  hasShownStorageWarning = false;
}
