'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ContextForm } from './ContextForm';

interface CreateContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateContextDialog({
  open,
  onOpenChange,
}: CreateContextDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Context</DialogTitle>
        </DialogHeader>
        <ContextForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
}
