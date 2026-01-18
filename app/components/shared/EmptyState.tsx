'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateSize = 'sm' | 'md' | 'lg';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: EmptyStateSize;
}

const sizeStyles: Record<EmptyStateSize, { container: string; icon: string; title: string }> = {
  sm: {
    container: 'p-4',
    icon: 'mb-2 [&>svg]:size-6',
    title: 'text-sm',
  },
  md: {
    container: 'p-6',
    icon: 'mb-3 [&>svg]:size-8',
    title: 'text-sm',
  },
  lg: {
    container: 'p-8',
    icon: 'mb-4 [&>svg]:size-12',
    title: 'text-base',
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        styles.container,
        className
      )}
    >
      {icon && (
        <div
          className={cn('text-muted-foreground/60', styles.icon)}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className={cn('font-medium text-foreground', styles.title)}>{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-[280px]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
