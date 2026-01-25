import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import { SortableTaskList } from '../SortableTaskList';
import { createMockTask, createMockTasks, resetMockCounters } from '@/test/utils/mock-data';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('SortableTaskList', () => {
  beforeEach(() => {
    localStorage.clear();
    resetMockCounters();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all tasks', async () => {
      const tasks = [
        createMockTask({ title: 'Task 1', position: 'a0' }),
        createMockTask({ title: 'Task 2', position: 'a1' }),
        createMockTask({ title: 'Task 3', position: 'a2' }),
      ];

      render(<SortableTaskList tasks={tasks} onReorder={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getByText('Task 3')).toBeInTheDocument();
      });
    });

    it('should render correct number of checkboxes', async () => {
      const tasks = createMockTasks(3);

      render(<SortableTaskList tasks={tasks} onReorder={vi.fn()} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(3);
      });
    });

    it('should show empty state when no tasks', async () => {
      render(
        <SortableTaskList
          tasks={[]}
          onReorder={vi.fn()}
          emptyMessage="No tasks available"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No tasks available')).toBeInTheDocument();
      });
    });

    it('should show empty state with description', async () => {
      render(
        <SortableTaskList
          tasks={[]}
          onReorder={vi.fn()}
          emptyMessage="Empty"
          emptyDescription="Add some tasks to get started"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Empty')).toBeInTheDocument();
        expect(screen.getByText('Add some tasks to get started')).toBeInTheDocument();
      });
    });

    it('should render tasks in order by position', async () => {
      // Create tasks with positions in reverse order to test sorting
      const tasks = [
        createMockTask({ title: 'First', position: 'a0' }),
        createMockTask({ title: 'Second', position: 'a1' }),
        createMockTask({ title: 'Third', position: 'a2' }),
      ];

      render(<SortableTaskList tasks={tasks} onReorder={vi.fn()} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(3);
      });

      // Get all task items in DOM order
      const taskTitles = screen.getAllByText(/First|Second|Third/);
      expect(taskTitles[0]).toHaveTextContent('First');
      expect(taskTitles[1]).toHaveTextContent('Second');
      expect(taskTitles[2]).toHaveTextContent('Third');
    });
  });

  describe('Task Display', () => {
    it('should show completed task with checked checkbox', async () => {
      const tasks = [
        createMockTask({ title: 'Completed', completed: true }),
        createMockTask({ title: 'Incomplete', completed: false }),
      ];

      render(<SortableTaskList tasks={tasks} onReorder={vi.fn()} />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(2);

        // First checkbox (completed task) should be checked
        expect(checkboxes[0]).toBeChecked();
        // Second checkbox (incomplete task) should not be checked
        expect(checkboxes[1]).not.toBeChecked();
      });
    });

    it('should show deadline badges for tasks with deadlines', async () => {
      const tasks = [
        createMockTask({ title: 'With Deadline', deadline: '2026-02-01', completed: false }),
      ];

      render(<SortableTaskList tasks={tasks} onReorder={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('With Deadline')).toBeInTheDocument();
      });

      // Deadline should be visible
      expect(screen.getByText(/day|week|month/i)).toBeInTheDocument();
    });

    it('should hide deadline for completed tasks', async () => {
      const tasks = [
        createMockTask({ title: 'Done', deadline: '2026-02-01', completed: true }),
      ];

      render(<SortableTaskList tasks={tasks} onReorder={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Done')).toBeInTheDocument();
      });

      // No deadline text should be visible for completed tasks
      expect(screen.queryByText(/day|week|month|Today|Overdue/i)).not.toBeInTheDocument();
    });
  });

  describe('Drag Handles', () => {
    it('should render drag handles for all tasks', async () => {
      const tasks = createMockTasks(3);

      render(<SortableTaskList tasks={tasks} onReorder={vi.fn()} />);

      await waitFor(() => {
        const dragHandles = screen.getAllByLabelText(/drag to reorder/i);
        expect(dragHandles).toHaveLength(3);
      });
    });
  });

  describe('Callbacks', () => {
    it('should call onEditTask when edit is triggered', async () => {
      const onEditTask = vi.fn();
      const task = createMockTask({ title: 'Editable Task' });

      render(
        <SortableTaskList
          tasks={[task]}
          onReorder={vi.fn()}
          onEditTask={onEditTask}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Editable Task')).toBeInTheDocument();
      });

      // Find and click edit button - use exact aria-label
      const editButton = screen.getByLabelText('Edit "Editable Task"');
      editButton.click();

      expect(onEditTask).toHaveBeenCalledWith(task);
    });

    it('should call onDeleteTask when delete is confirmed', async () => {
      const onDeleteTask = vi.fn();
      const task = createMockTask({ title: 'Deletable Task' });

      render(
        <SortableTaskList
          tasks={[task]}
          onReorder={vi.fn()}
          onDeleteTask={onDeleteTask}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Deletable Task')).toBeInTheDocument();
      });

      // Find and click delete button - use exact aria-label
      const deleteButton = screen.getByLabelText('Delete "Deletable Task"');
      deleteButton.click();

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Confirm delete
      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      confirmButton.click();

      // onDeleteTask should be called with the task ID
      await waitFor(() => {
        expect(onDeleteTask).toHaveBeenCalledWith(task.id);
      });
    });
  });

  describe('Mixed States', () => {
    it('should handle mix of completed and incomplete tasks', async () => {
      const tasks = [
        createMockTask({ title: 'Done 1', completed: true, position: 'a0' }),
        createMockTask({ title: 'Active 1', completed: false, position: 'a1' }),
        createMockTask({ title: 'Done 2', completed: true, position: 'a2' }),
        createMockTask({ title: 'Active 2', completed: false, position: 'a3' }),
      ];

      render(<SortableTaskList tasks={tasks} onReorder={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Done 1')).toBeInTheDocument();
        expect(screen.getByText('Active 1')).toBeInTheDocument();
        expect(screen.getByText('Done 2')).toBeInTheDocument();
        expect(screen.getByText('Active 2')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();      // Done 1
      expect(checkboxes[1]).not.toBeChecked();  // Active 1
      expect(checkboxes[2]).toBeChecked();      // Done 2
      expect(checkboxes[3]).not.toBeChecked();  // Active 2
    });

    it('should handle tasks with and without deadlines', async () => {
      const tasks = [
        createMockTask({ title: 'No Deadline', completed: false }),
        createMockTask({ title: 'Has Deadline', deadline: '2026-02-01', completed: false }),
      ];

      render(<SortableTaskList tasks={tasks} onReorder={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('No Deadline')).toBeInTheDocument();
        expect(screen.getByText('Has Deadline')).toBeInTheDocument();
      });

      // Only one deadline badge should be visible
      const deadlineBadges = screen.getAllByText(/day|week|month/i);
      expect(deadlineBadges).toHaveLength(1);
    });
  });
});
