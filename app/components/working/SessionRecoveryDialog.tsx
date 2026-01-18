'use client';

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

interface SessionRecoveryDialogProps {
  open: boolean;
  onContinue: () => void;
  onDiscard: () => void;
}

export function SessionRecoveryDialog({
  open,
  onContinue,
  onDiscard,
}: SessionRecoveryDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Recovery</AlertDialogTitle>
          <AlertDialogDescription>
            It looks like you had an active session. Would you like to continue
            where you left off, or start fresh?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard}>Discard Session</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>Continue Session</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
