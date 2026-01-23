# Research: Cross-Device Data Synchronization

**Date**: 2026-01-21
**Feature**: 010-cross-device-sync

## 1. Supabase Auth Magic Link (Next.js 16 App Router)

### Decision
Use `@supabase/ssr` package (not deprecated `auth-helpers-nextjs`) with magic link authentication.

### Rationale
- `@supabase/ssr` is the official replacement, actively maintained
- Magic link provides passwordless UX aligned with simplicity principle
- Cookie-based sessions work well with Next.js middleware

### Key Implementation Patterns

**Package Setup:**
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

**Browser Client (`lib/supabase/client.ts`):**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server Client (`lib/supabase/server.ts`):**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Ignore Server Component read-only errors */ }
        },
      },
    }
  )
}
```

**Auth Callback Route (`app/auth/callback/route.ts`):**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }
  return NextResponse.redirect(`${origin}/auth/error`)
}
```

**Session Expiry Configuration:**
- Configure in Supabase Dashboard > Auth > Settings
- Set "Inactivity timeout" to 2,592,000 seconds (30 days)
- JWT tokens auto-refresh via middleware

**Security Note:** Always use `getUser()` (validates token) instead of `getSession()` in server code.

### Alternatives Considered
- Password auth: Rejected (adds friction, password reset complexity)
- OAuth only: Rejected (requires third-party accounts)
- Session-based without JWT: Rejected (doesn't work with Supabase)

---

## 2. Supabase Realtime Subscriptions (React 19)

### Decision
Use `postgres_changes` with user_id filter on a single channel per user.

### Rationale
- Built-in Supabase feature, no additional infrastructure
- Filter by user_id reduces bandwidth and enforces isolation
- Single channel for all tables reduces WebSocket connections

### Key Implementation Patterns

**Single Channel Multi-Table Pattern:**
```typescript
const syncChannel = supabase
  .channel(`user:${userId}:sync`, { config: { private: true } })
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'contexts', filter: `user_id=eq.${userId}` },
    handleContextChange)
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
    handleTaskChange)
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'sessions', filter: `user_id=eq.${userId}` },
    handleSessionChange)
  .subscribe()
```

**React 19 Strict Mode Cleanup:**
```typescript
function useSyncSubscription(userId: string) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isSubscribedRef = useRef(false)

  useEffect(() => {
    if (isSubscribedRef.current) return
    isSubscribedRef.current = true

    channelRef.current = supabase
      .channel(`user:${userId}:sync`)
      .on('postgres_changes', /* ... */)
      .subscribe()

    return () => {
      isSubscribedRef.current = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [userId])
}
```

**Reconnection with Exponential Backoff:**
```typescript
const reconnectAttempts = useRef(0)
const maxReconnectAttempts = 5

const handleReconnect = () => {
  if (reconnectAttempts.current >= maxReconnectAttempts) return
  const delay = 3000 * Math.pow(2, reconnectAttempts.current)
  reconnectAttempts.current++
  setTimeout(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    channelRef.current = subscribe()
  }, delay)
}
```

**Performance Notes:**
- Free tier: 200 concurrent realtime connections
- To receive `old` values on UPDATE/DELETE: `ALTER TABLE x REPLICA IDENTITY FULL`
- Supported filters: eq, lt, gt, gte, lte, neq only

### Alternatives Considered
- Broadcast channels: Better for high scale but requires database triggers
- Polling: Rejected (higher latency, battery usage)

---

## 3. Row Level Security (RLS) Patterns

### Decision
Standard user_id-based policies with performance optimizations and soft delete support.

### Rationale
- RLS enforces data isolation at database level (defense in depth)
- Simple policies with cached `auth.uid()` calls for performance
- Soft delete via separate SELECT policy allows UPDATE for deletion

### Key Implementation Patterns

**Table with RLS:**
```sql
CREATE TABLE contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority INTEGER NOT NULL,
  color TEXT NOT NULL,
  weight DECIMAL DEFAULT 1,
  min_duration INTEGER,
  max_duration INTEGER,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  sync_version BIGINT DEFAULT 0,
  last_modified_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;

-- Index for RLS performance (CRITICAL)
CREATE INDEX idx_contexts_user_id ON contexts (user_id);
CREATE INDEX idx_contexts_user_deleted ON contexts (user_id, deleted_at)
  WHERE deleted_at IS NULL;
```

**CRUD Policies (Performance-Optimized):**
```sql
-- SELECT: Only non-deleted for normal queries
CREATE POLICY "select_own_active"
ON contexts FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

-- INSERT: Own user_id only
CREATE POLICY "insert_own"
ON contexts FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- UPDATE: Any owned row (needed for soft delete)
CREATE POLICY "update_own"
ON contexts FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- DELETE: Hard delete (rarely used)
CREATE POLICY "delete_own"
ON contexts FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);
```

**Performance Best Practices:**
1. Always wrap `auth.uid()` in `SELECT` statement (caches result)
2. Index all columns used in policies
3. Include user_id filter in application queries (helps query planner)

### Alternatives Considered
- Application-level filtering: Rejected (not defense in depth)
- Complex join-based policies: Rejected (performance impact)

---

## 4. Offline Queue & localStorage Limits

### Decision
No explicit queue size limit; warn at 75% storage usage, critical at 90%.

### Rationale
- Natural browser limits (~5MB) sufficient for typical use
- StorageManager API provides quota estimates on HTTPS
- Warning users proactively prevents data loss

### Key Implementation Patterns

**QuotaExceededError Detection (Cross-Browser):**
```typescript
function isQuotaExceededError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.code === 22 ||     // Chrome, Safari, Edge
    err.code === 1014 ||    // Firefox
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}
```

**Storage Health Check:**
```typescript
const THRESHOLDS = { WARNING: 75, CRITICAL: 90 }

async function checkStorageHealth(): Promise<StorageHealth> {
  if (navigator.storage?.estimate) {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate()
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0
    return getHealthFromPercent(percentUsed)
  }
  // Fallback: estimate localStorage manually
  const used = calculateLocalStorageSize()
  const approxLimit = 5 * 1024 * 1024 // 5MB
  return getHealthFromPercent((used / approxLimit) * 100)
}

function calculateLocalStorageSize(): number {
  let total = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      const value = localStorage.getItem(key) ?? ''
      total += (key.length + value.length) * 2 // UTF-16 = 2 bytes/char
    }
  }
  return total
}
```

**Browser Limits:**
| Browser | localStorage Limit |
|---------|-------------------|
| Chrome | ~5 MB per origin |
| Firefox | ~5 MB or 10% of disk |
| Safari | ~5 MB (7-day eviction without interaction) |
| Edge | ~5 MB |
| Mobile | ~2.5 MB |

**Safari Caveat:** 7-day cap on script-writable storage. PWAs on home screen are exempt.

### Alternatives Considered
- IndexedDB for queue: Rejected (overkill for offline queue, localStorage sufficient)
- Explicit queue cap with eviction: Rejected (loses user data)

---

## 5. UUID Generation

### Decision
Use `crypto.randomUUID()` for all new entity IDs.

### Rationale
- Native browser API, no dependencies
- UUID v4 provides sufficient uniqueness for multi-device sync
- Supported in all target browsers (Chrome 92+, Firefox 95+, Safari 15.4+, Edge 92+)

### Implementation
```typescript
export function generateId(): string {
  return crypto.randomUUID()
}
```

**Browser Support:**
- Chrome 92+ (July 2021)
- Firefox 95+ (December 2021)
- Safari 15.4+ (March 2022)
- Edge 92+ (July 2021)

**Fallback (if needed for older browsers):**
```typescript
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback: timestamp + random (existing pattern)
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
```

### Alternatives Considered
- UUID v7 (time-ordered): Not natively available, requires library
- nanoid: Rejected (adds dependency, crypto.randomUUID sufficient)
- Keep timestamp-random: Rejected (collision risk across devices)

---

## Summary

| Topic | Decision | Key Dependencies |
|-------|----------|------------------|
| Auth | Magic link via @supabase/ssr | @supabase/supabase-js, @supabase/ssr |
| Realtime | postgres_changes with user_id filter | Built-in Supabase |
| RLS | User-owned with soft delete support | PostgreSQL policies |
| Offline | localStorage queue, warn at 75% | StorageManager API (where available) |
| IDs | crypto.randomUUID() | Native browser API |

All research items resolved. Ready for Phase 1 design.
