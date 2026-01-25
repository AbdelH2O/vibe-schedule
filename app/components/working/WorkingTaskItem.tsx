'use client';

import { useCallback, useSyncExternalStore, useState, useRef, useEffect, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import type { ContextColorName } from '@/lib/colors';
import { CountdownBadge } from '@/app/components/shared/CountdownBadge';
import { getDeadlineUrgency } from '@/lib/dates';
import { ExpandCollapseButton } from '@/app/components/tasks/ExpandCollapseButton';
import { TaskProgressBadge } from '@/app/components/tasks/TaskProgressBadge';

interface WorkingTaskItemProps {
  task: Task;
  contextColor?: ContextColorName;
  onToggleCompleted: (taskId: string) => void;
  onUpdateDescription?: (description: string) => void;
  onDelete?: (taskId: string) => void;
  onAddSubtask?: (parentId: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  // Hierarchy props
  depth?: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
  childStats?: { completed: number; total: number };
  onToggleExpand?: () => void;
  onFocus?: (taskId: string) => void;
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
  onDelete,
  onAddSubtask,
  dragHandleProps,
  depth = 0,
  isExpanded = false,
  hasChildren = false,
  childStats,
  onToggleExpand,
  onFocus,
}: WorkingTaskItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const announcement = useSyncExternalStore(
    subscribeToTaskAnnouncement,
    getTaskAnnouncementSnapshot,
    () => ''
  );

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
  }, [draftDescription, onUpdateDescription]);

  const handleCancelEdit = useCallback(() => {
    setDraftDescription(task.description ?? '');
    setIsEditing(false);
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

  const handleAddDetailsClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleDescriptionClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Indentation based on depth (16px per level)
  const indentStyle = depth > 0 ? { paddingLeft: `${depth * 16}px` } : undefined;

  return (
    <div
      className={cn(
        'group relative transition-all duration-200 rounded-md border',
        'bg-white'
      )}
      style={indentStyle}
      data-completed={task.completed ? 'true' : undefined}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Color indicator dot - uses CSS variable for consistency with page tint */}
      {/* <span
        className="absolute top-1/2 left-3 size-2.5 rounded-full"
        style={{ backgroundColor: 'var(--context-dot)' }}
        aria-hidden="true"
      /> */}

      {/* Main task row */}
      <div className="flex items-start gap-2 p-3">
        {/* Expand/collapse button - show only when task has children */}
        {hasChildren && onToggleExpand ? (
          <ExpandCollapseButton
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            className="mt-0.5"
            aria-label={isExpanded ? `Collapse "${task.title}"` : `Expand "${task.title}"`}
          />
        ) : (
          // Spacer to align tasks without children
          <div className="w-5 shrink-0" />
        )}
        {/* Drag handle */}
        {dragHandleProps && !task.completed && (
          <button
            type="button"
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-0.5 mt-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-5" aria-hidden="true" />
          </button>
        )}
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
            <div className="flex-1 min-w-0">
              {onFocus ? (
                <button
                  type="button"
                  onClick={() => onFocus(task.id)}
                  className={cn(
                    'text-sm font-medium text-left hover:underline focus:underline focus:outline-none leading-tight text-foreground',
                    task.completed && 'line-through text-muted-foreground'
                  )}
                  title={`Focus on "${task.title}"`}
                >
                  {task.title}
                </button>
              ) : (
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    'text-sm font-medium cursor-pointer select-none leading-tight text-foreground',
                    task.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {task.title}
                </label>
              )}
              {/* Progress and deadline badges */}
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {/* Child progress badge */}
                {hasChildren && childStats && (
                  <TaskProgressBadge
                    completed={childStats.completed}
                    total={childStats.total}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* Deadline badge - always visible for urgent/warning/overdue, hover for neutral */}
              {task.deadline && !task.completed && (() => {
                const urgency = getDeadlineUrgency(task.deadline);
                const shouldShow = urgency !== 'neutral' || isHovering;
                return shouldShow ? (
                  <CountdownBadge
                    date={task.deadline}
                    showIcon={true}
                    className={cn(
                      'transition-opacity',
                      urgency === 'neutral' && 'opacity-70'
                    )}
                  />
                ) : null;
              })()}
              {/* Add subtask button */}
              {onAddSubtask && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'size-7 text-muted-foreground hover:text-foreground transition-opacity',
                    isHovering ? 'opacity-100' : 'opacity-0'
                  )}
                  onClick={() => onAddSubtask(task.id)}
                  aria-label={`Add subtask to "${task.title}"`}
                  title="Add subtask"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                </Button>
              )}
              {/* Delete button - inline on right side */}
              {onDelete && (
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'size-7 text-muted-foreground hover:text-destructive transition-opacity',
                        isHovering ? 'opacity-100' : 'opacity-0'
                      )}
                      aria-label={`Delete task "${task.title}"`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(task.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Add details link - shows on hover when no description */}
          {!hasDescription && !isEditing && (
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

          {/* Description preview - click to edit */}
          {hasDescription && !isEditing && (
            <button
              type="button"
              onClick={onUpdateDescription ? handleDescriptionClick : undefined}
              className={cn(
                'text-sm text-muted-foreground mt-1 line-clamp-2 text-left',
                onUpdateDescription && 'cursor-pointer hover:text-foreground transition-colors'
              )}
            >
              {task.description}
            </button>
          )}

          {/* Edit description area */}
          {isEditing && (
            <div className="mt-3 animate-expand-description">
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
