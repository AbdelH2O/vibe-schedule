'use client';

import { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { Inbox, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickCaptureBarProps {
  onNavigateToInbox: () => void;
}

export function QuickCaptureBar({ onNavigateToInbox }: QuickCaptureBarProps) {
  const { addTask, getInboxTasks } = useStore();
  const [value, setValue] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const inboxTasks = getInboxTasks();
  const inboxCount = inboxTasks.filter(t => !t.completed).length;
  const isHighCount = inboxCount > 5;

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    addTask({
      title: trimmed,
      contextId: null, // inbox
    });

    setValue('');
    setAnnouncement(`Task "${trimmed}" added to inbox`);

    // Clear announcement after screen reader has time to read it
    setTimeout(() => setAnnouncement(''), 1000);
  }, [value, addTask]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <div className="flex items-center gap-2">
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
        <div className="relative flex-1">
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Add to inbox..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
            aria-label="Quick add task to inbox"
          />
        </div>
      </form>

      <Button
        variant="outline"
        size="sm"
        onClick={onNavigateToInbox}
        className={cn(
          "gap-2 shrink-0",
          isHighCount && "border-amber-500 text-amber-600 dark:text-amber-500"
        )}
        aria-label={`Inbox with ${inboxCount} tasks`}
      >
        <Inbox className="size-4" aria-hidden="true" />
        <span className={cn(
          "font-medium",
          isHighCount && "text-amber-600 dark:text-amber-500"
        )}>
          {inboxCount}
        </span>
      </Button>

      {/* Live region for screen reader announcements */}
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
