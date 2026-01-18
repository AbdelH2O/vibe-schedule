# Quickstart: Definition Mode - Context Management

**Date**: 2026-01-18 | **Branch**: `002-context-management`

## Prerequisites

1. Node.js 18+ installed
2. pnpm installed (`npm install -g pnpm`)
3. Repository cloned and on `002-context-management` branch

## Setup

```bash
# Install dependencies
pnpm install

# Add required shadcn/ui components
pnpm dlx shadcn@latest add label select alert-dialog

# Start development server
pnpm dev
```

Open http://localhost:3000 to see the app.

## Development Workflow

### Running the App

```bash
pnpm dev      # Start dev server with hot reload
pnpm build    # Production build (run before committing)
pnpm lint     # Run ESLint
```

### File Locations

| What | Where |
|------|-------|
| New context components | `app/components/contexts/` |
| Shared components | `app/components/shared/` |
| shadcn/ui components | `components/ui/` |
| Store (state management) | `lib/store.tsx` |
| Type definitions | `lib/types.ts` |
| Storage utilities | `lib/storage.ts` |

### Using the Store

```typescript
'use client';

import { useStore } from '@/lib/store';

function MyComponent() {
  const {
    state,
    addContext,
    updateContext,
    deleteContext,
    getContextById
  } = useStore();

  // Access all contexts
  const contexts = state.contexts;

  // Create a context
  const handleCreate = () => {
    addContext({
      name: 'New Context',
      priority: 3,
      weight: 1,
    });
  };

  // Update a context
  const handleUpdate = (id: string) => {
    updateContext(id, { name: 'Updated Name' });
  };

  // Delete a context
  const handleDelete = (id: string) => {
    deleteContext(id); // Tasks auto-moved to Inbox
  };

  return <div>...</div>;
}
```

### Creating a New Component

1. Create file in `app/components/contexts/`:

```typescript
// app/components/contexts/ContextForm.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContextFormProps {
  // Define props with explicit interface
  onSubmit: (data: ContextFormData) => void;
  initialData?: Partial<ContextFormData>;
}

interface ContextFormData {
  name: string;
  priority: number;
  minDuration?: number;
  maxDuration?: number;
  weight: number;
}

export function ContextForm({ onSubmit, initialData }: ContextFormProps) {
  // Implementation...
}
```

2. Use semantic color tokens from Tailwind:

```typescript
// Good - uses theme tokens
<div className="bg-background text-foreground">
<span className="text-muted-foreground">

// Avoid - hardcoded colors
<div className="bg-white text-black">
```

3. Import Lucide icons for UI:

```typescript
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';

<Button>
  <Plus className="size-4 mr-2" />
  Add Context
</Button>
```

### Testing Changes

1. **Visual testing**: Check the UI in browser at http://localhost:3000
2. **Persistence test**: Create data, refresh page, verify data persists
3. **Build test**: Run `pnpm build` to catch TypeScript errors
4. **Lint test**: Run `pnpm lint` for code style issues

### Common Patterns

#### Controlled Form Inputs

```typescript
const [name, setName] = useState(initialData?.name ?? '');
const [priority, setPriority] = useState(initialData?.priority ?? 3);

<Input
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Context name"
/>
```

#### Validation Error Display

```typescript
const [error, setError] = useState<string | null>(null);

const validate = () => {
  if (!name.trim()) {
    setError('Context name is required');
    return false;
  }
  if (minDuration && maxDuration && minDuration > maxDuration) {
    setError('Minimum cannot exceed maximum duration');
    return false;
  }
  setError(null);
  return true;
};

{error && (
  <p className="text-sm text-destructive">{error}</p>
)}
```

#### Countdown Badge

```typescript
function getDaysRemaining(date: string): number {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function CountdownBadge({ date }: { date: string }) {
  const days = getDaysRemaining(date);

  if (days < 0) {
    return <Badge variant="destructive">Overdue</Badge>;
  }
  if (days <= 7) {
    return <Badge variant="warning">{days} days</Badge>;
  }
  return <Badge variant="secondary">{days} days</Badge>;
}
```

## Architecture Notes

### Component Hierarchy

```
AppShell
├── Header (with ModeIndicator)
├── Sidebar
│   ├── ContextList
│   │   └── ContextListItem (×n)
│   └── Inbox link
└── Main Content
    └── ContextDetail (when context selected)
        ├── ContextForm (edit mode)
        └── ImportantDateList
            └── ImportantDateForm
```

### State Flow

```
User Interaction
       ↓
Component calls store action (e.g., addContext)
       ↓
Reducer updates state
       ↓
React re-renders affected components
       ↓
useEffect persists to localStorage
```

### Mode Awareness

Context management is only available in Definition Mode. Check mode before enabling structural changes:

```typescript
const { state } = useStore();

if (state.mode !== 'definition') {
  return <p>Switch to Definition Mode to edit contexts.</p>;
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Components not updating | Check `useStore()` is called inside `StoreProvider` |
| Data not persisting | Check browser localStorage in DevTools |
| Type errors | Run `pnpm build` to see full TypeScript output |
| Styling issues | Ensure using Tailwind classes, not custom CSS |
