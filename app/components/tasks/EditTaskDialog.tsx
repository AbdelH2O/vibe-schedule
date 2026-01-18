'use client';

import { Task } from '@/lib/types';
import { useStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskForm, TaskFormData } from './TaskForm';

export interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: EditTaskDialogProps) {
  const { updateTask, moveTaskToContext } = useStore();

  if (!task) return null;

  const handleSubmit = (data: TaskFormData) => {
    // Update title, deadline, and description
    updateTask(task.id, {
      title: data.title,
      deadline: data.deadline || undefined,
      description: data.description || undefined,
    });

    // Move to different context if changed
    if (data.contextId !== task.contextId) {
      moveTaskToContext(task.id, data.contextId);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          initialData={{
            title: task.title,
            contextId: task.contextId,
            deadline: task.deadline ?? '',
            description: task.description ?? '',
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
