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
  parentId?: string | null;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  contextId = null,
  parentId = null,
}: CreateTaskDialogProps) {
  const { addTask, addSubtask } = useStore();
  const isSubtask = parentId !== null;

  const handleSubmit = (data: TaskFormData) => {
    if (isSubtask && parentId) {
      // Create as subtask - contextId is inherited from parent
      addSubtask(parentId, data.title, undefined, data.deadline || undefined);
    } else {
      // Create as root-level task
      addTask({
        title: data.title,
        contextId: data.contextId,
        deadline: data.deadline || undefined,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSubtask ? 'Create Subtask' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <TaskForm
          contextId={contextId}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={isSubtask ? 'Create Subtask' : 'Create Task'}
          hideContextSelector={isSubtask}
        />
      </DialogContent>
    </Dialog>
  );
}
