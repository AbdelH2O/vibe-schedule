# Implementation Plan: Cross-Device Data Synchronization

**Branch**: `010-cross-device-sync` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-cross-device-sync/spec.md`

## Summary

Implement real-time cross-device synchronization for vibe-schedule while maintaining offline-first architecture. The feature adds user authentication via magic link, real-time data sync using WebSocket subscriptions, an offline change queue with automatic sync on reconnection, session ownership protocol for timer handoff between devices, and a one-time migration path for existing local data.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 16.1.3, React 19.2.3, shadcn/ui, Radix UI primitives, Supabase JS client
**Storage**: Supabase PostgreSQL (cloud) + localStorage (offline queue, device ID)
**Testing**: Manual testing (existing pattern), ESLint for static analysis
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: <2 seconds sync latency, <100ms local operations
**Constraints**: Offline-capable, 30-day session expiry, 30-minute session ownership timeout
**Scale/Scope**: 5+ concurrent devices per user, existing data model (6 entity types)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Flow Over Rigidity | PASS | Sync is transparent; no modals interrupt user flow except explicit sign-in/out |
| II. Context-First Architecture | PASS | Data model preserves context as primary unit; sync adds metadata without changing structure |
| III. Flexible Constraints | PASS | Session ownership is advisory (30-min auto-release); user retains control |
| IV. Simplicity First | PASS | Uses existing DataProvider interface; Supabase handles complexity; LWW is simplest conflict strategy |
| V. Dual-Mode Clarity | PASS | Sync operates in both modes; session ownership only relevant in Working Mode |

**Stack Requirements Check:**
- Next.js 16 App Router: PASS (existing)
- React 19 Server Components: PASS (existing)
- shadcn/ui: PASS (existing)
- TypeScript strict: PASS (existing)
- Tailwind CSS 4: PASS (existing)
- pnpm: PASS (existing)

**Quality Gates Check:**
- Typed prop interfaces: PASS (will maintain)
- Server/client components marked: PASS (will maintain)
- Input validation: PASS (Supabase RLS + client validation)
- Accessibility: PASS (sync UI will use existing accessible patterns)

## Project Structure

### Documentation (this feature)

```text
specs/010-cross-device-sync/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── components/
│   ├── auth/                    # NEW: Authentication UI
│   │   ├── AuthProvider.tsx     # Auth state context
│   │   ├── SignInDialog.tsx     # Magic link sign-in
│   │   └── SignOutDialog.tsx    # Sign-out with data choice
│   ├── sync/                    # NEW: Sync UI components
│   │   ├── SyncStatusIndicator.tsx
│   │   └── MigrationProgress.tsx
│   └── settings/
│       └── DataManagement.tsx   # Existing, add sync section
├── auth/                        # NEW: Auth callback route
│   └── callback/
│       └── route.ts
└── page.tsx                     # Add auth/sync providers

lib/
├── sync/                        # NEW: Sync infrastructure
│   ├── SyncEngine.ts            # Coordinates sync operations
│   ├── outbox.ts                # Offline change queue
│   ├── conflicts.ts             # LWW + session max resolution
│   └── supabaseProvider.ts      # DataProvider for Supabase
├── supabase/                    # NEW: Supabase client
│   ├── client.ts                # Browser client
│   └── types.ts                 # Generated DB types
├── device.ts                    # NEW: Device registration
├── types.ts                     # Extend with SyncMetadata, DeviceInfo
├── dataProvider.ts              # Extend interface for sync
├── storage.ts                   # Update ID generation to UUID
└── store.tsx                    # Integrate sync engine

components/ui/                   # Existing shadcn/ui components
```

**Structure Decision**: Extends existing Next.js App Router structure. New sync code isolated in `lib/sync/` and `app/components/auth/` + `app/components/sync/` directories. Supabase client in `lib/supabase/`. Auth callback in `app/auth/callback/`.

## Complexity Tracking

> No violations requiring justification. Design follows Simplicity First principle:
> - Uses existing DataProvider abstraction (no new patterns)
> - LWW conflict resolution (simplest viable strategy)
> - Single Supabase dependency (no custom backend)
> - Outbox pattern for offline (well-established, minimal code)

| Aspect | Approach | Simpler Alternative Considered |
|--------|----------|-------------------------------|
| Real-time sync | Supabase Realtime (WebSocket) | Polling rejected: higher latency, more battery usage |
| Session ownership | Database lock + 30-min timeout | Client-only rejected: cannot enforce across devices |
| ID generation | UUID v4 (crypto.randomUUID) | Keep timestamp-random rejected: collision risk across devices |

## Phase 0: Research Required

The following items need research before detailed design:

1. **Supabase Auth Magic Link**: Best practices for Next.js 16 App Router integration
2. **Supabase Realtime**: Subscription patterns for React 19, reconnection handling
3. **Row Level Security**: Patterns for user data isolation
4. **Offline Queue**: localStorage persistence limits, quota detection
5. **UUID Generation**: Browser support for crypto.randomUUID()

## Phase 1: Design Deliverables

After research, generate:
- `data-model.md`: Extended entity schemas with sync metadata
- `contracts/database.sql`: Supabase schema with RLS policies
- `contracts/realtime.md`: Subscription channel structure
- `quickstart.md`: Developer setup for Supabase project
