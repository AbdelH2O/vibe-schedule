'use client';

import { useCallback, useSyncExternalStore, useState, useRef, useEffect, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Task } from '@/lib/types';
import type { ContextColorName } from '@/lib/colors';

interface WorkingTaskItemProps {
  task: Task;
  contextColor?: ContextColorName;
  onToggleCompleted: (taskId: string) => void;
  onUpdateDescription?: (description: string) => void;
}

// Rotating placeholder prompts for micro-delight
const PLACEHOLDER_PROMPTS = [
  "What's the first step?",
  "Any context to remember?",
  "Why does this matter?",
  "What does 'done' look like?",
  "Notes for future you...",
];

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

export function WorkingTaskItem({
  task,
  contextColor,
  onToggleCompleted,
  onUpdateDescription,
}: WorkingTaskItemProps) {
  const announcement = useSyncExternalStore(
    subscribeToTaskAnnouncement,
    getTaskAnnouncementSnapshot,
    () => ''
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftDescription, setDraftDescription] = useState(task.description ?? '');
  const [isHovering, setIsHovering] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get a stable placeholder for this task (based on task id hash)
  const placeholder = useMemo(() => {
    const hash = task.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return PLACEHOLDER_PROMPTS[hash % PLACEHOLDER_PROMPTS.length];
  }, [task.id]);

  const hasDescription = task.description && task.description.trim().length > 0;
  const isLongDescription = hasDescription && task.description!.length > 150;

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Place cursor at end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  // Sync draft with task description when not editing
  useEffect(() => {
    if (!isEditing) {
      setDraftDescription(task.description ?? '');
    }
  }, [task.description, isEditing]);

  const handleToggle = useCallback(() => {
    // Announce the upcoming status change (opposite of current)
    const newStatus = task.completed ? 'marked incomplete' : 'completed';
    triggerTaskAnnouncement(`Task "${task.title}" ${newStatus}`);
    onToggleCompleted(task.id);
  }, [task.id, task.title, task.completed, onToggleCompleted]);

  const handleSaveDescription = useCallback(() => {
    onUpdateDescription?.(draftDescription.trim());
    setIsEditing(false);
    if (!draftDescription.trim()) {
      setIsExpanded(false);
    }
  }, [draftDescription, onUpdateDescription]);

  const handleCancelEdit = useCallback(() => {
    setDraftDescription(task.description ?? '');
    setIsEditing(false);
    if (!task.description?.trim()) {
      setIsExpanded(false);
    }
  }, [task.description]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelEdit();
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSaveDescription();
      }
    },
    [handleCancelEdit, handleSaveDescription]
  );

  const handleExpandClick = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true);
      if (!hasDescription) {
        setIsEditing(true);
      }
    } else {
      setIsExpanded(false);
      setIsEditing(false);
    }
  }, [isExpanded, hasDescription]);

  const handleAddDetailsClick = useCallback(() => {
    setIsExpanded(true);
    setIsEditing(true);
  }, []);

  const handleDescriptionClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  return (
    <div
      className={cn(
        'group relative transition-all duration-200',
        'task-card-context'
      )}
      data-completed={task.completed ? 'true' : undefined}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Color indicator dot - uses CSS variable for consistency with page tint */}
      <span
        className="absolute top-3 left-3 size-2.5 rounded-full"
        style={{ backgroundColor: 'var(--context-dot)' }}
        aria-hidden="true"
      />

      {/* Main task row */}
      <div className="flex items-start gap-4 p-4 pl-8">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={handleToggle}
          aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
          className={cn(
            'mt-0.5 h-5 w-5 shrink-0',
            'context-checkbox'
          )}
        />

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                'text-base font-medium cursor-pointer select-none leading-tight text-foreground',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </label>

            {/* Expand/collapse button for tasks with description */}
            {hasDescription && (
              <button
                type="button"
                onClick={handleExpandClick}
                className="shrink-0 p-1 -mr-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              >
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>
            )}
          </div>

          {/* Add details link - shows on hover when no description */}
          {!hasDescription && !isExpanded && (
            <button
              type="button"
              onClick={handleAddDetailsClick}
              className={cn(
                'text-sm text-muted-foreground hover:text-foreground transition-all mt-1',
                isHovering ? 'opacity-100' : 'opacity-0'
              )}
            >
              + Add details...
            </button>
          )}

          {/* Description preview when collapsed (truncated if long) */}
          {hasDescription && !isExpanded && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Expanded description area */}
          {isExpanded && (
            <div className="mt-3 animate-expand-description">
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    ref={textareaRef}
                    value={draftDescription}
                    onChange={(e) => setDraftDescription(e.target.value)}
                    onBlur={handleSaveDescription}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={cn(
                      'w-full min-h-[80px] p-3 text-sm rounded-md resize-none',
                      'bg-background border border-input text-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring/30'
                    )}
                    rows={3}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      <kbd className="px-1 py-0.5 rounded bg-muted font-mono">Esc</kbd> to cancel
                    </span>
                    <span>
                      <kbd className="px-1 py-0.5 rounded bg-muted font-mono">⌘</kbd>+
                      <kbd className="px-1 py-0.5 rounded bg-muted font-mono">Enter</kbd> to save
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDescriptionClick}
                  className={cn(
                    'w-full text-left p-3 rounded-md transition-colors',
                    'bg-muted/50 hover:bg-muted',
                    'text-sm text-foreground'
                  )}
                >
                  {hasDescription ? (
                    <span className={isLongDescription && !isExpanded ? 'line-clamp-3' : ''}>
                      {task.description}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">{placeholder}</span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

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
