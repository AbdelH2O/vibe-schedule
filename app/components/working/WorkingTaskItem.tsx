'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

interface WorkingTaskItemProps {
  task: Task;
  onToggleCompleted: (taskId: string) => void;
}

// External store for task completion announcements
let taskAnnouncementText = '';
let taskAnnouncementListeners: Array<() => void> = [];

function subscribeToTaskAnnouncement(callback: () => void) {
  taskAnnouncementListeners.push(callback);
  return () => {
    taskAnnouncementListeners = taskAnnouncementListeners.filter((l) => l !== callback);
  };
}

function getTaskAnnouncementSnapshot() {
  return taskAnnouncementText;
}

function triggerTaskAnnouncement(text: string) {
  taskAnnouncementText = text;
  taskAnnouncementListeners.forEach((l) => l());

  // Clear after screen reader has time
  setTimeout(() => {
    taskAnnouncementText = '';
    taskAnnouncementListeners.forEach((l) => l());
  }, 1000);
}

export function WorkingTaskItem({ task, onToggleCompleted }: WorkingTaskItemProps) {
  const announcement = useSyncExternalStore(
    subscribeToTaskAnnouncement,
    getTaskAnnouncementSnapshot,
    () => ''
  );

  const handleToggle = useCallback(() => {
    // Announce the upcoming status change (opposite of current)
    const newStatus = task.completed ? 'marked incomplete' : 'completed';
    triggerTaskAnnouncement(`Task "${task.title}" ${newStatus}`);
    onToggleCompleted(task.id);
  }, [task.id, task.title, task.completed, onToggleCompleted]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-md transition-colors',
        task.completed ? 'bg-muted/30' : 'bg-muted/50 hover:bg-muted'
      )}
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={handleToggle}
        aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
        className="mt-0.5"
      />
      <label
        htmlFor={`task-${task.id}`}
        className={cn(
          'flex-1 text-sm cursor-pointer select-none',
          task.completed && 'line-through text-muted-foreground'
        )}
      >
        {task.title}
      </label>

      {/* Screen reader announcement for task status changes */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}
