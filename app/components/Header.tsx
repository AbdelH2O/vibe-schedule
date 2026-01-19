'use client';

import { ReactNode, useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReminderSheet } from './reminders/ReminderSheet';
import { useStore } from '@/lib/store';

interface HeaderProps {
  onMenuClick?: () => void;
  rightContent?: ReactNode;
}

export function Header({ onMenuClick, rightContent }: HeaderProps) {
  const [remindersOpen, setRemindersOpen] = useState(false);
  const { getEnabledReminders, notificationState } = useStore();

  const enabledReminders = getEnabledReminders();
  const hasActiveReminders = enabledReminders.length > 0;
  const pendingCount = notificationState.notificationQueue.length +
    (notificationState.activeNotification ? 1 : 0);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>

        {/* App title */}
        <h1 className="text-xl font-bold">
          Vibe-Schedule
        </h1>
      </div>

      {/* Right content (mode indicator, etc.) */}
      <div className="flex items-center gap-2">
        {/* Bell icon for reminders */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRemindersOpen(true)}
          aria-label="Open reminders"
          className="relative"
        >
          <Bell className="size-5" />
          {/* Active indicator dot */}
          {hasActiveReminders && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
          )}
          {/* Pending notification badge */}
          {pendingCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </Button>

        {rightContent}

        <ReminderSheet open={remindersOpen} onOpenChange={setRemindersOpen} />
      </div>
    </header>
  );
}
