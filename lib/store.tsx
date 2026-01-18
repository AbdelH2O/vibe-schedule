'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import {
  AppState,
  Context,
  Task,
  Session,
  AppMode,
  ContextAllocation,
  INITIAL_STATE,
} from './types';
import { loadState, saveState, generateId, now } from './storage';

// Action types
type Action =
  // Context actions
  | { type: 'ADD_CONTEXT'; payload: Omit<Context, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_CONTEXT'; payload: { id: string; updates: Partial<Context> } }
  | { type: 'DELETE_CONTEXT'; payload: string }
  // Task actions
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETED'; payload: string }
  | { type: 'MOVE_TASK_TO_CONTEXT'; payload: { taskId: string; contextId: string | null } }
  // Mode actions
  | { type: 'SET_MODE'; payload: AppMode }
  // Session actions
  | { type: 'START_SESSION'; payload: { totalDuration: number; allocations: ContextAllocation[] } }
  | { type: 'SWITCH_CONTEXT'; payload: { contextId: string; elapsedMinutes: number } }
  | { type: 'UPDATE_SESSION_TIME'; payload: { contextId: string; usedMinutes: number } }
  | { type: 'END_SESSION' }
  | { type: 'PAUSE_SESSION' }
  | { type: 'RESUME_SESSION' }
  // State hydration
  | { type: 'HYDRATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    // Context actions
    case 'ADD_CONTEXT': {
      const newContext: Context = {
        ...action.payload,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      };
      return { ...state, contexts: [...state.contexts, newContext] };
    }
    case 'UPDATE_CONTEXT': {
      return {
        ...state,
        contexts: state.contexts.map((ctx) =>
          ctx.id === action.payload.id
            ? { ...ctx, ...action.payload.updates, updatedAt: now() }
            : ctx
        ),
      };
    }
    case 'DELETE_CONTEXT': {
      // Move tasks from deleted context to inbox
      return {
        ...state,
        contexts: state.contexts.filter((ctx) => ctx.id !== action.payload),
        tasks: state.tasks.map((task) =>
          task.contextId === action.payload
            ? { ...task, contextId: null, updatedAt: now() }
            : task
        ),
      };
    }

    // Task actions
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: generateId(),
        completed: false,
        createdAt: now(),
        updatedAt: now(),
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }
    case 'UPDATE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: now() }
            : task
        ),
      };
    }
    case 'DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    }
    case 'TOGGLE_TASK_COMPLETED': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: now() }
            : task
        ),
      };
    }
    case 'MOVE_TASK_TO_CONTEXT': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, contextId: action.payload.contextId, updatedAt: now() }
            : task
        ),
      };
    }

    // Mode actions
    case 'SET_MODE': {
      return { ...state, mode: action.payload };
    }

    // Session actions
    case 'START_SESSION': {
      const session: Session = {
        id: generateId(),
        totalDuration: action.payload.totalDuration,
        startedAt: now(),
        allocations: action.payload.allocations,
        activeContextId: action.payload.allocations[0]?.contextId ?? null,
        contextStartedAt: now(),
        status: 'active',
      };
      return { ...state, session, mode: 'working' };
    }
    case 'SWITCH_CONTEXT': {
      if (!state.session) return state;
      const updatedAllocations = state.session.allocations.map((alloc) =>
        alloc.contextId === state.session!.activeContextId
          ? { ...alloc, usedMinutes: action.payload.elapsedMinutes }
          : alloc
      );
      return {
        ...state,
        session: {
          ...state.session,
          allocations: updatedAllocations,
          activeContextId: action.payload.contextId,
          contextStartedAt: now(),
        },
      };
    }
    case 'UPDATE_SESSION_TIME': {
      if (!state.session) return state;
      return {
        ...state,
        session: {
          ...state.session,
          allocations: state.session.allocations.map((alloc) =>
            alloc.contextId === action.payload.contextId
              ? { ...alloc, usedMinutes: action.payload.usedMinutes }
              : alloc
          ),
        },
      };
    }
    case 'END_SESSION': {
      return { ...state, session: null, mode: 'definition' };
    }
    case 'PAUSE_SESSION': {
      if (!state.session) return state;
      return {
        ...state,
        session: { ...state.session, status: 'paused' },
      };
    }
    case 'RESUME_SESSION': {
      if (!state.session) return state;
      return {
        ...state,
        session: { ...state.session, status: 'active', contextStartedAt: now() },
      };
    }

    // Hydration
    case 'HYDRATE': {
      return action.payload;
    }

    default:
      return state;
  }
}

