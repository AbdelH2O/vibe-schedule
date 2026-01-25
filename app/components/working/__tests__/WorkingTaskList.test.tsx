import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { WorkingTaskList } from '../WorkingTaskList';
import { resetMockCounters } from '@/test/utils/mock-data';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('WorkingTaskList', () => {
  beforeEach(() => {
    localStorage.clear();
    resetMockCounters();
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should show empty state when context has no tasks', async () => {
      render(<WorkingTaskList contextId="test-context" />);

      await waitFor(() => {
        expect(screen.getByText('No tasks in this context')).toBeInTheDocument();
      });
    });

    it('should show keyboard hint in empty state', async () => {
      render(<WorkingTaskList contextId="test-context" />);

      await waitFor(() => {
        expect(screen.getByText('n')).toBeInTheDocument(); // The 'n' key hint
      });
    });
  });

  describe('Header', () => {
    it('should render Tasks title', async () => {
      render(<WorkingTaskList contextId="test-context" />);

      await waitFor(() => {
        expect(screen.getByText('Tasks')).toBeInTheDocument();
      });
    });
  });

  describe('With Tasks (via Store)', () => {
    it('should render tasks from the store', async () => {
      // Pre-populate localStorage with state containing tasks
      const mockState = {
        contexts: [{ id: 'ctx-1', name: 'Test', priority: 1, color: 'blue', weight: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' }],
        tasks: [
          { id: 'task-1', title: 'Task One', contextId: 'ctx-1', completed: false, position: 'a0', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
          { id: 'task-2', title: 'Task Two', contextId: 'ctx-1', completed: false, position: 'a1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        ],
        mode: 'working',
        session: null,
        presets: [],
        reminders: [],
        userLocation: null,
        notificationPermission: 'default',
        sidebarPreferences: { deadlineScopeFilter: 'all' },
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      render(<WorkingTaskList contextId="ctx-1" />);

      await waitFor(() => {
        expect(screen.getByText('Task One')).toBeInTheDocument();
        expect(screen.getByText('Task Two')).toBeInTheDocument();
      });
    });

    it('should show completion counter', async () => {
      const mockState = {
        contexts: [{ id: 'ctx-1', name: 'Test', priority: 1, color: 'blue', weight: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' }],
        tasks: [
          { id: 'task-1', title: 'Done', contextId: 'ctx-1', completed: true, position: 'a0', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
          { id: 'task-2', title: 'Not Done', contextId: 'ctx-1', completed: false, position: 'a1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        ],
        mode: 'working',
        session: null,
        presets: [],
        reminders: [],
        userLocation: null,
        notificationPermission: 'default',
        sidebarPreferences: { deadlineScopeFilter: 'all' },
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      render(<WorkingTaskList contextId="ctx-1" />);

      await waitFor(() => {
        expect(screen.getByText('1/2 completed')).toBeInTheDocument();
      });
    });

    it('should toggle task completion on checkbox click', async () => {
      const user = userEvent.setup();
      const mockState = {
        contexts: [{ id: 'ctx-1', name: 'Test', priority: 1, color: 'blue', weight: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' }],
        tasks: [
          { id: 'task-1', title: 'Toggle Me', contextId: 'ctx-1', completed: false, position: 'a0', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        ],
        mode: 'working',
        session: null,
        presets: [],
        reminders: [],
        userLocation: null,
        notificationPermission: 'default',
        sidebarPreferences: { deadlineScopeFilter: 'all' },
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      render(<WorkingTaskList contextId="ctx-1" />);

      await waitFor(() => {
        expect(screen.getByText('Toggle Me')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });
    });

    it('should only show tasks for the specified context', async () => {
      const mockState = {
        contexts: [
          { id: 'ctx-1', name: 'Context One', priority: 1, color: 'blue', weight: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
          { id: 'ctx-2', name: 'Context Two', priority: 2, color: 'red', weight: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        ],
        tasks: [
          { id: 'task-1', title: 'Context One Task', contextId: 'ctx-1', completed: false, position: 'a0', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
          { id: 'task-2', title: 'Context Two Task', contextId: 'ctx-2', completed: false, position: 'a0', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        ],
        mode: 'working',
        session: null,
        presets: [],
        reminders: [],
        userLocation: null,
        notificationPermission: 'default',
        sidebarPreferences: { deadlineScopeFilter: 'all' },
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      render(<WorkingTaskList contextId="ctx-1" />);

      await waitFor(() => {
        expect(screen.getByText('Context One Task')).toBeInTheDocument();
      });

      // Context Two Task should NOT be visible
      expect(screen.queryByText('Context Two Task')).not.toBeInTheDocument();
    });
  });

  describe('Task Deletion', () => {
    it('should delete task when confirmed', async () => {
      const user = userEvent.setup();
      const mockState = {
        contexts: [{ id: 'ctx-1', name: 'Test', priority: 1, color: 'blue', weight: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' }],
        tasks: [
          { id: 'task-1', title: 'Delete Me', contextId: 'ctx-1', completed: false, position: 'a0', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        ],
        mode: 'working',
        session: null,
        presets: [],
        reminders: [],
        userLocation: null,
        notificationPermission: 'default',
        sidebarPreferences: { deadlineScopeFilter: 'all' },
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      render(<WorkingTaskList contextId="ctx-1" />);

      await waitFor(() => {
        expect(screen.getByText('Delete Me')).toBeInTheDocument();
      });

      // Hover to reveal delete button
      const taskContainer = screen.getByText('Delete Me').closest('div');
      if (taskContainer) {
        await user.hover(taskContainer);
      }

      // Click delete - use exact aria-label
      const deleteButton = screen.getByLabelText('Delete task "Delete Me"');
      await user.click(deleteButton);

      // Confirm
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(confirmButton);

      // Task should be removed
      await waitFor(() => {
        expect(screen.queryByText('Delete Me')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mixed Task States', () => {
    it('should handle mix of completed and incomplete tasks', async () => {
      const mockState = {
        contexts: [{ id: 'ctx-1', name: 'Test', priority: 1, color: 'blue', weight: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' }],
        tasks: [
          { id: 'task-1', title: 'Complete', contextId: 'ctx-1', completed: true, position: 'a0', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
          { id: 'task-2', title: 'Incomplete', contextId: 'ctx-1', completed: false, position: 'a1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        ],
        mode: 'working',
        session: null,
        presets: [],
        reminders: [],
        userLocation: null,
        notificationPermission: 'default',
        sidebarPreferences: { deadlineScopeFilter: 'all' },
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      render(<WorkingTaskList contextId="ctx-1" />);

      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument();
        expect(screen.getByText('Incomplete')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();      // Complete
      expect(checkboxes[1]).not.toBeChecked();  // Incomplete
    });
  });
});
