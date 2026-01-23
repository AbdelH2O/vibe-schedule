'use client';

import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle, CloudUpload } from 'lucide-react';
import type { MigrationProgress as MigrationProgressType } from '@/lib/sync/migration';
import { cn } from '@/lib/utils';

interface MigrationProgressProps {
  progress: MigrationProgressType;
}

export function MigrationProgress({ progress }: MigrationProgressProps) {
  const percentage =
    progress.totalItems > 0
      ? Math.round((progress.processedItems / progress.totalItems) * 100)
      : 0;

  const getIcon = () => {
    switch (progress.state) {
      case 'pending':
        return <CloudUpload className="h-8 w-8 text-blue-500" />;
      case 'in-progress':
        return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-destructive" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (progress.state) {
      case 'pending':
        return 'Preparing to migrate data';
      case 'in-progress':
        return 'Migrating your data';
      case 'complete':
        return 'Migration complete';
      case 'error':
        return 'Migration failed';
      default:
        return '';
    }
  };

  const getDescription = () => {
    switch (progress.state) {
      case 'pending':
        return 'Your local data will be synced to the cloud.';
      case 'in-progress':
        return progress.currentStep;
      case 'complete':
        return 'All your data is now synced across devices.';
      case 'error':
        return progress.error || 'An error occurred during migration.';
      default:
        return '';
    }
  };

  if (progress.state === 'idle') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 p-6 bg-card rounded-lg border shadow-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          {getIcon()}

          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{getTitle()}</h3>
            <p className="text-sm text-muted-foreground">{getDescription()}</p>
          </div>

          {(progress.state === 'in-progress' || progress.state === 'complete') && (
            <div className="w-full space-y-2">
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress.processedItems} of {progress.totalItems} items
              </p>
            </div>
          )}

          {progress.state === 'complete' && (
            <p className="text-sm text-muted-foreground">
              Redirecting...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
