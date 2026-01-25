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
  SessionPreset,
  AppMode,
  ContextAllocation,
  INITIAL_STATE,
  Reminder,
  UserLocation,
  TriggeredNotification,
  NotificationRuntimeState,
  SidebarPreferences,
  ImportantDate,
} from './types';
import { loadState, saveState, generateId, now } from './storage';
import { getDemoData } from './demoData';
import { generateEndPosition } from './position';
import { getDescendants, getChildren, isDescendantOf } from './taskHierarchy';

// Action types
type Action =
  // Context actions
  | { type: 'ADD_CONTEXT'; payload: Omit<Context, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_CONTEXT'; payload: { id: string; updates: Partial<Context> } }
  | { type: 'DELETE_CONTEXT'; payload: string }
  // Sync actions (for realtime updates from other devices)
  | { type: 'SYNC_INSERT_CONTEXT'; payload: Context }
  | { type: 'SYNC_UPDATE_CONTEXT'; payload: Context }
  | { type: 'SYNC_DELETE_CONTEXT'; payload: string }
  | { type: 'SYNC_INSERT_TASK'; payload: Task }
  | { type: 'SYNC_UPDATE_TASK'; payload: Task }
  | { type: 'SYNC_DELETE_TASK'; payload: string }
  | { type: 'SYNC_INSERT_REMINDER'; payload: Reminder }
  | { type: 'SYNC_UPDATE_REMINDER'; payload: Reminder }
  | { type: 'SYNC_DELETE_REMINDER'; payload: string }
  | { type: 'SYNC_INSERT_PRESET'; payload: SessionPreset }
  | { type: 'SYNC_UPDATE_PRESET'; payload: SessionPreset }
  | { type: 'SYNC_DELETE_PRESET'; payload: string }
  | { type: 'SYNC_UPDATE_SESSION'; payload: Session }
  | { type: 'SYNC_UPDATE_PREFERENCES'; payload: Partial<AppState> }
  // Task actions
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'position' | 'parentId'> & { parentId?: string | null } }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETED'; payload: string }
  | { type: 'MOVE_TASK_TO_CONTEXT'; payload: { taskId: string; contextId: string | null } }
  | { type: 'REORDER_TASK'; payload: { taskId: string; newPosition: string } }
  // Mode actions
  | { type: 'SET_MODE'; payload: AppMode }
  // Session actions
  | { type: 'START_SESSION'; payload: { totalDuration: number; allocations: ContextAllocation[] } }
  | { type: 'SWITCH_CONTEXT'; payload: { contextId: string; elapsedMinutes: number } }
  | { type: 'UPDATE_SESSION_TIME'; payload: { contextId: string; usedMinutes: number } }
  | { type: 'ADJUST_CONTEXT_TIME'; payload: { contextId: string; newRemainingMinutes: number; currentElapsedMinutes: number } }
  | { type: 'END_SESSION' }
  | { type: 'PAUSE_SESSION' }
  | { type: 'RESUME_SESSION' }
  | { type: 'SUSPEND_SESSION'; payload: { elapsedMinutes: number } }
  // Preset actions
  | { type: 'ADD_PRESET'; payload: Omit<SessionPreset, 'id' | 'createdAt'> }
  | { type: 'DELETE_PRESET'; payload: string }
  // State hydration
  | { type: 'HYDRATE'; payload: AppState }
  // Demo data
  | { type: 'LOAD_DEMO_DATA'; payload: { contexts: Context[]; tasks: Task[] } }
  // Reminder actions
  | { type: 'ADD_REMINDER'; payload: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_REMINDER'; payload: { id: string; updates: Partial<Reminder> } }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'TOGGLE_REMINDER_ENABLED'; payload: string }
  | { type: 'UPDATE_REMINDER_LAST_TRIGGERED'; payload: { id: string; triggeredAt: string } }
  // User location actions
  | { type: 'SET_USER_LOCATION'; payload: UserLocation | null }
  | { type: 'SET_NOTIFICATION_PERMISSION'; payload: 'default' | 'granted' | 'denied' }
  // Sidebar preferences actions
  | { type: 'UPDATE_SIDEBAR_PREFERENCES'; payload: Partial<SidebarPreferences> }
  // Important date actions
  | { type: 'ADD_IMPORTANT_DATE'; payload: { contextId: string; date: Omit<ImportantDate, 'id'> } }
  | { type: 'DELETE_IMPORTANT_DATE'; payload: { contextId: string; dateId: string } }
  // Task hierarchy actions
  | { type: 'TOGGLE_TASK_EXPANDED'; payload: string }
  | { type: 'SET_TASKS_EXPANDED'; payload: { taskIds: string[]; expanded: boolean } }
  | { type: 'ADD_SUBTASK'; payload: { parentId: string; title: string; description?: string; deadline?: string } }
  | { type: 'MOVE_TASK_TO_PARENT'; payload: { taskId: string; newParentId: string | null } };

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
      const parentId = action.payload.parentId ?? null;

      // If task has a parent, inherit contextId from parent
      let contextId = action.payload.contextId;
      if (parentId) {
        const parentTask = state.tasks.find((t) => t.id === parentId);
        if (parentTask) {
          contextId = parentTask.contextId;
        }
      }

      // Find sibling tasks (same parent) to calculate position at end
      const siblingTasks = state.tasks.filter(
        (t) => t.parentId === parentId && t.contextId === contextId && !t.completed
      );
      const position = generateEndPosition(siblingTasks);

      const newTask: Task = {
        ...action.payload,
        id: generateId(),
        contextId,
        parentId,
        completed: false,
        position,
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
      // Get all descendant tasks to cascade delete
      const descendants = getDescendants(state.tasks, action.payload);
      const idsToDelete = new Set([action.payload, ...descendants.map((d) => d.id)]);

      // Remove deleted task IDs from expandedTaskIds
      const newExpandedTaskIds = (state.expandedTaskIds || []).filter(
        (id) => !idsToDelete.has(id)
      );

      return {
        ...state,
        tasks: state.tasks.filter((task) => !idsToDelete.has(task.id)),
        expandedTaskIds: newExpandedTaskIds,
      };
    }
    case 'TOGGLE_TASK_COMPLETED': {
      const targetTask = state.tasks.find((t) => t.id === action.payload);
      if (!targetTask) return state;

      // If uncompleting, assign position at end of active tasks in same context
      let newPosition = targetTask.position;
      if (targetTask.completed) {
        const activeTasksInContext = state.tasks.filter(
          (t) => t.contextId === targetTask.contextId && !t.completed && t.id !== targetTask.id
        );
        newPosition = generateEndPosition(activeTasksInContext);
      }

      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, position: newPosition, updatedAt: now() }
            : task
        ),
      };
    }
    case 'MOVE_TASK_TO_CONTEXT': {
      // Find the target task
      const targetTask = state.tasks.find((t) => t.id === action.payload.taskId);
      if (!targetTask) return state;

      // Get all descendants to cascade the context change
      const descendants = getDescendants(state.tasks, action.payload.taskId);
      const idsToUpdate = new Set([action.payload.taskId, ...descendants.map((d) => d.id)]);

      // Find tasks in the target context (at root level for this parent) to calculate position at end
      const targetContextTasks = state.tasks.filter(
        (t) =>
          t.contextId === action.payload.contextId &&
          t.parentId === targetTask.parentId &&
          !t.completed &&
          t.id !== action.payload.taskId
      );
      const newPosition = generateEndPosition(targetContextTasks);

      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload.taskId) {
            // Main task: update context and position
            return { ...task, contextId: action.payload.contextId, position: newPosition, updatedAt: now() };
          } else if (idsToUpdate.has(task.id)) {
            // Descendant: only update context
            return { ...task, contextId: action.payload.contextId, updatedAt: now() };
          }
          return task;
        }),
      };
    }
    case 'REORDER_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, position: action.payload.newPosition, updatedAt: now() }
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
      // Initialize adjustedMinutes: 0 for all allocations
      const initializedAllocations = action.payload.allocations.map((alloc) => ({
        ...alloc,
        adjustedMinutes: alloc.adjustedMinutes ?? 0,
      }));
      const session: Session = {
        id: generateId(),
        totalDuration: action.payload.totalDuration,
        startedAt: now(),
        allocations: initializedAllocations,
        activeContextId: initializedAllocations[0]?.contextId ?? null,
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
    case 'ADJUST_CONTEXT_TIME': {
      if (!state.session) return state;

      const { contextId, newRemainingMinutes, currentElapsedMinutes } = action.payload;
      const targetAlloc = state.session.allocations.find((a) => a.contextId === contextId);
      if (!targetAlloc) return state;

      // Formula: remaining = allocated - usedMinutes - elapsed
      // To achieve newRemaining: newUsedMinutes = allocated - newRemaining - elapsed
      // Constraint: newUsedMinutes >= 0 (can't have negative used time)
      // Maximum remaining = allocated - elapsed (when usedMinutes = 0)
      const maxRemaining = targetAlloc.allocatedMinutes - currentElapsedMinutes;
      const clampedRemaining = Math.min(newRemainingMinutes, maxRemaining);
      const newUsedMinutes = Math.max(0, targetAlloc.allocatedMinutes - clampedRemaining - currentElapsedMinutes);

      // Update allocations with new usedMinutes
      const updatedAllocations = state.session.allocations.map((alloc) =>
        alloc.contextId === contextId
          ? { ...alloc, usedMinutes: newUsedMinutes }
          : alloc
      );

      return {
        ...state,
        session: {
          ...state.session,
          allocations: updatedAllocations,
        },
      };
    }
    case 'END_SESSION': {
      // Reset lastTriggeredAt for session-only reminders so they start fresh next session
      const resetReminders = (state.reminders || []).map((reminder) =>
        reminder.scope === 'session-only'
          ? { ...reminder, lastTriggeredAt: undefined }
          : reminder
      );
      return { ...state, session: null, mode: 'definition', reminders: resetReminders };
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
      // Handle resuming from both 'paused' and 'suspended' statuses
      return {
        ...state,
        mode: 'working',
        session: { ...state.session, status: 'active', contextStartedAt: now() },
      };
    }
    case 'SUSPEND_SESSION': {
      if (!state.session) return state;
      // Update active context's usedMinutes with elapsed time
      const updatedAllocations = state.session.allocations.map((alloc) =>
        alloc.contextId === state.session!.activeContextId
          ? { ...alloc, usedMinutes: alloc.usedMinutes + action.payload.elapsedMinutes }
          : alloc
      );
      return {
        ...state,
        mode: 'definition',
        session: {
          ...state.session,
          allocations: updatedAllocations,
          status: 'suspended',
          contextStartedAt: null,
        },
      };
    }

    // Preset actions
    case 'ADD_PRESET': {
      const newPreset: SessionPreset = {
        ...action.payload,
        id: generateId(),
        createdAt: now(),
      };
      return { ...state, presets: [...(state.presets || []), newPreset] };
    }
    case 'DELETE_PRESET': {
      return {
        ...state,
        presets: (state.presets || []).filter((preset) => preset.id !== action.payload),
      };
    }

    // Hydration
    case 'HYDRATE': {
      // Ensure presets array exists for backwards compatibility
      return { ...action.payload, presets: action.payload.presets || [] };
    }

    // Demo data
    case 'LOAD_DEMO_DATA': {
      return {
        ...state,
        contexts: action.payload.contexts,
        tasks: action.payload.tasks,
      };
    }

    // Reminder actions
    case 'ADD_REMINDER': {
      const newReminder: Reminder = {
        ...action.payload,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
      };
      return { ...state, reminders: [...(state.reminders || []), newReminder] };
    }
    case 'UPDATE_REMINDER': {
      return {
        ...state,
        reminders: (state.reminders || []).map((reminder) =>
          reminder.id === action.payload.id
            ? { ...reminder, ...action.payload.updates, updatedAt: now() }
            : reminder
        ),
      };
    }
    case 'DELETE_REMINDER': {
      return {
        ...state,
        reminders: (state.reminders || []).filter((reminder) => reminder.id !== action.payload),
      };
    }
    case 'TOGGLE_REMINDER_ENABLED': {
      return {
        ...state,
        reminders: (state.reminders || []).map((reminder) =>
          reminder.id === action.payload
            ? { ...reminder, enabled: !reminder.enabled, updatedAt: now() }
            : reminder
        ),
      };
    }
    case 'UPDATE_REMINDER_LAST_TRIGGERED': {
      return {
        ...state,
        reminders: (state.reminders || []).map((reminder) =>
          reminder.id === action.payload.id
            ? { ...reminder, lastTriggeredAt: action.payload.triggeredAt, updatedAt: now() }
            : reminder
        ),
      };
    }

    // User location actions
    case 'SET_USER_LOCATION': {
      return { ...state, userLocation: action.payload };
    }
    case 'SET_NOTIFICATION_PERMISSION': {
      return { ...state, notificationPermission: action.payload };
    }

    // Sidebar preferences actions
    case 'UPDATE_SIDEBAR_PREFERENCES': {
      return {
        ...state,
        sidebarPreferences: {
          ...state.sidebarPreferences,
          ...action.payload,
        },
      };
    }

    // Important date actions
    case 'ADD_IMPORTANT_DATE': {
      const newDate: ImportantDate = {
        ...action.payload.date,
        id: generateId(),
      };
      return {
        ...state,
        contexts: state.contexts.map((ctx) =>
          ctx.id === action.payload.contextId
            ? { ...ctx, importantDates: [...(ctx.importantDates || []), newDate], updatedAt: now() }
            : ctx
        ),
      };
    }
    case 'DELETE_IMPORTANT_DATE': {
      return {
        ...state,
        contexts: state.contexts.map((ctx) =>
          ctx.id === action.payload.contextId
            ? {
                ...ctx,
                importantDates: (ctx.importantDates || []).filter(
                  (d) => d.id !== action.payload.dateId
                ),
                updatedAt: now(),
              }
            : ctx
        ),
      };
    }

    // Task hierarchy actions
    case 'TOGGLE_TASK_EXPANDED': {
      const currentExpanded = state.expandedTaskIds || [];
      const taskId = action.payload;
      const isExpanded = currentExpanded.includes(taskId);

      return {
        ...state,
        expandedTaskIds: isExpanded
          ? currentExpanded.filter((id) => id !== taskId)
          : [...currentExpanded, taskId],
      };
    }

    case 'SET_TASKS_EXPANDED': {
      const currentExpanded = new Set(state.expandedTaskIds || []);
      const { taskIds, expanded } = action.payload;

      if (expanded) {
        taskIds.forEach((id) => currentExpanded.add(id));
      } else {
        taskIds.forEach((id) => currentExpanded.delete(id));
      }

      return {
        ...state,
        expandedTaskIds: Array.from(currentExpanded),
      };
    }

    case 'ADD_SUBTASK': {
      const { parentId, title, description, deadline } = action.payload;
      const parentTask = state.tasks.find((t) => t.id === parentId);

      if (!parentTask) return state;

      // Inherit contextId from parent
      const contextId = parentTask.contextId;

      // Find sibling tasks to calculate position at end
      const siblingTasks = getChildren(state.tasks, parentId).filter((t) => !t.completed);
      const position = generateEndPosition(siblingTasks);

      const newTask: Task = {
        id: generateId(),
        title,
        description,
        contextId,
        deadline,
        parentId,
        completed: false,
        position,
        createdAt: now(),
        updatedAt: now(),
      };

      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case 'MOVE_TASK_TO_PARENT': {
      const { taskId, newParentId } = action.payload;
      const taskToMove = state.tasks.find((t) => t.id === taskId);

      if (!taskToMove) return state;

      // Prevent circular reference: can't move a task to its own descendant
      if (newParentId !== null && isDescendantOf(state.tasks, newParentId, taskId)) {
        return state;
      }

      // Can't move task to itself
      if (newParentId === taskId) {
        return state;
      }

      // No change if already has this parent
      if (taskToMove.parentId === newParentId) {
        return state;
      }

      // Determine the new contextId
      let newContextId = taskToMove.contextId;
      if (newParentId !== null) {
        // Moving to a parent - inherit parent's context
        const newParent = state.tasks.find((t) => t.id === newParentId);
        if (newParent) {
          newContextId = newParent.contextId;
        }
      }
      // If moving to root (newParentId === null), keep current context

      // Get descendants to cascade context change if needed
      const descendants = getDescendants(state.tasks, taskId);
      const idsToUpdateContext = new Set(descendants.map((d) => d.id));

      // Calculate position among new siblings
      const newSiblings = state.tasks.filter(
        (t) => t.parentId === newParentId && t.contextId === newContextId && !t.completed && t.id !== taskId
      );
      const newPosition = generateEndPosition(newSiblings);

      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === taskId) {
            // Main task: update parentId, contextId (if changed), and position
            return {
              ...task,
              parentId: newParentId,
              contextId: newContextId,
              position: newPosition,
              updatedAt: now(),
            };
          } else if (idsToUpdateContext.has(task.id) && newContextId !== taskToMove.contextId) {
            // Descendant: only update contextId if it changed
            return { ...task, contextId: newContextId, updatedAt: now() };
          }
          return task;
        }),
      };
    }

    // Sync actions (for realtime updates from other devices)
    case 'SYNC_INSERT_CONTEXT': {
      // Don't insert if already exists
      if (state.contexts.some((c) => c.id === action.payload.id)) {
        return state;
      }
      return { ...state, contexts: [...state.contexts, action.payload] };
    }
    case 'SYNC_UPDATE_CONTEXT': {
      return {
        ...state,
        contexts: state.contexts.map((ctx) =>
          ctx.id === action.payload.id ? action.payload : ctx
        ),
      };
    }
    case 'SYNC_DELETE_CONTEXT': {
      return {
        ...state,
        contexts: state.contexts.filter((ctx) => ctx.id !== action.payload),
        // Move orphaned tasks to inbox
        tasks: state.tasks.map((task) =>
          task.contextId === action.payload ? { ...task, contextId: null } : task
        ),
      };
    }
    case 'SYNC_INSERT_TASK': {
      if (state.tasks.some((t) => t.id === action.payload.id)) {
        return state;
      }
      return { ...state, tasks: [...state.tasks, action.payload] };
    }
    case 'SYNC_UPDATE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    }
    case 'SYNC_DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    }
    case 'SYNC_INSERT_REMINDER': {
      if ((state.reminders || []).some((r) => r.id === action.payload.id)) {
        return state;
      }
      return { ...state, reminders: [...(state.reminders || []), action.payload] };
    }
    case 'SYNC_UPDATE_REMINDER': {
      return {
        ...state,
        reminders: (state.reminders || []).map((reminder) =>
          reminder.id === action.payload.id ? action.payload : reminder
        ),
      };
    }
    case 'SYNC_DELETE_REMINDER': {
      return {
        ...state,
        reminders: (state.reminders || []).filter((r) => r.id !== action.payload),
      };
    }
    case 'SYNC_INSERT_PRESET': {
      if ((state.presets || []).some((p) => p.id === action.payload.id)) {
        return state;
      }
      return { ...state, presets: [...(state.presets || []), action.payload] };
    }
    case 'SYNC_UPDATE_PRESET': {
      return {
        ...state,
        presets: (state.presets || []).map((preset) =>
          preset.id === action.payload.id ? action.payload : preset
        ),
      };
    }
    case 'SYNC_DELETE_PRESET': {
      return {
        ...state,
        presets: (state.presets || []).filter((p) => p.id !== action.payload),
      };
    }
    case 'SYNC_UPDATE_SESSION': {
      // Update session if it matches current session ID
      if (state.session?.id === action.payload.id) {
        return { ...state, session: action.payload };
      }
      return state;
    }
    case 'SYNC_UPDATE_PREFERENCES': {
      return {
        ...state,
        ...action.payload,
      };
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
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'position' | 'parentId'> & { parentId?: string | null }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  moveTaskToContext: (taskId: string, contextId: string | null) => void;
  reorderTask: (taskId: string, newPosition: string) => void;
  // Mode actions
  setMode: (mode: AppMode) => void;
  // Session actions
  startSession: (totalDuration: number, allocations: ContextAllocation[]) => void;
  switchContext: (contextId: string, elapsedMinutes: number) => void;
  updateSessionTime: (contextId: string, usedMinutes: number) => void;
  adjustContextTime: (contextId: string, newRemainingMinutes: number, currentElapsedMinutes: number) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  suspendSession: (elapsedMinutes: number) => void;
  // Preset actions
  addPreset: (preset: Omit<SessionPreset, 'id' | 'createdAt'>) => void;
  deletePreset: (id: string) => void;
  // Selectors
  getContextById: (id: string) => Context | undefined;
  getTasksByContextId: (contextId: string | null) => Task[];
  getInboxTasks: () => Task[];
  getPresets: () => SessionPreset[];
  // Demo data
  loadDemoData: () => void;
  // Reminder actions
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminderEnabled: (id: string) => void;
  updateReminderLastTriggered: (id: string, triggeredAt: string) => void;
  // User location actions
  setUserLocation: (location: UserLocation | null) => void;
  setNotificationPermission: (permission: 'default' | 'granted' | 'denied') => void;
  // Reminder selectors
  getReminders: () => Reminder[];
  getReminderById: (id: string) => Reminder | undefined;
  getEnabledReminders: () => Reminder[];
  // Runtime notification state
  notificationState: NotificationRuntimeState;
  triggerNotification: (notification: Omit<TriggeredNotification, 'id' | 'triggeredAt' | 'status'>) => void;
  acknowledgeNotification: () => void;
  snoozeNotification: (minutes: number) => void;
  dismissNotification: () => void;
  // Sidebar preferences actions
  updateSidebarPreferences: (preferences: Partial<SidebarPreferences>) => void;
  // Important date actions
  addImportantDate: (contextId: string, date: Omit<ImportantDate, 'id'>) => void;
  deleteImportantDate: (contextId: string, dateId: string) => void;
  // Task hierarchy actions
  toggleTaskExpanded: (taskId: string) => void;
  setTasksExpanded: (taskIds: string[], expanded: boolean) => void;
  addSubtask: (parentId: string, title: string, description?: string, deadline?: string) => void;
  moveTaskToParent: (taskId: string, newParentId: string | null) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

// Initial runtime notification state (not persisted)
const INITIAL_NOTIFICATION_STATE: NotificationRuntimeState = {
  activeNotification: null,
  notificationQueue: [],
  isPausedByReminder: false,
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const isInitialMount = useRef(true);
  // Runtime notification state (not persisted to localStorage)
  const [notificationState, setNotificationState] = useState<NotificationRuntimeState>(
    INITIAL_NOTIFICATION_STATE
  );

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
    (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'position' | 'parentId'> & { parentId?: string | null }) => {
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

  const reorderTask = useCallback(
    (taskId: string, newPosition: string) => {
      dispatch({ type: 'REORDER_TASK', payload: { taskId, newPosition } });
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

  const adjustContextTime = useCallback(
    (contextId: string, newRemainingMinutes: number, currentElapsedMinutes: number) => {
      dispatch({
        type: 'ADJUST_CONTEXT_TIME',
        payload: { contextId, newRemainingMinutes, currentElapsedMinutes },
      });
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

  const suspendSession = useCallback((elapsedMinutes: number) => {
    dispatch({ type: 'SUSPEND_SESSION', payload: { elapsedMinutes } });
  }, []);

  // Preset actions
  const addPreset = useCallback(
    (preset: Omit<SessionPreset, 'id' | 'createdAt'>) => {
      dispatch({ type: 'ADD_PRESET', payload: preset });
    },
    []
  );

  const deletePreset = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PRESET', payload: id });
  }, []);

  // Selectors
  const getContextById = useCallback(
    (id: string) => state.contexts.find((ctx) => ctx.id === id),
    [state.contexts]
  );

  const getTasksByContextId = useCallback(
    (contextId: string | null) =>
      state.tasks
        .filter((task) => task.contextId === contextId)
        .sort((a, b) => (a.position || '').localeCompare(b.position || '')),
    [state.tasks]
  );

  const getInboxTasks = useCallback(
    () =>
      state.tasks
        .filter((task) => task.contextId === null)
        .sort((a, b) => (a.position || '').localeCompare(b.position || '')),
    [state.tasks]
  );

  const getPresets = useCallback(() => state.presets || [], [state.presets]);

  // Demo data
  const loadDemoData = useCallback(() => {
    const { contexts, tasks } = getDemoData();
    dispatch({ type: 'LOAD_DEMO_DATA', payload: { contexts, tasks } });
  }, []);

  // Reminder actions
  const addReminder = useCallback(
    (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
      dispatch({ type: 'ADD_REMINDER', payload: reminder });
    },
    []
  );

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    dispatch({ type: 'UPDATE_REMINDER', payload: { id, updates } });
  }, []);

  const deleteReminder = useCallback((id: string) => {
    dispatch({ type: 'DELETE_REMINDER', payload: id });
  }, []);

  const toggleReminderEnabled = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_REMINDER_ENABLED', payload: id });
  }, []);

  const updateReminderLastTriggered = useCallback((id: string, triggeredAt: string) => {
    dispatch({ type: 'UPDATE_REMINDER_LAST_TRIGGERED', payload: { id, triggeredAt } });
  }, []);

  // User location actions
  const setUserLocation = useCallback((location: UserLocation | null) => {
    dispatch({ type: 'SET_USER_LOCATION', payload: location });
  }, []);

  const setNotificationPermission = useCallback(
    (permission: 'default' | 'granted' | 'denied') => {
      dispatch({ type: 'SET_NOTIFICATION_PERMISSION', payload: permission });
    },
    []
  );

  // Reminder selectors
  const getReminders = useCallback(
    () => state.reminders || [],
    [state.reminders]
  );

  const getReminderById = useCallback(
    (id: string) => (state.reminders || []).find((r) => r.id === id),
    [state.reminders]
  );

  const getEnabledReminders = useCallback(
    () => (state.reminders || []).filter((r) => r.enabled),
    [state.reminders]
  );

  // Runtime notification actions (not persisted)
  const triggerNotification = useCallback(
    (notification: Omit<TriggeredNotification, 'id' | 'triggeredAt' | 'status'>) => {
      const fullNotification: TriggeredNotification = {
        ...notification,
        id: generateId(),
        triggeredAt: now(),
        status: 'pending',
      };

      setNotificationState((prev) => {
        // If no active notification, set this one as active
        if (!prev.activeNotification) {
          return {
            activeNotification: fullNotification,
            notificationQueue: prev.notificationQueue,
            isPausedByReminder: true,
          };
        }
        // Otherwise, add to queue
        return {
          ...prev,
          notificationQueue: [...prev.notificationQueue, fullNotification],
        };
      });
    },
    []
  );

  const processNextNotification = useCallback(() => {
    setNotificationState((prev) => {
      if (prev.notificationQueue.length > 0) {
        const [next, ...rest] = prev.notificationQueue;
        return {
          activeNotification: next,
          notificationQueue: rest,
          isPausedByReminder: true,
        };
      }
      return {
        activeNotification: null,
        notificationQueue: [],
        isPausedByReminder: false,
      };
    });
  }, []);

  const acknowledgeNotification = useCallback(() => {
    processNextNotification();
  }, [processNextNotification]);

  const snoozeNotification = useCallback((minutes: number) => {
    setNotificationState((prev) => {
      if (!prev.activeNotification) return prev;

      const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const snoozedNotification: TriggeredNotification = {
        ...prev.activeNotification,
        status: 'snoozed',
        snoozedUntil,
      };

      // Add snoozed notification to end of queue
      const newQueue = [...prev.notificationQueue, snoozedNotification];

      // Process next notification or clear active
      if (prev.notificationQueue.length > 0) {
        const [next, ...rest] = prev.notificationQueue;
        return {
          activeNotification: next,
          notificationQueue: [...rest, snoozedNotification],
          isPausedByReminder: true, // Stay paused during snooze
        };
      }

      return {
        activeNotification: null,
        notificationQueue: [snoozedNotification],
        isPausedByReminder: true, // Stay paused during snooze
      };
    });
  }, []);

  const dismissNotification = useCallback(() => {
    processNextNotification();
  }, [processNextNotification]);

  // Sidebar preferences actions
  const updateSidebarPreferences = useCallback(
    (preferences: Partial<SidebarPreferences>) => {
      dispatch({ type: 'UPDATE_SIDEBAR_PREFERENCES', payload: preferences });
    },
    []
  );

  // Important date actions
  const addImportantDate = useCallback(
    (contextId: string, date: Omit<ImportantDate, 'id'>) => {
      dispatch({ type: 'ADD_IMPORTANT_DATE', payload: { contextId, date } });
    },
    []
  );

  const deleteImportantDate = useCallback(
    (contextId: string, dateId: string) => {
      dispatch({ type: 'DELETE_IMPORTANT_DATE', payload: { contextId, dateId } });
    },
    []
  );

  // Task hierarchy actions
  const toggleTaskExpanded = useCallback((taskId: string) => {
    dispatch({ type: 'TOGGLE_TASK_EXPANDED', payload: taskId });
  }, []);

  const setTasksExpanded = useCallback((taskIds: string[], expanded: boolean) => {
    dispatch({ type: 'SET_TASKS_EXPANDED', payload: { taskIds, expanded } });
  }, []);

  const addSubtask = useCallback(
    (parentId: string, title: string, description?: string, deadline?: string) => {
      dispatch({ type: 'ADD_SUBTASK', payload: { parentId, title, description, deadline } });
    },
    []
  );

  const moveTaskToParent = useCallback(
    (taskId: string, newParentId: string | null) => {
      dispatch({ type: 'MOVE_TASK_TO_PARENT', payload: { taskId, newParentId } });
    },
    []
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
    reorderTask,
    setMode,
    startSession,
    switchContext,
    updateSessionTime,
    adjustContextTime,
    endSession,
    pauseSession,
    resumeSession,
    suspendSession,
    addPreset,
    deletePreset,
    getContextById,
    getTasksByContextId,
    getInboxTasks,
    getPresets,
    loadDemoData,
    // Reminder actions
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminderEnabled,
    updateReminderLastTriggered,
    // User location actions
    setUserLocation,
    setNotificationPermission,
    // Reminder selectors
    getReminders,
    getReminderById,
    getEnabledReminders,
    // Runtime notification state
    notificationState,
    triggerNotification,
    acknowledgeNotification,
    snoozeNotification,
    dismissNotification,
    // Sidebar preferences actions
    updateSidebarPreferences,
    // Important date actions
    addImportantDate,
    deleteImportantDate,
    // Task hierarchy actions
    toggleTaskExpanded,
    setTasksExpanded,
    addSubtask,
    moveTaskToParent,
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
