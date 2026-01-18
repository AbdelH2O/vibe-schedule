'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface TaskFormData {
  title: string;
  contextId: string | null;
  deadline: string;
}

export interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  contextId?: string | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function TaskForm({
  initialData,
  contextId = null,
  onSubmit,
  onCancel,
  submitLabel = 'Create Task',
}: TaskFormProps) {
  const { state } = useStore();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [selectedContextId, setSelectedContextId] = useState<string | null>(
    initialData?.contextId ?? contextId
  );
  const [deadline, setDeadline] = useState(initialData?.deadline ?? '');

  const contexts = state.contexts;

  const isValid = title.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    onSubmit({
      title: title.trim(),
      contextId: selectedContextId,
      deadline: deadline || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-context">Context</Label>
        <Select
          value={selectedContextId ?? 'inbox'}
          onValueChange={(value) =>
            setSelectedContextId(value === 'inbox' ? null : value)
          }
        >
          <SelectTrigger id="task-context">
            <SelectValue placeholder="Select a context" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inbox">Inbox (no context)</SelectItem>
            {contexts.map((ctx) => (
              <SelectItem key={ctx.id} value={ctx.id}>
                {ctx.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-deadline">Deadline (optional)</Label>
        <Input
          id="task-deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!isValid}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
