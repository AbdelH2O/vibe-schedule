'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { X, Inbox, Layers, Plus, Home } from 'lucide-react';
import { ContextList } from './contexts/ContextList';
import { CreateContextDialog } from './contexts/CreateContextDialog';
import { EmptyState } from './shared/EmptyState';

interface SidebarProps {
  className?: string;
  selectedContextId?: string | null;
  onSelectContext?: (contextId: string) => void;
  isInboxSelected?: boolean;
  onSelectInbox?: () => void;
  isHomeSelected?: boolean;
  onSelectHome?: () => void;
}

export function SidebarContent({
  className,
  selectedContextId,
  onSelectContext,
  isInboxSelected,
  onSelectInbox,
  isHomeSelected,
  onSelectHome,
}: SidebarProps) {
  const { state, getInboxTasks } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const inboxCount = getInboxTasks().length;

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Create Context Dialog */}
      <CreateContextDialog
        open={isCreating}
        onOpenChange={setIsCreating}
      />

      {/* Home button */}
      <div className="p-4 pb-0">
        <button
          onClick={onSelectHome}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-left transition-colors min-h-[44px]',
            isHomeSelected
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-muted/50'
          )}
          aria-current={isHomeSelected ? 'page' : undefined}
        >
          <Home className="size-4" aria-hidden="true" />
          <span className="text-sm font-medium">Home</span>
        </button>
      </div>

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
            icon={<Layers />}
            title="No contexts yet"
            description="Contexts organize your tasks by project, area, or goal."
            size="sm"
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
        <button
          onClick={onSelectInbox}
          className={cn(
            'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-md text-left transition-colors min-h-[44px]',
            isInboxSelected
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-muted/50'
          )}
          aria-current={isInboxSelected ? 'page' : undefined}
        >
          <div className="flex items-center gap-2">
            <Inbox className="size-4" aria-hidden="true" />
            <span className="text-sm font-medium">Inbox</span>
          </div>
          {inboxCount > 0 && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {inboxCount}
            </span>
          )}
        </button>
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
