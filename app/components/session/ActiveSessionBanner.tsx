'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Session, Context } from '@/lib/types';
import { Play, X, Trash2 } from 'lucide-react';

// Hook to detect Mac vs Windows/Linux for keyboard shortcut display
function useIsMac() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes('MAC'));
  }, []);
  return isMac;
}
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ActiveSessionBannerProps {
  session: Session;
  contexts: Context[];
  onResume: () => void;
  onDiscard: () => void;
}

export function ActiveSessionBanner({
  session,
  contexts,
  onResume,
  onDiscard,
}: ActiveSessionBannerProps) {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isMac = useIsMac();

  if (dismissed) {
    return null;
  }

  // Calculate remaining time
  const totalUsedMinutes = session.allocations.reduce(
    (sum, alloc) => sum + alloc.usedMinutes,
    0
  );
  const remainingMinutes = Math.max(0, session.totalDuration - totalUsedMinutes);
  const remainingFormatted =
    remainingMinutes >= 60
      ? `${Math.floor(remainingMinutes / 60)}h ${Math.round(remainingMinutes % 60)}m`
      : `${Math.round(remainingMinutes)}m`;

  // Get active context name
  const activeContext = contexts.find((c) => c.id === session.activeContextId);
  const activeContextName = activeContext?.name ?? 'No context';

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="bg-primary/10 border-b border-primary/20 px-4 py-3"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              You have a suspended session
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {remainingFormatted} remaining &bull; {activeContextName}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={onResume}
              className="gap-1.5"
            >
              <Play className="size-3.5" />
              Resume Session
              <kbd className="ml-1 px-1.5 py-0.5 rounded bg-primary-foreground/20 text-[10px] font-mono">
                {isMac ? '⌘S' : 'Ctrl+S'}
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDiscardDialog(true)}
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
              <span className="sr-only sm:not-sr-only">Discard</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDismissed(true)}
              className="size-8"
              aria-label="Dismiss banner"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently end your suspended session. All progress
              tracking for this session will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
