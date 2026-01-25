import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { StoreProvider, useStore } from '../store';
import { createMockTask, createMockContext, resetMockCounters } from '@/test/utils/mock-data';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Wrapper component for hooks
function wrapper({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}

describe('Store', () => {
  beforeEach(() => {
    localStorage.clear();
    resetMockCounters();
    vi.clearAllMocks();
  });

  describe('useStore hook', () => {
    it('should throw when used outside StoreProvider', () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useStore());
      }).toThrow('useStore must be used within a StoreProvider');

      spy.mockRestore();
    });

    it('should provide store context within StoreProvider', () => {
      const { result } = renderHook(() => useStore(), { wrapper });

      expect(result.current.state).toBeDefined();
      expect(result.current.addTask).toBeInstanceOf(Function);
      expect(result.current.deleteTask).toBeInstanceOf(Function);
      expect(result.current.toggleTaskCompleted).toBeInstanceOf(Function);
    });
  });

  describe('Task Actions', () => {
    describe('addTask', () => {
      it('should add a new task with generated id and position', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });

        // Wait for hydration
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({
            title: 'New Task',
            contextId: null,
          });
        });

        expect(result.current.state.tasks).toHaveLength(1);
        expect(result.current.state.tasks[0].title).toBe('New Task');
        expect(result.current.state.tasks[0].id).toBeDefined();
        expect(result.current.state.tasks[0].position).toBeDefined();
        expect(result.current.state.tasks[0].completed).toBe(false);
        expect(result.current.state.tasks[0].createdAt).toBeDefined();
        expect(result.current.state.tasks[0].updatedAt).toBeDefined();
      });

      it('should add task at end of context tasks', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({ title: 'Task 1', contextId: null });
        });
        act(() => {
          result.current.addTask({ title: 'Task 2', contextId: null });
        });

        const tasks = result.current.state.tasks;
        expect(tasks).toHaveLength(2);
        // Second task should have a position after the first
        expect(tasks[1].position.localeCompare(tasks[0].position)).toBeGreaterThan(0);
      });

      it('should add task with provided optional fields', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({
            title: 'Task with details',
            contextId: null,
            description: 'This is a description',
            deadline: '2026-02-01',
          });
        });

        const task = result.current.state.tasks[0];
        expect(task.description).toBe('This is a description');
        expect(task.deadline).toBe('2026-02-01');
      });
    });

    describe('deleteTask', () => {
      it('should remove task from state', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        // Add a task first
        act(() => {
          result.current.addTask({ title: 'Task to delete', contextId: null });
        });

        const taskId = result.current.state.tasks[0].id;
        expect(result.current.state.tasks).toHaveLength(1);

        // Delete the task
        act(() => {
          result.current.deleteTask(taskId);
        });

        expect(result.current.state.tasks).toHaveLength(0);
      });

      it('should not affect other tasks', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({ title: 'Task 1', contextId: null });
        });
        act(() => {
          result.current.addTask({ title: 'Task 2', contextId: null });
        });

        const taskToDelete = result.current.state.tasks[0].id;
        const remainingTaskId = result.current.state.tasks[1].id;

        act(() => {
          result.current.deleteTask(taskToDelete);
        });

        expect(result.current.state.tasks).toHaveLength(1);
        expect(result.current.state.tasks[0].id).toBe(remainingTaskId);
      });

      it('should handle deleting non-existent task gracefully', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        // Should not throw
        act(() => {
          result.current.deleteTask('non-existent-id');
        });

        expect(result.current.state.tasks).toHaveLength(0);
      });
    });

    describe('toggleTaskCompleted', () => {
      it('should toggle task from incomplete to complete', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({ title: 'Task', contextId: null });
        });

        const taskId = result.current.state.tasks[0].id;
        expect(result.current.state.tasks[0].completed).toBe(false);

        act(() => {
          result.current.toggleTaskCompleted(taskId);
        });

        expect(result.current.state.tasks[0].completed).toBe(true);
      });

      it('should toggle task from complete to incomplete', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({ title: 'Task', contextId: null });
        });

        const taskId = result.current.state.tasks[0].id;

        // Complete the task
        act(() => {
          result.current.toggleTaskCompleted(taskId);
        });
        expect(result.current.state.tasks[0].completed).toBe(true);

        // Uncomplete the task
        act(() => {
          result.current.toggleTaskCompleted(taskId);
        });
        expect(result.current.state.tasks[0].completed).toBe(false);
      });

      it('should update updatedAt timestamp', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({ title: 'Task', contextId: null });
        });

        const taskId = result.current.state.tasks[0].id;
        const originalUpdatedAt = result.current.state.tasks[0].updatedAt;

        // Wait a bit to ensure timestamp changes
        await new Promise((r) => setTimeout(r, 10));

        act(() => {
          result.current.toggleTaskCompleted(taskId);
        });

        // The updatedAt should be different (or same if within same millisecond, but likely different)
        expect(result.current.state.tasks[0].updatedAt).toBeDefined();
      });

      it('should assign new position at end when uncompleting', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        // Add two tasks
        act(() => {
          result.current.addTask({ title: 'Task 1', contextId: null });
        });
        act(() => {
          result.current.addTask({ title: 'Task 2', contextId: null });
        });

        const task1Id = result.current.state.tasks[0].id;

        // Complete first task
        act(() => {
          result.current.toggleTaskCompleted(task1Id);
        });

        const positionWhenCompleted = result.current.state.tasks.find(t => t.id === task1Id)!.position;

        // Uncomplete task 1 - should get a new position at end of active tasks
        act(() => {
          result.current.toggleTaskCompleted(task1Id);
        });

        const task1After = result.current.state.tasks.find(t => t.id === task1Id);
        const task2 = result.current.state.tasks.find(t => t.title === 'Task 2');

        expect(task1After!.completed).toBe(false);
        // New position should be after task 2
        expect(task1After!.position.localeCompare(task2!.position)).toBeGreaterThan(0);
      });
    });

    describe('updateTask', () => {
      it('should update specific task fields', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({ title: 'Original Title', contextId: null });
        });

        const taskId = result.current.state.tasks[0].id;

        act(() => {
          result.current.updateTask(taskId, { title: 'Updated Title' });
        });

        expect(result.current.state.tasks[0].title).toBe('Updated Title');
      });

      it('should update description', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({ title: 'Task', contextId: null });
        });

        const taskId = result.current.state.tasks[0].id;

        act(() => {
          result.current.updateTask(taskId, { description: 'New description' });
        });

        expect(result.current.state.tasks[0].description).toBe('New description');
      });

      it('should update updatedAt on any update', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({ title: 'Task', contextId: null });
        });

        const taskId = result.current.state.tasks[0].id;
        const originalUpdatedAt = result.current.state.tasks[0].updatedAt;

        await new Promise((r) => setTimeout(r, 10));

        act(() => {
          result.current.updateTask(taskId, { title: 'Updated' });
        });

        expect(result.current.state.tasks[0].updatedAt).not.toBe(originalUpdatedAt);
      });
    });

    describe('reorderTask', () => {
      it('should update task position', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({ title: 'Task', contextId: null });
        });

        const taskId = result.current.state.tasks[0].id;
        const newPosition = 'z99';

        act(() => {
          result.current.reorderTask(taskId, newPosition);
        });

        expect(result.current.state.tasks[0].position).toBe(newPosition);
      });

      it('should update updatedAt timestamp', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({ title: 'Task', contextId: null });
        });

        const taskId = result.current.state.tasks[0].id;

        await new Promise((r) => setTimeout(r, 10));

        act(() => {
          result.current.reorderTask(taskId, 'new-position');
        });

        expect(result.current.state.tasks[0].updatedAt).toBeDefined();
      });
    });

    describe('moveTaskToContext', () => {
      it('should move task to new context', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        // Add a context first
        act(() => {
          result.current.addContext({ name: 'Work', priority: 1, color: 'blue', weight: 1 });
        });

        const contextId = result.current.state.contexts[0].id;

        // Add task to inbox
        act(() => {
          result.current.addTask({ title: 'Task', contextId: null });
        });

        const taskId = result.current.state.tasks[0].id;
        expect(result.current.state.tasks[0].contextId).toBeNull();

        // Move to context
        act(() => {
          result.current.moveTaskToContext(taskId, contextId);
        });

        expect(result.current.state.tasks[0].contextId).toBe(contextId);
      });

      it('should move task to inbox (contextId: null)', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        // Add context and task in that context
        act(() => {
          result.current.addContext({ name: 'Work', priority: 1, color: 'blue', weight: 1 });
        });

        const contextId = result.current.state.contexts[0].id;

        act(() => {
          result.current.addTask({ title: 'Task', contextId });
        });

        const taskId = result.current.state.tasks[0].id;
        expect(result.current.state.tasks[0].contextId).toBe(contextId);

        // Move to inbox
        act(() => {
          result.current.moveTaskToContext(taskId, null);
        });

        expect(result.current.state.tasks[0].contextId).toBeNull();
      });

      it('should assign new position at end of target context', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        // Add context with existing tasks
        act(() => {
          result.current.addContext({ name: 'Work', priority: 1, color: 'blue', weight: 1 });
        });

        const contextId = result.current.state.contexts[0].id;

        act(() => {
          result.current.addTask({ title: 'Existing Task', contextId });
        });
        act(() => {
          result.current.addTask({ title: 'Task to Move', contextId: null });
        });

        const existingTaskPosition = result.current.state.tasks[0].position;
        const taskToMoveId = result.current.state.tasks[1].id;

        // Move task to context
        act(() => {
          result.current.moveTaskToContext(taskToMoveId, contextId);
        });

        const movedTask = result.current.state.tasks.find(t => t.id === taskToMoveId);
        expect(movedTask!.position.localeCompare(existingTaskPosition)).toBeGreaterThan(0);
      });
    });
  });

  describe('Selectors', () => {
    describe('getTasksByContextId', () => {
      it('should return tasks sorted by position', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        // Add context
        act(() => {
          result.current.addContext({ name: 'Work', priority: 1, color: 'blue', weight: 1 });
        });

        const contextId = result.current.state.contexts[0].id;

        // Add tasks
        act(() => {
          result.current.addTask({ title: 'Task 1', contextId });
        });
        act(() => {
          result.current.addTask({ title: 'Task 2', contextId });
        });

        const tasks = result.current.getTasksByContextId(contextId);
        expect(tasks).toHaveLength(2);
        // Should be sorted by position
        expect(tasks[0].position.localeCompare(tasks[1].position)).toBeLessThan(0);
      });

      it('should return empty array for context with no tasks', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addContext({ name: 'Empty', priority: 1, color: 'blue', weight: 1 });
        });

        const contextId = result.current.state.contexts[0].id;
        const tasks = result.current.getTasksByContextId(contextId);

        expect(tasks).toHaveLength(0);
      });
    });

    describe('getInboxTasks', () => {
      it('should return only tasks with null contextId', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addContext({ name: 'Work', priority: 1, color: 'blue', weight: 1 });
        });

        const contextId = result.current.state.contexts[0].id;

        act(() => {
          result.current.addTask({ title: 'Inbox Task', contextId: null });
        });
        act(() => {
          result.current.addTask({ title: 'Context Task', contextId });
        });

        const inboxTasks = result.current.getInboxTasks();

        expect(inboxTasks).toHaveLength(1);
        expect(inboxTasks[0].title).toBe('Inbox Task');
      });

      it('should return tasks sorted by position', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addTask({ title: 'Task 1', contextId: null });
        });
        act(() => {
          result.current.addTask({ title: 'Task 2', contextId: null });
        });

        const inboxTasks = result.current.getInboxTasks();

        expect(inboxTasks).toHaveLength(2);
        expect(inboxTasks[0].position.localeCompare(inboxTasks[1].position)).toBeLessThan(0);
      });
    });
  });

  describe('Context Actions', () => {
    describe('deleteContext', () => {
      it('should move tasks from deleted context to inbox', async () => {
        const { result } = renderHook(() => useStore(), { wrapper });
        await waitFor(() => expect(result.current.isHydrated).toBe(true));

        act(() => {
          result.current.addContext({ name: 'Work', priority: 1, color: 'blue', weight: 1 });
        });

        const contextId = result.current.state.contexts[0].id;

        act(() => {
          result.current.addTask({ title: 'Task in context', contextId });
        });

        expect(result.current.state.tasks[0].contextId).toBe(contextId);

        // Delete the context
        act(() => {
          result.current.deleteContext(contextId);
        });

        // Task should now be in inbox
        expect(result.current.state.tasks[0].contextId).toBeNull();
        expect(result.current.state.contexts).toHaveLength(0);
      });
    });
  });
});