// Context type
interface StoreContextType {
  state: AppState;
  isHydrated: boolean;
  // Context actions
  addContext: (context: Omit<Context, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContext: (id: string, updates: Partial<Context>) => void;
  deleteContext: (id: string) => void;
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  moveTaskToContext: (taskId: string, contextId: string | null) => void;
  // Mode actions
  setMode: (mode: AppMode) => void;
  // Session actions
  startSession: (totalDuration: number, allocations: ContextAllocation[]) => void;
  switchContext: (contextId: string, elapsedMinutes: number) => void;
  updateSessionTime: (contextId: string, usedMinutes: number) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  // Selectors
  getContextById: (id: string) => Context | undefined;
  getTasksByContextId: (contextId: string | null) => Task[];
  getInboxTasks: () => Task[];
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const isInitialMount = useRef(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadState();
    dispatch({ type: 'HYDRATE', payload: stored });
    // Use queueMicrotask to defer the state update outside of the effect body
    queueMicrotask(() => setIsHydrated(true));
  }, []);

  // Persist to localStorage on state change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isHydrated) {
      saveState(state);
    }
  }, [state, isHydrated]);

  // Context actions
  const addContext = useCallback(
    (context: Omit<Context, 'id' | 'createdAt' | 'updatedAt'>) => {
      dispatch({ type: 'ADD_CONTEXT', payload: context });
    },
    []
  );

  const updateContext = useCallback((id: string, updates: Partial<Context>) => {
    dispatch({ type: 'UPDATE_CONTEXT', payload: { id, updates } });
  }, []);

  const deleteContext = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CONTEXT', payload: id });
  }, []);

  // Task actions
  const addTask = useCallback(
    (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => {
      dispatch({ type: 'ADD_TASK', payload: task });
    },
    []
  );

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const toggleTaskCompleted = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TASK_COMPLETED', payload: id });
  }, []);

  const moveTaskToContext = useCallback(
    (taskId: string, contextId: string | null) => {
      dispatch({ type: 'MOVE_TASK_TO_CONTEXT', payload: { taskId, contextId } });
    },
    []
  );

  // Mode actions
  const setMode = useCallback((mode: AppMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  // Session actions
  const startSession = useCallback(
    (totalDuration: number, allocations: ContextAllocation[]) => {
      dispatch({ type: 'START_SESSION', payload: { totalDuration, allocations } });
    },
    []
  );

  const switchContext = useCallback(
    (contextId: string, elapsedMinutes: number) => {
      dispatch({ type: 'SWITCH_CONTEXT', payload: { contextId, elapsedMinutes } });
    },
    []
  );

  const updateSessionTime = useCallback(
    (contextId: string, usedMinutes: number) => {
      dispatch({ type: 'UPDATE_SESSION_TIME', payload: { contextId, usedMinutes } });
    },
    []
  );

  const endSession = useCallback(() => {
    dispatch({ type: 'END_SESSION' });
  }, []);

  const pauseSession = useCallback(() => {
    dispatch({ type: 'PAUSE_SESSION' });
  }, []);

  const resumeSession = useCallback(() => {
    dispatch({ type: 'RESUME_SESSION' });
  }, []);

  // Selectors
  const getContextById = useCallback(
    (id: string) => state.contexts.find((ctx) => ctx.id === id),
    [state.contexts]
  );

  const getTasksByContextId = useCallback(
    (contextId: string | null) =>
      state.tasks.filter((task) => task.contextId === contextId),
    [state.tasks]
  );

  const getInboxTasks = useCallback(
    () => state.tasks.filter((task) => task.contextId === null),
    [state.tasks]
  );

  const value: StoreContextType = {
    state,
    isHydrated,
    addContext,
    updateContext,
    deleteContext,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    moveTaskToContext,
    setMode,
    startSession,
    switchContext,
    updateSessionTime,
    endSession,
    pauseSession,
    resumeSession,
    getContextById,
    getTasksByContextId,
    getInboxTasks,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
