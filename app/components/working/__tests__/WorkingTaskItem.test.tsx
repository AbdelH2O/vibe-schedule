import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkingTaskItem } from '../WorkingTaskItem';
import { createMockTask, resetMockCounters } from '@/test/utils/mock-data';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('WorkingTaskItem', () => {
  beforeEach(() => {
    localStorage.clear();
    resetMockCounters();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render task title', () => {
      const task = createMockTask({ title: 'Working Mode Task' });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      expect(screen.getByText('Working Mode Task')).toBeInTheDocument();
    });

    it('should render checkbox', () => {
      const task = createMockTask();
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render unchecked checkbox for incomplete task', () => {
      const task = createMockTask({ completed: false });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('should render checked checkbox for completed task', () => {
      const task = createMockTask({ completed: true });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('should render completed task with line-through styling', () => {
      const task = createMockTask({ title: 'Done Task', completed: true });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      const label = screen.getByText('Done Task');
      expect(label).toHaveClass('line-through');
    });
  });

  describe('Task Completion Toggle', () => {
    it('should call onToggleCompleted when checkbox clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const task = createMockTask({ title: 'Toggle Task' });
      render(<WorkingTaskItem task={task} onToggleCompleted={onToggle} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onToggle).toHaveBeenCalledWith(task.id);
    });

    it('should have correct aria-label for incomplete task', () => {
      const task = createMockTask({ title: 'My Task', completed: false });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute(
        'aria-label',
        expect.stringContaining('complete')
      );
    });

    it('should have correct aria-label for completed task', () => {
      const task = createMockTask({ title: 'My Task', completed: true });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute(
        'aria-label',
        expect.stringContaining('incomplete')
      );
    });
  });

  describe('Drag Handle', () => {
    it('should render drag handle for incomplete task when dragHandleProps provided', () => {
      const task = createMockTask({ completed: false });
      render(
        <WorkingTaskItem
          task={task}
          onToggleCompleted={vi.fn()}
          dragHandleProps={{}}
        />
      );

      expect(screen.getByLabelText(/drag to reorder/i)).toBeInTheDocument();
    });

    it('should NOT render drag handle for completed task even with dragHandleProps', () => {
      const task = createMockTask({ completed: true });
      render(
        <WorkingTaskItem
          task={task}
          onToggleCompleted={vi.fn()}
          dragHandleProps={{}}
        />
      );

      expect(screen.queryByLabelText(/drag to reorder/i)).not.toBeInTheDocument();
    });

    it('should not render drag handle when no dragHandleProps', () => {
      const task = createMockTask({ completed: false });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      expect(screen.queryByLabelText(/drag to reorder/i)).not.toBeInTheDocument();
    });
  });

  describe('Deadline Badge', () => {
    it('should render deadline badge for urgent deadlines without hover', () => {
      // Create task with today's deadline (urgent)
      const today = new Date().toISOString().split('T')[0];
      const task = createMockTask({ deadline: today, completed: false });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      // Urgent deadlines should be visible
      expect(screen.getByText(/Today|hour/i)).toBeInTheDocument();
    });

    it('should not render deadline badge for completed task', () => {
      const today = new Date().toISOString().split('T')[0];
      const task = createMockTask({ deadline: today, completed: true });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      expect(screen.queryByText(/Today|day|week|month/i)).not.toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('should render delete button when onDelete provided', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ title: 'Delete Me' });
      render(
        <WorkingTaskItem
          task={task}
          onToggleCompleted={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      // Hover to reveal delete button
      const container = screen.getByText('Delete Me').closest('div');
      if (container) {
        await user.hover(container);
      }

      // Use exact aria-label match to avoid matching other elements
      expect(screen.getByLabelText('Delete task "Delete Me"')).toBeInTheDocument();
    });

    it('should not render delete button when onDelete not provided', () => {
      const task = createMockTask({ title: 'No Delete' });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      // Check that no delete button with expected pattern exists
      expect(screen.queryByLabelText(/^Delete task/)).not.toBeInTheDocument();
    });

    it('should open confirmation dialog when delete clicked', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ title: 'Task to Delete' });
      render(
        <WorkingTaskItem
          task={task}
          onToggleCompleted={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      // Hover and click delete
      const container = screen.getByText('Task to Delete').closest('div');
      if (container) {
        await user.hover(container);
      }

      const deleteButton = screen.getByLabelText('Delete task "Task to Delete"');
      await user.click(deleteButton);

      // Dialog should appear
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });

    it('should call onDelete when confirmed', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const task = createMockTask({ title: 'Confirm Delete' });
      render(
        <WorkingTaskItem
          task={task}
          onToggleCompleted={vi.fn()}
          onDelete={onDelete}
        />
      );

      // Open dialog
      const container = screen.getByText('Confirm Delete').closest('div');
      if (container) {
        await user.hover(container);
      }

      const deleteButton = screen.getByLabelText('Delete task "Confirm Delete"');
      await user.click(deleteButton);

      // Confirm delete
      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(confirmButton);

      expect(onDelete).toHaveBeenCalledWith(task.id);
    });

    it('should close dialog when cancel clicked', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ title: 'Cancel Delete' });
      render(
        <WorkingTaskItem
          task={task}
          onToggleCompleted={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      // Open dialog
      const container = screen.getByText('Cancel Delete').closest('div');
      if (container) {
        await user.hover(container);
      }

      const deleteButton = screen.getByLabelText('Delete task "Cancel Delete"');
      await user.click(deleteButton);

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Description', () => {
    it('should show description when task has one', () => {
      const task = createMockTask({
        title: 'Task',
        description: 'This is the task description',
      });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      expect(screen.getByText('This is the task description')).toBeInTheDocument();
    });

    it('should show add details prompt on hover when no description', async () => {
      const user = userEvent.setup();
      const task = createMockTask({ title: 'No Desc', description: '' });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      // Hover over the task
      const container = screen.getByText('No Desc').closest('div');
      if (container) {
        await user.hover(container);
      }

      expect(screen.getByText(/add details/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have screen reader announcement region', () => {
      const task = createMockTask();
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      // Check for aria-live region
      const srOnly = document.querySelector('[role="status"][aria-live="polite"]');
      expect(srOnly).toBeInTheDocument();
    });

    it('should have linked label and checkbox', () => {
      const task = createMockTask({ title: 'Accessible Task' });
      render(<WorkingTaskItem task={task} onToggleCompleted={vi.fn()} />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Accessible Task');

      // The label's for attribute should match the checkbox id
      expect(label).toHaveAttribute('for', `task-${task.id}`);
      expect(checkbox).toHaveAttribute('id', `task-${task.id}`);
    });
  });
});
