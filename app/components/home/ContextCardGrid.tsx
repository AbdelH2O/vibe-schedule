'use client';

import { useStore } from '@/lib/store';
import { ContextCard } from './ContextCard';
import { Button } from '@/components/ui/button';
import { Layers, Plus } from 'lucide-react';

interface ContextCardGridProps {
  onSelectContext: (id: string) => void;
  onCreateContext: () => void;
}

export function ContextCardGrid({ onSelectContext, onCreateContext }: ContextCardGridProps) {
  const { state, getTasksByContextId } = useStore();
  const { contexts } = state;

  // Sort contexts by priority (highest priority first)
  const sortedContexts = [...contexts].sort((a, b) => a.priority - b.priority);

  if (contexts.length === 0) {
    return (
      <section aria-labelledby="contexts-heading">
        <h2 id="contexts-heading" className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Contexts
        </h2>
        <div className="border rounded-lg bg-muted/50 p-8 text-center">
          <Layers className="size-12 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
          <h3 className="font-medium mb-1">No contexts yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first context to organize your work
          </p>
          <Button onClick={onCreateContext} className="gap-2">
            <Plus className="size-4" aria-hidden="true" />
            New Context
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="contexts-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="contexts-heading" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Contexts
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateContext}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">New Context</span>
        </Button>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        role="list"
        aria-label="Context cards"
      >
        {sortedContexts.map((context) => (
          <div key={context.id} role="listitem">
            <ContextCard
              context={context}
              tasks={getTasksByContextId(context.id)}
              onClick={() => onSelectContext(context.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
