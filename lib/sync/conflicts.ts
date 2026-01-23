/**
 * Conflict resolution module for cross-device sync.
 * Implements Last-Write-Wins (LWW) and special session conflict handling.
 */

import type {
  Context,
  Task,
  Session,
  Reminder,
  SessionPreset,
  ContextAllocation,
} from '@/lib/types';

/**
 * Entity with updatedAt field for LWW resolution
 */
interface TimestampedEntity {
  id: string;
  updatedAt: string;
}

/**
 * Entity with deletedAt field for soft delete handling
 */
interface SoftDeletableEntity {
  id: string;
  deletedAt?: string | null;
}

/**
 * Resolve conflict using Last-Write-Wins based on updatedAt timestamp.
 * Returns the entity with the most recent updatedAt.
 */
export function resolveLWW<T extends TimestampedEntity>(
  local: T,
  remote: T
): T {
  const localTime = new Date(local.updatedAt).getTime();
  const remoteTime = new Date(remote.updatedAt).getTime();

  // Remote wins if it's newer or same time (tie-breaker: prefer remote)
  return remoteTime >= localTime ? remote : local;
}

/**
 * Resolve context conflict using LWW
 */
export function resolveContextConflict(
  local: Context,
  remote: Context
): Context {
  return resolveLWW(local, remote);
}

/**
 * Resolve task conflict using LWW
 */
export function resolveTaskConflict(local: Task, remote: Task): Task {
  return resolveLWW(local, remote);
}

/**
 * Resolve reminder conflict using LWW
 */
export function resolveReminderConflict(
  local: Reminder,
  remote: Reminder
): Reminder {
  return resolveLWW(local, remote);
}

/**
 * Resolve preset conflict using LWW
 */
export function resolvePresetConflict(
  local: SessionPreset,
  remote: SessionPreset
): SessionPreset {
  // SessionPreset might not have updatedAt, use createdAt as fallback
  const localWithUpdate = {
    ...local,
    updatedAt: local.updatedAt || local.createdAt,
  };
  const remoteWithUpdate = {
    ...remote,
    updatedAt: remote.updatedAt || remote.createdAt,
  };
  return resolveLWW(localWithUpdate, remoteWithUpdate);
}

/**
 * Merge context allocations preserving maximum usedMinutes per context.
 * This ensures no work time is lost when merging sessions from different devices.
 */
function mergeAllocations(
  local: ContextAllocation[],
  remote: ContextAllocation[]
): ContextAllocation[] {
  const merged = new Map<string, ContextAllocation>();

  // Process all allocations, keeping the one with max usedMinutes for each context
  for (const alloc of [...local, ...remote]) {
    const existing = merged.get(alloc.contextId);
    if (!existing || alloc.usedMinutes > existing.usedMinutes) {
      merged.set(alloc.contextId, alloc);
    }
  }

  return Array.from(merged.values());
}

/**
 * Resolve session conflict with special handling for timer data.
 * - For usedMinutes: preserve maximum (don't lose tracked time)
 * - For ownership: first claim wins (handled by database)
 * - For other fields: LWW
 */
export function resolveSessionConflict(
  local: Session,
  remote: Session
): Session {
  // If sessions have different IDs, this shouldn't happen
  if (local.id !== remote.id) {
    console.warn('Attempted to resolve conflict between different sessions');
    return remote;
  }

  const localTime = new Date(local.startedAt).getTime();
  const remoteTime = new Date(remote.startedAt).getTime();

  // Merge allocations preserving max usedMinutes
  const mergedAllocations = mergeAllocations(
    local.allocations,
    remote.allocations
  );

  // For other fields, use LWW
  // Use updatedAt if available, otherwise use a combination of status changes
  const localUpdated = (local as { updatedAt?: string }).updatedAt;
  const remoteUpdated = (remote as { updatedAt?: string }).updatedAt;

  let baseSession: Session;
  if (localUpdated && remoteUpdated) {
    baseSession =
      new Date(remoteUpdated).getTime() >= new Date(localUpdated).getTime()
        ? remote
        : local;
  } else {
    // Fallback: prefer remote (server-side wins)
    baseSession = remote;
  }

  return {
    ...baseSession,
    allocations: mergedAllocations,
  };
}

/**
 * Handle delete-vs-edit conflict.
 * If one device deleted while another edited:
 * - Soft delete (deletedAt set): treat as deleted, honor the delete
 * - This follows the principle that explicit user intent to delete should win
 */
export function resolveDeleteVsEditConflict<
  T extends TimestampedEntity & SoftDeletableEntity
>(local: T | null, remote: T | null): { result: T | null; isDeleted: boolean } {
  // Both deleted or neither exists
  if (!local && !remote) {
    return { result: null, isDeleted: true };
  }

  // Only local exists
  if (!remote) {
    if (local!.deletedAt) {
      return { result: local, isDeleted: true };
    }
    return { result: local, isDeleted: false };
  }

  // Only remote exists
  if (!local) {
    if (remote.deletedAt) {
      return { result: remote, isDeleted: true };
    }
    return { result: remote, isDeleted: false };
  }

  // Both exist - check deletion status
  const localDeleted = !!local.deletedAt;
  const remoteDeleted = !!remote.deletedAt;

  // If either is deleted, honor the delete (delete wins)
  if (localDeleted || remoteDeleted) {
    // Return the deleted version (whichever has deletedAt)
    const deleted = localDeleted ? local : remote;
    return { result: deleted, isDeleted: true };
  }

  // Neither deleted - normal LWW
  const resolved = resolveLWW(local, remote);
  return { result: resolved, isDeleted: false };
}

/**
 * Determine if local entity should be overwritten by remote.
 * Returns true if remote is newer or local doesn't exist.
 */
export function shouldApplyRemoteChange<T extends TimestampedEntity>(
  local: T | undefined,
  remote: T
): boolean {
  if (!local) return true;
  return resolveLWW(local, remote) === remote;
}

/**
 * Merge two arrays of entities, resolving conflicts.
 * Returns a new array with conflicts resolved.
 */
export function mergeEntityArrays<T extends TimestampedEntity>(
  local: T[],
  remote: T[],
  resolver: (l: T, r: T) => T
): T[] {
  const merged = new Map<string, T>();

  // Add all local entities
  for (const entity of local) {
    merged.set(entity.id, entity);
  }

  // Merge remote entities, resolving conflicts
  for (const entity of remote) {
    const existing = merged.get(entity.id);
    if (existing) {
      merged.set(entity.id, resolver(existing, entity));
    } else {
      merged.set(entity.id, entity);
    }
  }

  return Array.from(merged.values());
}
