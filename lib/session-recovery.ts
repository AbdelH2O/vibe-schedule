// Session recovery state management
// Tracks whether an existing session was found on initial page load

type Listener = () => void;

interface SessionRecoveryState {
  checked: boolean;
  hasExistingSession: boolean;
  handled: boolean;
}

let state: SessionRecoveryState = {
  checked: false,
  hasExistingSession: false,
  handled: false,
};

const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function checkForExistingSession(hasSession: boolean, mode: string): void {
  if (state.checked) return;

  state = {
    ...state,
    checked: true,
    hasExistingSession: hasSession && mode === 'working',
  };
  emitChange();
}

export function markRecoveryHandled(): void {
  state = {
    ...state,
    handled: true,
  };
  emitChange();
}

export function shouldShowRecoveryDialog(): boolean {
  return state.checked && state.hasExistingSession && !state.handled;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): SessionRecoveryState {
  return state;
}

export function getServerSnapshot(): SessionRecoveryState {
  return {
    checked: false,
    hasExistingSession: false,
    handled: false,
  };
}
