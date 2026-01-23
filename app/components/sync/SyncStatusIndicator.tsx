'use client';

import { useAuth } from '@/app/components/auth/AuthProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SyncStatusIndicator() {
  const { isAuthenticated, syncStatus, refreshCloudData, isLoadingCloudData } =
    useAuth();

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <Cloud className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'offline':
        return <CloudOff className="h-4 w-4 text-muted-foreground" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Cloud className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Synced';
      case 'syncing':
        return 'Syncing...';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Sync error';
      default:
        return 'Unknown';
    }
  };

  const getStatusDescription = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Your data is up to date across all devices.';
      case 'syncing':
        return 'Syncing changes with the cloud...';
      case 'offline':
        return 'You are offline. Changes will sync when you reconnect.';
      case 'error':
        return 'There was a problem syncing. Click to retry.';
      default:
        return '';
    }
  };

  const handleClick = () => {
    if (syncStatus === 'error' || syncStatus === 'offline') {
      refreshCloudData();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'gap-1.5 px-2',
              syncStatus === 'error' && 'hover:bg-destructive/10'
            )}
            onClick={handleClick}
            disabled={isLoadingCloudData || syncStatus === 'syncing'}
          >
            {getStatusIcon()}
            <span className="text-xs hidden sm:inline">{getStatusText()}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <div className="space-y-1">
            <p className="font-medium">{getStatusText()}</p>
            <p className="text-xs text-muted-foreground">
              {getStatusDescription()}
            </p>
            {(syncStatus === 'error' || syncStatus === 'offline') && (
              <p className="text-xs text-muted-foreground mt-1">
                Click to retry sync
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
