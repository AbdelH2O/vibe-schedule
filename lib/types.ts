// Core entity types for Vibe-Schedule

import type { ContextColorName } from './colors';

export interface Context {
  id: string;
  name: string;
  priority: number; // 1-5, where 1 = highest priority, 5 = lowest
  color: ContextColorName; // Color for visual differentiation
  minDuration?: number; // minutes
  maxDuration?: number; // minutes
  weight: number; // relative weight for time distribution (default 1)
  importantDates?: ImportantDate[];
  createdAt: string;
  updatedAt: string;
}

export interface ImportantDate {
  id: string;
  label: string;
  date: string; // ISO date string
}

export interface Task {
  id: string;
  title: string;
  contextId: string | null; // null = inbox
  deadline?: string; // ISO date string, display only
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// App mode - Definition (planning) vs Working (executing)
export type AppMode = 'definition' | 'working';

// Session state for working mode
export interface Session {
  id: string;
  totalDuration: number; // total session time in minutes
  startedAt: string;
  allocations: ContextAllocation[];
  activeContextId: string | null;
  contextStartedAt: string | null; // when current context began
  status: 'active' | 'paused' | 'suspended' | 'completed';
}

export interface ContextAllocation {
  contextId: string;
  allocatedMinutes: number;
  usedMinutes: number;
}

// Complete app state stored in localStorage
export interface AppState {
  contexts: Context[];
  tasks: Task[];
  mode: AppMode;
  session: Session | null;
  presets: SessionPreset[];
}

// Default/initial state
export const INITIAL_STATE: AppState = {
  contexts: [],
  tasks: [],
  mode: 'definition',
  session: null,
  presets: [],
};

// Inbox constant - tasks with contextId: null are in inbox
export const INBOX_ID = null;

// Deadline urgency levels for visual styling
export type DeadlineUrgency = 'overdue' | 'urgent' | 'warning' | 'neutral';

// Countdown display information
export interface CountdownDisplay {
  text: string;
  urgency: DeadlineUrgency;
}

// Time progress status for visualizations
export type TimeProgressStatus = 'normal' | 'warning' | 'urgent' | 'overtime';

// Time progress information for progress bars
export interface TimeProgress {
  percentage: number; // 0-100+, can exceed 100 for overtime
  status: TimeProgressStatus;
  remaining: number; // minutes, negative if overtime
}

// User-saved session presets
export interface SessionPreset {
  id: string;
  name: string;
  totalDuration: number; // minutes
  allocations: ContextAllocation[];
  createdAt: string;
}
