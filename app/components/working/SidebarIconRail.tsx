'use client';

import { forwardRef } from 'react';
import { Calendar, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarIconRailProps {
  datesCount: number;
  remindersCount: number;
  hasUrgentDates: boolean;
  hasImminentReminders: boolean;
  onDatesClick: () => void;
  onRemindersClick: () => void;
  activeTab: 'dates' | 'reminders' | null;
}

export const SidebarIconRail = forwardRef<HTMLDivElement, SidebarIconRailProps>(
  function SidebarIconRail(
    {
      datesCount,
      remindersCount,
      hasUrgentDates,
      hasImminentReminders,
      onDatesClick,
      onRemindersClick,
      activeTab,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2 p-2 bg-card border-l border-y rounded-l-lg shadow-lg"
        aria-label="Sidebar navigation"
      >
        {/* Important Dates icon */}
        <Button
          variant={activeTab === 'dates' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={onDatesClick}
          className="relative"
          aria-label={`Important dates${datesCount > 0 ? ` (${datesCount})` : ''}`}
        >
          <Calendar className="size-5" />
          {/* Count badge */}
          {datesCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-medium rounded-full bg-muted text-muted-foreground px-1">
              {datesCount > 99 ? '99+' : datesCount}
            </span>
          )}
          {/* Urgency indicator */}
          {hasUrgentDates && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
          )}
        </Button>

        {/* Reminders icon */}
        <Button
          variant={activeTab === 'reminders' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={onRemindersClick}
          className="relative"
          aria-label={`Reminders${remindersCount > 0 ? ` (${remindersCount})` : ''}`}
        >
          <Bell className="size-5" />
          {/* Count badge */}
          {remindersCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-medium rounded-full bg-muted text-muted-foreground px-1">
              {remindersCount > 99 ? '99+' : remindersCount}
            </span>
          )}
          {/* Urgency indicator */}
          {hasImminentReminders && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          )}
        </Button>
      </div>
    );
  }
);
