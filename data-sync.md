# Cross-Device Data Sync Implementation Plan

## Summary

Implement real-time, cross-device synchronization for vibe-schedule while maintaining offline-first architecture. Uses **Supabase** as backend with **Last-Write-Wins (LWW)** conflict resolution for most entities and **single-owner protocol** for active session sync.

## Recommended Architecture

### Why Supabase?
- PostgreSQL for complex queries and foreign keys
- Row-Level Security for data isolation per user
- Built-in real-time subscriptions via WebSocket (<100ms latency)
- Authentication (magic link, OAuth)
- Open source (can self-host if needed)
- Generous free tier (500MB database, 50k MAU)

### Sync Strategy: Hybrid CRDT + Backend

| Entity | Strategy | Rationale |
|--------|----------|-----------|
| Contexts | LWW by updatedAt | Infrequent edits |
| Tasks | LWW by updatedAt | Simple, matches user expectations |
| Reminders | LWW by updatedAt | Configuration rarely conflicts |
| SessionPresets | LWW by updatedAt | Templates, LWW acceptable |
| Preferences | LWW by updatedAt | Per-user settings |
| **Session** | **Single-owner protocol** | Only one device can actively time |

### Session Sync (The Hard Part)

Sessions require special handling because timer state is real-time sensitive:

1. **Single Active Owner**: Only one device can have `status: 'active'` at a time
2. **Ownership Claim**: Device must claim ownership before resuming a session
3. **Graceful Handoff**: When suspending, release ownership for other devices
4. **Timer Reconciliation**: Take maximum `usedMinutes` per context (prevents losing work)

```
Device A claims session → starts timer → suspends → releases ownership
                                                          ↓
Device B claims session → resumes timer → continues work
```

## Data Model Changes

### 1. Enhanced IDs (UUID v7)
```typescript
// Current: `${Date.now()}-${random}`
// New: UUID v7 (globally unique, time-ordered)
export function generateId(): string {
  return crypto.randomUUID();
}
```

### 2. Sync Metadata Per Entity
```typescript
interface SyncMetadata {
  syncVersion: number;      // Server-assigned sequence
  lastModifiedBy: string;   // Device ID
  deleted?: boolean;        // Soft delete tombstone
}
```

### 3. Device Registration
```typescript
interface DeviceInfo {
  id: string;        // Generated once, stored in localStorage
  name?: string;     // User-friendly name
  lastSeen: string;
}
```

## Key Components

### 1. SyncEngine (`lib/sync/SyncEngine.ts`)
- Manages connection state
- Coordinates push/pull operations
- Handles real-time subscriptions

### 2. Outbox (`lib/sync/outbox.ts`)
- Queues local changes for offline support
- Persists to localStorage
- Flushes when online

### 3. Supabase DataProvider (`lib/sync/supabaseProvider.ts`)
- Implements DataProvider interface
- Handles all server communication
- Parallel to existing localStorageProvider

### 4. Conflict Resolver (`lib/sync/conflicts.ts`)
- LWW logic for most entities
- Custom session ownership protocol

## Database Schema (Supabase)

```sql
-- Core tables with sync metadata
CREATE TABLE contexts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  priority INTEGER NOT NULL,
  color TEXT NOT NULL,
  -- ... other fields
  sync_version BIGINT DEFAULT 0,
  last_modified_by UUID,
  deleted BOOLEAN DEFAULT FALSE
);

-- Session with ownership tracking
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  active_device_id UUID,        -- Which device owns timer
  ownership_claimed_at TIMESTAMPTZ,
  status TEXT NOT NULL,
  -- ... other fields
);

-- Row Level Security
CREATE POLICY "Users access own data" ON contexts
  FOR ALL USING (auth.uid() = user_id);
```

## Implementation Phases

### Phase 1: Foundation
- [ ] Add Supabase client and authentication
- [ ] Device registration and ID generation
- [ ] Switch to UUID v7 for new entities
- [ ] Create database schema with RLS

### Phase 2: Sync Engine
- [ ] Implement outbox pattern
- [ ] LWW conflict resolver
- [ ] Real-time subscriptions
- [ ] Network status detection

### Phase 3: Session Sync
- [ ] Ownership claim/release protocol
- [ ] Timer reconciliation logic
- [ ] UI indicators for active device

### Phase 4: Migration & Polish
- [ ] One-time migration from localStorage to cloud
- [ ] ID remapping for existing data
- [ ] Error handling and retry logic
- [ ] Sync status UI indicators

## Critical Files to Modify

| File | Changes |
|------|---------|
| `lib/types.ts` | Add SyncMetadata, DeviceInfo, extend DataProvider |
| `lib/store.tsx` | Integrate sync engine with reducer |
| `lib/storage.ts` | Switch to UUID, add outbox persistence |
| `lib/dataProvider.ts` | Add Supabase provider alongside localStorage |
| `app/components/ClientProvider.tsx` | Add SyncProvider, auth state |

## Verification

1. **Auth flow**: Sign in on two devices, verify same data appears
2. **Real-time sync**: Edit task on Device A, see update on Device B within 1s
3. **Offline support**: Make changes offline, verify sync when back online
4. **Session handoff**: Start session on A, suspend, resume on B
5. **Conflict handling**: Edit same task on both devices offline, verify LWW resolution

## Decisions Made

- **Backend**: Supabase (managed, with option to self-host later)
- **Authentication**: Magic link email (passwordless)
- **Usage**: Multi-user (each user has their own account and data)
