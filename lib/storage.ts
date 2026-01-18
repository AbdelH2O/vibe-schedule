import { AppState, INITIAL_STATE } from './types';

const STORAGE_KEY = 'vibe-schedule-state';

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
    // Ensure all required fields exist (migration safety)
    return {
      contexts: parsed.contexts ?? [],
      tasks: parsed.tasks ?? [],
      mode: parsed.mode ?? 'definition',
      session: parsed.session ?? null,
    };
  } catch {
    console.error('Failed to load state from localStorage');
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
  } catch {
    console.error('Failed to save state to localStorage');
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error('Failed to clear state from localStorage');
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
