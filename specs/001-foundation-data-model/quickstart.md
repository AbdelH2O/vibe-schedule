# Quickstart: Foundation & Data Model

**Feature**: 001-foundation-data-model
**Date**: 2026-01-18

## Prerequisites

- Node.js 18+ installed
- pnpm installed globally (`npm install -g pnpm`)

## Setup

```bash
# Navigate to project
cd /home/station/Documents/vibe-schedule

# Install dependencies (if not already done)
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:3000 in your browser.

## Project Structure

```
vibe-schedule/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (add StoreProvider)
│   ├── page.tsx            # Main page (add AppShell)
│   ├── globals.css         # Global styles
│   └── components/         # UI components (to create)
│       ├── AppShell.tsx    # Main layout structure
│       ├── ModeIndicator.tsx
│       └── Sidebar.tsx
│
├── lib/                    # Data layer (exists)
│   ├── types.ts            # TypeScript type definitions
│   ├── storage.ts          # localStorage utilities
│   └── store.tsx           # React Context state management
│
└── specs/001-foundation-data-model/
    ├── spec.md             # Feature specification
    ├── plan.md             # Implementation plan
    ├── research.md         # Research decisions
    ├── data-model.md       # Entity definitions
    └── quickstart.md       # This file
```

## Key Files to Modify

### 1. Fix lib/store.tsx Import

Move the `useState` import from line 389 to the top of the file with other React imports.

### 2. Update lib/types.ts Comment

Change priority comment from "higher = more important" to "1 = highest priority, 5 = lowest".

### 3. Wrap App with StoreProvider

In `app/layout.tsx`:
```tsx
import { StoreProvider } from '@/lib/store';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
```

### 4. Create App Shell

Replace `app/page.tsx` default content with app shell that uses the store.

## Using the Store

```tsx
'use client';

import { useStore } from '@/lib/store';

export function MyComponent() {
  const { state, isHydrated, addContext } = useStore();

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Mode: {state.mode}</p>
      <p>Contexts: {state.contexts.length}</p>
    </div>
  );
}
```

## Available Store Actions

| Action | Purpose |
|--------|---------|
| `addContext(context)` | Create new context |
| `updateContext(id, updates)` | Modify existing context |
| `deleteContext(id)` | Remove context (moves tasks to inbox) |
| `addTask(task)` | Create new task |
| `updateTask(id, updates)` | Modify existing task |
| `deleteTask(id)` | Remove task |
| `toggleTaskCompleted(id)` | Toggle task completion |
| `moveTaskToContext(taskId, contextId)` | Reassign task |
| `setMode(mode)` | Switch between 'definition' and 'working' |
| `startSession(duration, allocations)` | Begin working session |
| `switchContext(contextId, elapsed)` | Change active context |
| `endSession()` | Complete/cancel session |

## Verification Commands

```bash
# Check for lint errors
pnpm lint

# Build for production
pnpm build

# Run development server
pnpm dev
```

## Testing Persistence

1. Open browser DevTools → Application → Local Storage
2. Look for key: `vibe-schedule-state`
3. Refresh page - data should persist
4. Clear storage - app should reset to empty state

## Common Issues

### Hydration Mismatch

If you see hydration errors, ensure components using `useStore()` are marked with `'use client'` directive.

### localStorage Not Available

In private browsing or with storage disabled, the app operates in memory-only mode. Data won't persist but the app remains functional.

### Type Errors

Run `pnpm build` to check for TypeScript errors. All components should have explicit prop types.
