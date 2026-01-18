'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { EndSessionDialog } from './EndSessionDialog';
import { Square, Pause, Play } from 'lucide-react';

interface SessionControlsProps {
  onEndSession: () => void;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  showEndDialog?: boolean;
  onEndDialogChange?: (open: boolean) => void;
}

export function SessionControls({
  onEndSession,
  isPaused,
  onPause,
  onResume,
  showEndDialog: externalShowEndDialog,
  onEndDialogChange,
}: SessionControlsProps) {
  const [internalShowEndDialog, setInternalShowEndDialog] = useState(false);

  // Use external state if provided, otherwise use internal state
  const showEndDialog = externalShowEndDialog ?? internalShowEndDialog;
  const setShowEndDialog = onEndDialogChange ?? setInternalShowEndDialog;

  const handleEndClick = useCallback(() => {
    setShowEndDialog(true);
  }, [setShowEndDialog]);

  const handleConfirmEnd = useCallback(() => {
    setShowEndDialog(false);
    onEndSession();
  }, [setShowEndDialog, onEndSession]);

  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      onResume();
    } else {
      onPause();
    }
  }, [isPaused, onPause, onResume]);

  return (
    <>
      <Button
        variant="outline"
        onClick={handlePauseResume}
        className="gap-2"
      >
        {isPaused ? (
          <>
            <Play className="size-4" aria-hidden="true" />
            Resume
          </>
        ) : (
          <>
            <Pause className="size-4" aria-hidden="true" />
            Pause
          </>
        )}
      </Button>

      <Button
        variant="destructive"
        onClick={handleEndClick}
        className="gap-2"
      >
        <Square className="size-4" aria-hidden="true" />
        End Session
      </Button>

      <EndSessionDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={handleConfirmEnd}
      />
    </>
  );
}
