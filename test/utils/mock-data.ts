import type { Task, Context, AppState } from '@/lib/types';
import { INITIAL_STATE } from '@/lib/types';

let taskCounter = 0;
let contextCounter = 0;

/**
 * Creates a mock Task with sensible defaults.
 * Override any field by passing it in the overrides object.
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
  const id = overrides.id ?? `task-${++taskCounter}`;
  const now = new Date().toISOString();

  return {
    id,
    title: `Test Task ${taskCounter}`,
    description: '',
    contextId: null,
    completed: false,
    position: 'a0',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Creates a mock Context with sensible defaults.
 */
export function createMockContext(overrides: Partial<Context> = {}): Context {
  const id = overrides.id ?? `ctx-${++contextCounter}`;
  const now = new Date().toISOString();

  return {
    id,
    name: `Test Context ${contextCounter}`,
    priority: 3,
    color: 'blue',
    weight: 1,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Creates a mock AppState with optional overrides.
 */
export function createMockState(overrides: Partial<AppState> = {}): AppState {
  return {
    ...INITIAL_STATE,
    ...overrides,
  };
}

/**
 * Creates multiple mock tasks with sequential positions.
 */
export function createMockTasks(count: number, baseOverrides: Partial<Task> = {}): Task[] {
  const positions = ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9'];
  return Array.from({ length: count }, (_, i) =>
    createMockTask({
      position: positions[i] ?? `b${i}`,
      ...baseOverrides,
    })
  );
}

/**
 * Resets the counters between tests.
 */
export function resetMockCounters(): void {
  taskCounter = 0;
  contextCounter = 0;
}
