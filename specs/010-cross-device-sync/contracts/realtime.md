# Realtime Subscriptions: Cross-Device Data Synchronization

**Date**: 2026-01-21
**Feature**: 010-cross-device-sync

## Channel Architecture

### Primary Sync Channel

Each authenticated user subscribes to a single channel for all data changes:

```
Channel Name: user:{userId}:sync
Type: Private (requires auth)
```

### Subscription Events

| Table | Events | Filter | Payload |
|-------|--------|--------|---------|
| contexts | INSERT, UPDATE, DELETE | `user_id=eq.{userId}` | Full row |
| tasks | INSERT, UPDATE, DELETE | `user_id=eq.{userId}` | Full row |
| sessions | INSERT, UPDATE, DELETE | `user_id=eq.{userId}` | Full row |
| reminders | INSERT, UPDATE, DELETE | `user_id=eq.{userId}` | Full row |
| session_presets | INSERT, UPDATE, DELETE | `user_id=eq.{userId}` | Full row |
| user_preferences | INSERT, UPDATE | `id=eq.{userId}` | Full row |

## Client Implementation

### Subscription Setup

```typescript
import { RealtimeChannel } from '@supabase/supabase-js'

interface SyncSubscriptionCallbacks {
  onContextChange: (payload: RealtimePostgresChangesPayload<Context>) => void
  onTaskChange: (payload: RealtimePostgresChangesPayload<Task>) => void
  onSessionChange: (payload: RealtimePostgresChangesPayload<Session>) => void
  onReminderChange: (payload: RealtimePostgresChangesPayload<Reminder>) => void
  onPresetChange: (payload: RealtimePostgresChangesPayload<SessionPreset>) => void
  onPreferencesChange: (payload: RealtimePostgresChangesPayload<UserPreferences>) => void
  onConnectionChange: (status: 'connected' | 'disconnected' | 'error') => void
}

function createSyncSubscription(
  supabase: SupabaseClient,
  userId: string,
  callbacks: SyncSubscriptionCallbacks
): RealtimeChannel {
  return supabase
    .channel(`user:${userId}:sync`, { config: { private: true } })
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'contexts', filter: `user_id=eq.${userId}` },
      callbacks.onContextChange)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
      callbacks.onTaskChange)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'sessions', filter: `user_id=eq.${userId}` },
      callbacks.onSessionChange)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'reminders', filter: `user_id=eq.${userId}` },
      callbacks.onReminderChange)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'session_presets', filter: `user_id=eq.${userId}` },
      callbacks.onPresetChange)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'user_preferences', filter: `id=eq.${userId}` },
      callbacks.onPreferencesChange)
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        callbacks.onConnectionChange('connected')
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        callbacks.onConnectionChange('disconnected')
      } else if (err) {
        console.error('Realtime subscription error:', err)
        callbacks.onConnectionChange('error')
      }
    })
}
```

### Payload Structure

```typescript
interface RealtimePostgresChangesPayload<T> {
  schema: string           // 'public'
  table: string            // e.g., 'contexts'
  commit_timestamp: string // ISO timestamp
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T | null           // New row data (null for DELETE)
  old: T | null           // Old row data (null for INSERT, requires REPLICA IDENTITY FULL)
  errors: string[] | null
}
```

### Event Handling

```typescript
function handleChange<T extends { id: string; deletedAt?: string | null }>(
  eventType: 'INSERT' | 'UPDATE' | 'DELETE',
  newData: T | null,
  oldData: T | null,
  localStore: Map<string, T>,
  dispatch: (action: SyncAction) => void
) {
  switch (eventType) {
    case 'INSERT':
      if (newData && !newData.deletedAt) {
        localStore.set(newData.id, newData)
        dispatch({ type: 'SYNC_INSERT', payload: newData })
      }
      break

    case 'UPDATE':
      if (newData) {
        if (newData.deletedAt) {
          // Soft delete
          localStore.delete(newData.id)
          dispatch({ type: 'SYNC_DELETE', payload: { id: newData.id } })
        } else {
          localStore.set(newData.id, newData)
          dispatch({ type: 'SYNC_UPDATE', payload: newData })
        }
      }
      break

    case 'DELETE':
      // Hard delete (rarely used)
      if (oldData) {
        localStore.delete(oldData.id)
        dispatch({ type: 'SYNC_DELETE', payload: { id: oldData.id } })
      }
      break
  }
}
```

## Session Ownership Broadcasts

For session timer ownership, we use an additional broadcast channel:

```
Channel Name: user:{userId}:session:{sessionId}
Type: Private
Purpose: Notify other devices of ownership changes
```

### Ownership Events

```typescript
type OwnershipEvent =
  | { type: 'OWNERSHIP_CLAIMED'; deviceId: string; deviceName: string | null }
  | { type: 'OWNERSHIP_RELEASED'; previousDeviceId: string }
  | { type: 'TIMER_UPDATE'; usedMinutes: Record<string, number> }
```

### Broadcast Pattern

```typescript
// When claiming ownership
channel.send({
  type: 'broadcast',
  event: 'ownership',
  payload: {
    type: 'OWNERSHIP_CLAIMED',
    deviceId: currentDeviceId,
    deviceName: currentDeviceName
  }
})

// When releasing ownership (suspend/complete)
channel.send({
  type: 'broadcast',
  event: 'ownership',
  payload: {
    type: 'OWNERSHIP_RELEASED',
    previousDeviceId: currentDeviceId
  }
})

// Periodic timer updates (every 30 seconds during active session)
channel.send({
  type: 'broadcast',
  event: 'ownership',
  payload: {
    type: 'TIMER_UPDATE',
    usedMinutes: currentUsedMinutes
  }
})
```

## Reconnection Strategy

```typescript
const MAX_RECONNECT_ATTEMPTS = 5
const BASE_DELAY_MS = 3000

function handleReconnection(
  attempt: number,
  channel: RealtimeChannel,
  subscribe: () => RealtimeChannel
): NodeJS.Timeout | null {
  if (attempt >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Max reconnection attempts reached')
    return null
  }

  const delay = BASE_DELAY_MS * Math.pow(2, attempt) // Exponential backoff
  console.log(`Reconnecting in ${delay}ms (attempt ${attempt + 1})`)

  return setTimeout(() => {
    supabase.removeChannel(channel)
    subscribe()
  }, delay)
}
```

## Presence (Optional Enhancement)

For showing which devices are currently active:

```typescript
const presenceChannel = supabase
  .channel(`user:${userId}:presence`)
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState()
    // state = { deviceId1: [{ online_at: string }], ... }
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log(`Device ${key} joined`)
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log(`Device ${key} left`)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        device_id: currentDeviceId,
        device_name: currentDeviceName,
        online_at: new Date().toISOString()
      })
    }
  })
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `CHANNEL_ERROR` | Network issue | Trigger reconnection |
| `TIMED_OUT` | Server unreachable | Trigger reconnection |
| `CLOSED` | Channel closed by server | Check auth, re-subscribe |
| RLS violation | Policy mismatch | Verify user_id filter matches auth |

## Performance Considerations

1. **Single channel per user**: All tables on one channel reduces WebSocket connections
2. **Filter on server**: `filter: user_id=eq.{userId}` reduces unnecessary messages
3. **Private channels**: Require auth, prevent unauthorized subscriptions
4. **REPLICA IDENTITY FULL**: Required for `old` data on UPDATE/DELETE
5. **Subscription cleanup**: Always call `supabase.removeChannel()` on unmount
