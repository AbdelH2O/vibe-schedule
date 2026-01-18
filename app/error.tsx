'use client';

import { useEffect } from 'react';
import { ErrorFallback } from './components/shared/ErrorFallback';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return <ErrorFallback error={error} resetErrorBoundary={reset} />;
}
