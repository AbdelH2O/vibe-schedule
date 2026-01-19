'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, Check, Clock, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { playReminderSound } from '@/lib/notifications';
import { useEffect, useRef } from 'react';

const SNOOZE_OPTIONS = [
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
];

export function ReminderModal() {
  const {
    notificationState,
    acknowledgeNotification,
    snoozeNotification,
    dismissNotification,
  } = useStore();

  const { activeNotification } = notificationState;
  const hasPlayedSound = useRef(false);

  // Play sound when a new notification appears
  useEffect(() => {
    if (activeNotification && !hasPlayedSound.current) {
      playReminderSound();
      hasPlayedSound.current = true;
    }
    if (!activeNotification) {
      hasPlayedSound.current = false;
    }
  }, [activeNotification]);

  if (!activeNotification) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Bell className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">{activeNotification.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {activeNotification.message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-3">
          {/* Primary action */}
          <Button
            onClick={acknowledgeNotification}
            className="w-full"
            size="lg"
          >
            <Check className="mr-2 size-4" />
            Got it
          </Button>

          {/* Snooze options */}
          <div className="flex gap-2">
            {SNOOZE_OPTIONS.map((option) => (
              <Button
                key={option.minutes}
                variant="outline"
                className="flex-1"
                onClick={() => snoozeNotification(option.minutes)}
              >
                <Clock className="mr-1 size-3" />
                {option.label}
              </Button>
            ))}
          </div>

          {/* Dismiss */}
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={dismissNotification}
          >
            <X className="mr-2 size-4" />
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
