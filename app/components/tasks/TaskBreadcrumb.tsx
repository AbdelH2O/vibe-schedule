'use client';

import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildBreadcrumb } from '@/lib/taskHierarchy';
import type { Task } from '@/lib/types';

export interface TaskBreadcrumbProps {
  tasks: Task[];
  focusedTaskId: string | null;
  rootLabel: string;
  onNavigate: (taskId: string | null) => void;
  className?: string;
}

/**
 * Breadcrumb navigation for focused task hierarchy.
 * Shows path from root to currently focused task, allowing navigation back up.
 */
export function TaskBreadcrumb({
  tasks,
  focusedTaskId,
  rootLabel,
  onNavigate,
  className,
}: TaskBreadcrumbProps) {
  if (focusedTaskId === null) {
    return null; // Don't render breadcrumb when at root
  }

  const items = buildBreadcrumb(tasks, focusedTaskId, rootLabel);

  return (
    <nav
      className={cn('flex items-center gap-1 text-sm', className)}
      aria-label="Task breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isRoot = item.id === null;

        return (
          <div key={item.id ?? 'root'} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight
                className="size-3.5 text-muted-foreground shrink-0"
                aria-hidden="true"
              />
            )}
            {isLast ? (
              // Current item (not clickable)
              <span
                className="text-foreground font-medium truncate max-w-[200px]"
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              // Clickable ancestor
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors',
                  'truncate max-w-[150px]'
                )}
                title={`Navigate to ${item.label}`}
              >
                {isRoot && <Home className="size-3.5 shrink-0" aria-hidden="true" />}
                <span className="truncate">{item.label}</span>
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
