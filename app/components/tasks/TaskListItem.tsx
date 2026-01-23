'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Task } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { CountdownBadge } from '../shared/CountdownBadge';
import { cn } from '@/lib/utils';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

// Rotating placeholder prompts for micro-delight
const PLACEHOLDER_PROMPTS = [
  "What's the first step?",
  "Any context to remember?",
  "Why does this matter?",
  "What does 'done' look like?",
  "Notes for future you...",
];

export interface TaskListItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onUpdateDescription?: (taskId: string, description: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function TaskListItem({ task, onEdit, onDelete, onUpdateDescription, dragHandleProps }: TaskListItemProps) {
  const { toggleTaskCompleted, deleteTask, state } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftDescription, setDraftDescription] = useState(task.description ?? '');
  const [isHovering, setIsHovering] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDefinitionMode = state.mode === 'definition';

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

  const handleDelete = () => {
    deleteTask(task.id);
    onDelete?.(task.id);
    setShowDeleteConfirm(false);
  };

  const handleSaveDescription = useCallback(() => {
    onUpdateDescription?.(task.id, draftDescription.trim());
    setIsEditing(false);
  }, [task.id, draftDescription, onUpdateDescription]);

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

  return (
    <>
    <div
      className="py-2 px-3 rounded-md hover:bg-muted/50 group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main task row */}
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        {dragHandleProps && (
          <button
            type="button"
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 mt-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </button>
        )}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleTaskCompleted(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          className="mt-0.5"
        />

        <div className="flex-1 min-w-0">
          {/* Title and actions row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  'text-sm block',
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

            <div className="flex items-center gap-1 shrink-0">
              <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex gap-1">
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
          </div>

          {/* Add details link - shows on hover when no description (definition mode only) */}
          {!hasDescription && !isEditing && isDefinitionMode && onUpdateDescription && (
            <button
              type="button"
              onClick={handleAddDetailsClick}
              className={cn(
                'text-xs text-muted-foreground hover:text-foreground transition-all mt-1',
                isHovering ? 'opacity-100' : 'opacity-0'
              )}
            >
              + Add details...
            </button>
          )}

          {/* Description preview - click to edit (definition mode only) */}
          {hasDescription && !isEditing && (
            <button
              type="button"
              onClick={isDefinitionMode && onUpdateDescription ? handleDescriptionClick : undefined}
              className={cn(
                'text-xs text-muted-foreground mt-1 line-clamp-2 text-left',
                isDefinitionMode && onUpdateDescription && 'cursor-pointer hover:text-foreground transition-colors'
              )}
            >
              {task.description}
            </button>
          )}

          {/* Edit description area (definition mode only) */}
          {isEditing && isDefinitionMode && onUpdateDescription && (
            <div className="mt-2">
              <div className="space-y-2">
                <textarea
                  ref={textareaRef}
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className={cn(
                    'w-full min-h-[60px] p-2 text-xs rounded-md resize-none',
                    'bg-background border border-input text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring/30'
                  )}
                  rows={3}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[10px]">Esc</kbd> cancel
                  </span>
                  <span>
                    <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[10px]">⌘</kbd>+
                    <kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[10px]">Enter</kbd> save
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
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
