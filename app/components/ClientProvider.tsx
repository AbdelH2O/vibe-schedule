'use client';

import { useStore } from '@/lib/store';
import { ReactNode } from 'react';

interface ClientProviderProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
}

export function ClientProvider({ children, loadingFallback }: ClientProviderProps) {
  const { isHydrated } = useStore();

  if (!isHydrated) {
    return (
      loadingFallback ?? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
