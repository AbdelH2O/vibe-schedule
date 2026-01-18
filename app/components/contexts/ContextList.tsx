'use client';

import { useStore } from '@/lib/store';
import { ContextListItem } from './ContextListItem';
import { EmptyState } from '../shared/EmptyState';
import { cn } from '@/lib/utils';
import { Layers } from 'lucide-react';

interface ContextListProps {
  selectedContextId?: string | null;
  onSelectContext?: (contextId: string) => void;
  className?: string;
  showEmptyState?: boolean;
}

export function ContextList({
  selectedContextId,
  onSelectContext,
  className,
  showEmptyState = false,
}: ContextListProps) {
  const { state } = useStore();

  if (state.contexts.length === 0 && showEmptyState) {
    return (
      <EmptyState
        icon={<Layers className="size-8" />}
        title="No contexts yet"
        description="Create your first context to organize your work."
        className={className}
      />
    );
  }

  return (
    <ul
      className={cn(
        'space-y-1 overflow-y-auto max-h-[calc(100vh-20rem)]',
        className
      )}
      role="listbox"
      aria-label="Contexts"
    >
      {state.contexts.map((context) => (
        <li key={context.id} role="option" aria-selected={selectedContextId === context.id}>
          <ContextListItem
            context={context}
            isSelected={selectedContextId === context.id}
            onClick={() => onSelectContext?.(context.id)}
          />
        </li>
      ))}
    </ul>
  );
}
