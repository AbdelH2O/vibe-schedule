'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useStore } from '@/lib/store';

interface WorkingQuickAddProps {
  contextId: string;
}

export interface WorkingQuickAddRef {
  focus: () => void;
}

export const WorkingQuickAdd = forwardRef<WorkingQuickAddRef, WorkingQuickAddProps>(
  function WorkingQuickAdd({ contextId }, ref) {
    const { addTask } = useStore();
    const [title, setTitle] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = title.trim();
      if (!trimmed) return;

      addTask({
        title: trimmed,
        contextId,
      });
      setTitle('');
      // Keep focus for rapid task entry
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Stop propagation to prevent triggering end session dialog
        e.stopPropagation();
        setTitle('');
        inputRef.current?.blur();
      }
    };

    return (
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative">
          <Plus
            className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 transition-colors ${
              isFocused ? 'text-foreground' : 'text-muted-foreground'
            }`}
            aria-hidden="true"
          />
          <Input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Add task... (press 'n')"
            className="pl-9"
            aria-label="Add new task"
          />
        </div>
      </form>
    );
  }
);
