'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { CountdownBadge } from '../shared/CountdownBadge';
import { cn } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

export interface TaskListItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskListItem({ task, onEdit, onDelete }: TaskListItemProps) {
  const { toggleTaskCompleted, deleteTask, state } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isDefinitionMode = state.mode === 'definition';

  const handleDelete = () => {
    deleteTask(task.id);
    onDelete?.(task.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
    <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/50 group">
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => toggleTaskCompleted(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm truncate block',
            task.completed && 'line-through text-muted-foreground'
          )}
          title={task.title}
        >
          {task.title}
        </span>
        {task.deadline && !task.completed && (
          <div className="mt-0.5">
            <CountdownBadge date={task.deadline} showIcon={true} />
          </div>
        )}
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {onEdit && isDefinitionMode && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
        )}
        {isDefinitionMode && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label={`Delete "${task.title}"`}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete "${task.title}"?`}
        description="This action cannot be undone. The task will be permanently deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}
