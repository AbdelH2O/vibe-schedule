import { AppState, INITIAL_STATE } from './types';
import { toast } from 'sonner';

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

    return {
      contexts: Array.isArray(parsed.contexts) ? parsed.contexts : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      mode,
      session,
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

// Generate a unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Get current ISO timestamp
export function now(): string {
  return new Date().toISOString();
}
