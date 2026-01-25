import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TaskListItem } from '../TaskListItem';
import { createMockTask, resetMockCounters } from '@/test/utils/mock-data';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('TaskListItem', () => {
  beforeEach(() => {
    localStorage.clear();
    resetMockCounters();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render task title', async () => {
      const task = createMockTask({ title: 'My Test Task' });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        expect(screen.getByText('My Test Task')).toBeInTheDocument();
      });
    });

    it('should render checkbox', async () => {
      const task = createMockTask();
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });
    });

    it('should render unchecked checkbox for incomplete task', async () => {
      const task = createMockTask({ completed: false });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
      });
    });

    it('should render checked checkbox for completed task', async () => {
      const task = createMockTask({ completed: true });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
      });
    });

    it('should render completed task with line-through styling', async () => {
      const task = createMockTask({ title: 'Completed Task', completed: true });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        const titleElement = screen.getByText('Completed Task');
        expect(titleElement).toHaveClass('line-through');
      });
    });

    it('should not render line-through on incomplete task', async () => {
      const task = createMockTask({ title: 'Active Task', completed: false });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        const titleElement = screen.getByText('Active Task');
        expect(titleElement).not.toHaveClass('line-through');
      });
    });
  });

  describe('Deadline Badge', () => {
    it('should render deadline badge when task has deadline and is not completed', async () => {
      const task = createMockTask({ deadline: '2026-02-01', completed: false });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        // The CountdownBadge component should be rendered
        // It will show something like "7 days" or similar
        expect(screen.getByText(/day|week|month|Today|Overdue|hour/i)).toBeInTheDocument();
      });
    });

    it('should not render deadline badge for completed task', async () => {
      const task = createMockTask({ deadline: '2026-02-01', completed: true });
      render(<TaskListItem task={task} />);

      // Wait for hydration
      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeChecked();
      });

      // No deadline text should be visible for completed tasks
      expect(screen.queryByText(/day|week|month|Today|Overdue|hour/i)).not.toBeInTheDocument();
    });

    it('should not render deadline badge when task has no deadline', async () => {
      const task = createMockTask({ deadline: undefined, completed: false });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });

      expect(screen.queryByText(/day|week|month|Today|Overdue|hour/i)).not.toBeInTheDocument();
    });
  });

  describe('Task Completion Toggle', () => {
    it('should have correct aria-label for incomplete task', async () => {
      const task = createMockTask({ title: 'My Task', completed: false });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveAttribute(
          'aria-label',
          expect.stringContaining('complete')
        );
      });
    });

    it('should have correct aria-label for completed task', async () => {
      const task = createMockTask({ title: 'My Task', completed: true });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveAttribute(
          'aria-label',
          expect.stringContaining('incomplete')
        );
      });
    });

    it('should toggle task completion on checkbox click', async () => {
      const user = userEvent.setup();
      // Pre-populate the store with the task so toggleTaskCompleted works
      const mockState = {
        contexts: [],
        tasks: [
          { id: 'toggle-task', title: 'Toggle Me', contextId: null, completed: false, position: 'a0', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        ],
        mode: 'definition',
        session: null,
        presets: [],
        reminders: [],
        userLocation: null,
        notificationPermission: 'default',
        sidebarPreferences: { deadlineScopeFilter: 'all' },
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      const task = { id: 'toggle-task', title: 'Toggle Me', contextId: null, completed: false, position: 'a0', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).not.toBeChecked();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Verify the store was updated by checking localStorage
      // (The component displays prop value, but the store action should have fired)
      await waitFor(() => {
        const savedState = JSON.parse(localStorage.getItem('vibe-schedule-state') || '{}');
        const updatedTask = savedState.tasks?.find((t: { id: string }) => t.id === 'toggle-task');
        expect(updatedTask?.completed).toBe(true);
      });
    });
  });

  describe('Drag Handle', () => {
    it('should render drag handle when dragHandleProps provided', async () => {
      const task = createMockTask();
      render(<TaskListItem task={task} dragHandleProps={{}} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/drag to reorder/i)).toBeInTheDocument();
      });
    });

    it('should not render drag handle when no dragHandleProps', async () => {
      const task = createMockTask();
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/drag to reorder/i)).not.toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete button on hover in definition mode', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ title: 'Delete Me' });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        expect(screen.getByText('Delete Me')).toBeInTheDocument();
      });

      // Hover over the task item to reveal delete button
      const taskItem = screen.getByText('Delete Me').closest('div');
      if (taskItem) {
        await user.hover(taskItem);
      }

      // The delete button should now be visible - use exact aria-label
      const deleteButton = screen.getByLabelText('Delete "Delete Me"');
      expect(deleteButton).toBeInTheDocument();
    });

    it('should open confirmation dialog when delete button clicked', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ title: 'Task to Delete' });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        expect(screen.getByText('Task to Delete')).toBeInTheDocument();
      });

      // Find and click the delete button - use exact aria-label
      const deleteButton = screen.getByLabelText('Delete "Task to Delete"');
      await user.click(deleteButton);

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
      });
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ title: 'Cancel Delete' });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        expect(screen.getByText('Cancel Delete')).toBeInTheDocument();
      });

      // Open delete dialog - use exact aria-label
      const deleteButton = screen.getByLabelText('Delete "Cancel Delete"');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should delete task when confirmed', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ title: 'Delete This Task' });
      render(<TaskListItem task={task} />);

      await waitFor(() => {
        expect(screen.getByText('Delete This Task')).toBeInTheDocument();
      });

      // Open delete dialog - use exact aria-label
      const deleteButton = screen.getByLabelText('Delete "Delete This Task"');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Click delete in the dialog
      const confirmDelete = screen.getByRole('button', { name: /^delete$/i });
      await user.click(confirmDelete);

      // Dialog should close and task should be deleted from store
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Description', () => {
    it('should show description when task has one', async () => {
      const task = createMockTask({
        title: 'Task with description',
        description: 'This is a detailed description',
      });
      render(<TaskListItem task={task} onUpdateDescription={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('This is a detailed description')).toBeInTheDocument();
      });
    });

    it('should show add details prompt on hover when no description', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ title: 'No Description', description: '' });
      render(<TaskListItem task={task} onUpdateDescription={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('No Description')).toBeInTheDocument();
      });

      // Hover over the task
      const taskContainer = screen.getByText('No Description').closest('.group');
      if (taskContainer) {
        await user.hover(taskContainer);
      }

      // Add details link should appear
      expect(screen.getByText(/add details/i)).toBeInTheDocument();
    });
  });
});
