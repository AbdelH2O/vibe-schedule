'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="size-12 text-destructive" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            An unexpected error occurred. Your data should be safe. Try refreshing the page or returning to the home screen.
          </p>

          {error && process.env.NODE_ENV === 'development' && (
            <div className="p-3 rounded-md bg-muted text-xs font-mono overflow-auto max-h-32">
              <p className="text-destructive font-semibold">{error.name}</p>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleGoHome}>
              <Home className="size-4 mr-2" aria-hidden="true" />
              Go Home
            </Button>
            <Button onClick={handleRefresh}>
              <RefreshCw className="size-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
