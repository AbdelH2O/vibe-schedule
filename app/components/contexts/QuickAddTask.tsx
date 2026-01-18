'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useStore } from '@/lib/store';

interface QuickAddTaskProps {
  contextId: string;
}

export function QuickAddTask({ contextId }: QuickAddTaskProps) {
  const { addTask } = useStore();
  const [title, setTitle] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    addTask({
      title: trimmed,
      contextId,
    });
    setTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTitle('');
      inputRef.current?.blur();
    }
  };

  // Focus input when pressing 'n' globally (when not already focused)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-b">
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
