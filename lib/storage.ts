import { AppState, Context, Task, INITIAL_STATE } from './types';
import { toast } from 'sonner';
import { getDefaultColorByIndex } from './colors';
import { generateInitialPositions } from './position';

const STORAGE_KEY = 'vibe-schedule-state';

// Track if we've shown storage errors to avoid spamming
let hasShownLoadError = false;
let hasShownSaveError = false;

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return INITIAL_STATE;
  }

  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(serialized) as AppState;

    // Validate basic structure
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid state structure');
    }

    // Ensure all required fields exist (migration safety)
    let session = parsed.session ?? null;
    let mode: 'definition' | 'working' = parsed.mode === 'working' ? 'working' : 'definition';

    // Auto-suspend active sessions on page load (handles page refresh case)
    if (session && (session.status === 'active' || session.status === 'paused')) {
      session = { ...session, status: 'suspended' as const, contextStartedAt: null };
      mode = 'definition';
    }

    // Migrate contexts: add color to contexts without one
    const contexts: Context[] = Array.isArray(parsed.contexts)
      ? parsed.contexts.map((ctx: Partial<Context>, index: number) => ({
          ...ctx,
          color: ctx.color ?? getDefaultColorByIndex(index),
        })) as Context[]
      : [];

    // Migrate tasks: add position and parentId to tasks without them
    const rawTasks: Task[] = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    const tasksNeedingPosition = rawTasks.filter((t) => !t.position);
    const tasksNeedingParentId = rawTasks.filter((t) => t.parentId === undefined);

    let tasks = rawTasks;

    // Add parentId to tasks that don't have it (migration from pre-hierarchy version)
    if (tasksNeedingParentId.length > 0) {
      tasks = tasks.map((task) => ({
        ...task,
        parentId: task.parentId ?? null,
      }));
    }

    if (tasksNeedingPosition.length > 0) {
      // Group tasks by contextId, sorted by createdAt
      const tasksByContext = new Map<string | null, Task[]>();
      for (const task of tasks) {
        const contextId = task.contextId;
        if (!tasksByContext.has(contextId)) {
          tasksByContext.set(contextId, []);
        }
        tasksByContext.get(contextId)!.push(task);
      }

      // Assign positions within each context
      tasks = [];
      for (const [, contextTasks] of tasksByContext) {
        // Sort by createdAt to maintain insertion order
        contextTasks.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        const positions = generateInitialPositions(contextTasks.length);
        for (let i = 0; i < contextTasks.length; i++) {
          tasks.push({
            ...contextTasks[i],
            position: contextTasks[i].position || positions[i],
          });
        }
      }
    }

    return {
      contexts,
      tasks,
      mode,
      session,
      presets: Array.isArray(parsed.presets) ? parsed.presets : [],
      // Reminder-related fields (migration safety)
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
      userLocation: parsed.userLocation ?? null,
      notificationPermission: parsed.notificationPermission ?? 'default',
      // Sidebar preferences (migration safety)
      sidebarPreferences: parsed.sidebarPreferences ?? { deadlineScopeFilter: 'all' },
      // Task hierarchy expansion state (migration safety)
      expandedTaskIds: Array.isArray(parsed.expandedTaskIds) ? parsed.expandedTaskIds : [],
    };
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);

    // Show toast only once per page load
    if (!hasShownLoadError) {
      hasShownLoadError = true;
      // Use setTimeout to ensure toast is called after hydration
      setTimeout(() => {
        toast.error('Failed to load saved data', {
          description: 'Starting fresh. Your previous data may be corrupted.',
          duration: 5000,
        });
      }, 100);
    }

    return INITIAL_STATE;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    // Reset error flag on successful save
    hasShownSaveError = false;
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);

    // Show toast only once to avoid spam during rapid updates
    if (!hasShownSaveError) {
      hasShownSaveError = true;
      toast.error('Failed to save changes', {
        description: 'Storage may be full. Some changes may not persist.',
        duration: 5000,
      });
    }
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Data cleared', {
      description: 'All local data has been removed.',
    });
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
    toast.error('Failed to clear data', {
      description: 'Please try again or clear browser data manually.',
    });
  }
}

// Generate a unique ID using UUID v4
// Uses crypto.randomUUID() for cross-device sync compatibility
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers (unlikely needed, but safe)
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Get current ISO timestamp
export function now(): string {
  return new Date().toISOString();
}

/**
 * Clear all local data on sign-out.
 * Removes app state and sync-related localStorage items.
 * This is the same as clearState but also clears sync-related keys.
 */
export function clearLocalData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Clear main app state
    localStorage.removeItem(STORAGE_KEY);
    // Clear sync-related keys (outbox, etc.)
    localStorage.removeItem('vibe-schedule-outbox');
    localStorage.removeItem('vibe-schedule-last-export');
    // Note: Device ID is intentionally NOT cleared to maintain device identity
    toast.success('Local data cleared', {
      description: 'All local data has been removed. Your cloud data remains safe.',
    });
  } catch (error) {
    console.error('Failed to clear local data:', error);
    toast.error('Failed to clear data', {
      description: 'Please try again or clear browser data manually.',
    });
  }
}
