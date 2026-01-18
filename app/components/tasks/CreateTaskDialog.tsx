'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskForm, TaskFormData } from './TaskForm';
import { useStore } from '@/lib/store';

export interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contextId?: string | null;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  contextId = null,
}: CreateTaskDialogProps) {
  const { addTask } = useStore();

  const handleSubmit = (data: TaskFormData) => {
    addTask({
      title: data.title,
      contextId: data.contextId,
      deadline: data.deadline || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          contextId={contextId}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Create Task"
        />
      </DialogContent>
    </Dialog>
  );
}
