'use client';

import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExpandCollapseButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
  'aria-label'?: string;
}

/**
 * Button to expand/collapse a parent task's children.
 * Shows ChevronRight when collapsed, ChevronDown when expanded.
 */
export function ExpandCollapseButton({
  isExpanded,
  onToggle,
  className,
  'aria-label': ariaLabel,
}: ExpandCollapseButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }
      }}
      className={cn(
        'p-0.5 rounded hover:bg-muted transition-colors',
        'text-muted-foreground hover:text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring/30',
        className
      )}
      aria-label={ariaLabel ?? (isExpanded ? 'Collapse subtasks' : 'Expand subtasks')}
      aria-expanded={isExpanded}
    >
      {isExpanded ? (
        <ChevronDown className="size-4" aria-hidden="true" />
      ) : (
        <ChevronRight className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
