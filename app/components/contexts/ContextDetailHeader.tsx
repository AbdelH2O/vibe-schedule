'use client';

import { Button } from '@/components/ui/button';
import { Settings, Trash2 } from 'lucide-react';
import { getContextColor } from '@/lib/colors';
import { ContextStatsBar } from './ContextStatsBar';
import type { Context, Task } from '@/lib/types';

interface ContextDetailHeaderProps {
  context: Context;
  tasks: Task[];
  isDefinitionMode: boolean;
  onSettingsClick: () => void;
  onDeleteClick: () => void;
}

export function ContextDetailHeader({
  context,
  tasks,
  isDefinitionMode,
  onSettingsClick,
  onDeleteClick,
}: ContextDetailHeaderProps) {
  const colorClasses = getContextColor(context.color);

  return (
    <header
      className="border-b"
      role="banner"
      aria-label="Context details"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Color indicator */}
            <span
              className={`size-3 rounded-full shrink-0 ${colorClasses.dot}`}
              aria-hidden="true"
            />
            <h1 className="text-xl font-semibold truncate">{context.name}</h1>
          </div>

          {/* Actions - only visible in definition mode */}
          {isDefinitionMode && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettingsClick}
                aria-label="Context settings"
              >
                <Settings className="size-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDeleteClick}
                aria-label="Delete context"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="mt-2">
          <ContextStatsBar
            tasks={tasks}
            minDuration={context.minDuration}
            maxDuration={context.maxDuration}
            importantDates={context.importantDates}
          />
        </div>
      </div>
    </header>
  );
}
