'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { X, Inbox, Layers, Plus } from 'lucide-react';
import { ContextList } from './contexts/ContextList';
import { CreateContextDialog } from './contexts/CreateContextDialog';
import { EmptyState } from './shared/EmptyState';

interface SidebarProps {
  className?: string;
  selectedContextId?: string | null;
  onSelectContext?: (contextId: string) => void;
}

export function SidebarContent({
  className,
  selectedContextId,
  onSelectContext,
}: SidebarProps) {
  const { state } = useStore();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Create Context Dialog */}
      <CreateContextDialog
        open={isCreating}
        onOpenChange={setIsCreating}
      />

      {/* Contexts section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contexts
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setIsCreating(true)}
            aria-label="Add new context"
          >
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {state.contexts.length === 0 ? (
          <EmptyState
            icon={<Layers className="size-8" />}
            title="No contexts yet"
            description="Create your first context to organize your work."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="size-4 mr-2" aria-hidden="true" />
                Create Context
              </Button>
            }
          />
        ) : (
          <ContextList
            selectedContextId={selectedContextId}
            onSelectContext={onSelectContext}
          />
        )}
      </div>

      <Separator />

      {/* Inbox section */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Inbox className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Inbox
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {state.tasks.filter((t) => t.contextId === null).length} unassigned
          tasks
        </p>
      </div>
    </div>
  );
}

interface MobileSidebarCloseProps {
  onClose?: () => void;
}

export function MobileSidebarClose({ onClose }: MobileSidebarCloseProps) {
  return (
    <div className="flex items-center justify-end p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X className="size-5" aria-hidden="true" />
      </Button>
    </div>
  );
}
