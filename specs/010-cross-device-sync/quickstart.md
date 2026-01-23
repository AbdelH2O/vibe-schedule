# Quickstart: Cross-Device Data Synchronization

**Date**: 2026-01-21
**Feature**: 010-cross-device-sync

This guide covers setting up the development environment for the cross-device sync feature.

## Prerequisites

- Node.js 18+ (for crypto.randomUUID support)
- pnpm 8+
- Supabase account (free tier is sufficient)

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: `vibe-schedule-dev` (or your preference)
   - **Database Password**: Generate and save securely
   - **Region**: Choose closest to you
4. Wait for project to provision (~2 minutes)

## 2. Get API Keys

1. In Supabase Dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1...`

## 3. Configure Environment

Create `.env.local` in project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Add to `.gitignore` (if not already):
```
.env.local
```

## 4. Install Dependencies

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

## 5. Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy contents of `specs/010-cross-device-sync/contracts/database.sql`
4. Click "Run"
5. Verify tables created in **Table Editor**

## 6. Configure Authentication

### Enable Magic Link

1. Go to **Authentication > Providers**
2. Under "Email", ensure enabled
3. Leave "Confirm email" **disabled** for magic link flow

### Configure Email Templates

1. Go to **Authentication > Email Templates**
2. Select "Magic Link"
3. Update template to use token_hash format:

```html
<h2>Magic Link</h2>
<p>Click below to sign in to Vibe Schedule:</p>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Sign In</a></p>
<p>This link expires in 1 hour.</p>
```

### Configure Session Settings

1. Go to **Authentication > Settings**
2. Under "Session settings":
   - **Inactivity timeout**: `2592000` (30 days in seconds)
3. Under "Email settings":
   - **OTP Expiration**: `3600` (1 hour)

## 7. Enable Realtime

1. Go to **Database > Replication**
2. Under "Supabase Realtime", click "0 tables"
3. Enable for all tables:
   - `contexts`
   - `tasks`
   - `sessions`
   - `reminders`
   - `session_presets`
   - `user_preferences`
   - `devices`

## 8. Create Supabase Client Files

### `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `lib/supabase/server.ts`

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
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors from Server Components
          }
        },
      },
    }
  )
}
```

### `lib/supabase/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Use getUser() for server-side validation
  await supabase.auth.getUser()

  return supabaseResponse
}
```

### `middleware.ts` (project root)

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## 9. Verify Setup

### Test Database Connection

```typescript
// Run in browser console or test file
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.from('contexts').select('count')
console.log('Connection test:', { data, error })
```

### Test Magic Link

```typescript
const { error } = await supabase.auth.signInWithOtp({
  email: 'test@example.com',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})
console.log('Magic link sent:', error ? error.message : 'Success')
```

## 10. Development Workflow

### Local Development

```bash
pnpm dev
```

### View Realtime Logs

1. Supabase Dashboard > **Logs > Realtime**
2. Filter by `postgres_changes` to see sync events

### Debug RLS Policies

```sql
-- In SQL Editor: Test as specific user
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM contexts;
```

### Monitor Auth Events

1. Supabase Dashboard > **Authentication > Users**
2. View recent sign-ins and failed attempts

## Common Issues

### "Invalid API key"
- Verify `.env.local` values match Dashboard
- Restart dev server after changing env vars

### "RLS policy violation"
- Check that `user_id` column matches `auth.uid()`
- Verify user is authenticated before queries

### "Realtime not receiving updates"
- Confirm tables are enabled in Replication settings
- Check browser console for WebSocket errors
- Verify subscription filter matches data

### "Magic link not received"
- Check spam folder
- Supabase free tier: 3 emails/hour limit
- Configure custom SMTP for production

## Next Steps

After setup is verified:

1. Run `/speckit.tasks` to generate implementation tasks
2. Implement auth UI components
3. Implement sync engine
4. Add migration logic for existing local data
