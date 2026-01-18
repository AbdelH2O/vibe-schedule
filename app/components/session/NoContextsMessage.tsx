'use client';

import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';
import { EmptyState } from '../shared/EmptyState';

interface NoContextsMessageProps {
  onClose: () => void;
  className?: string;
}

export function NoContextsMessage({ onClose, className }: NoContextsMessageProps) {
  return (
    <div role="alert" className={className}>
      <EmptyState
        icon={<Layers />}
        title="No Contexts Available"
        description="Create at least one context to start a session. Contexts help you organize and allocate time to different areas of work."
        size="lg"
        action={
          <Button variant="outline" onClick={onClose}>
            Go Back
          </Button>
        }
      />
    </div>
  );
}
