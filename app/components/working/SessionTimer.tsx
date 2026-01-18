'use client';

import { useState, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { formatTime, getElapsedSeconds, calculateSessionRemainingSeconds } from '@/lib/timer';
import { cn, getProgressColorClass } from '@/lib/utils';
import { getTimeProgress } from '@/lib/dates';
import { Progress } from '@/components/ui/progress';
import type { Session } from '@/lib/types';
import { Clock } from 'lucide-react';

interface SessionTimerProps {
  session: Session;
  onSessionExhausted?: () => void;
  className?: string;
}

// Throttle interval for screen reader announcements (30 seconds)
const ANNOUNCEMENT_INTERVAL_MS = 30000;

// External store for announcements
let sessionAnnouncementText = '';
let sessionAnnouncementListeners: Array<() => void> = [];

function subscribeToSessionAnnouncement(callback: () => void) {
  sessionAnnouncementListeners.push(callback);
  return () => {
    sessionAnnouncementListeners = sessionAnnouncementListeners.filter((l) => l !== callback);
  };
}

function getSessionAnnouncementSnapshot() {
  return sessionAnnouncementText;
}

function triggerSessionAnnouncement(text: string) {
  sessionAnnouncementText = text;
  sessionAnnouncementListeners.forEach((l) => l());

  // Clear after screen reader has time
  setTimeout(() => {
    sessionAnnouncementText = '';
    sessionAnnouncementListeners.forEach((l) => l());
  }, 1000);
}

export function SessionTimer({
  session,
  onSessionExhausted,
  className,
}: SessionTimerProps) {
  const [tick, setTick] = useState(0);
  const hasNotifiedRef = useRef(false);

  const announcement = useSyncExternalStore(
    subscribeToSessionAnnouncement,
    getSessionAnnouncementSnapshot,
    () => ''
  );

  const isPaused = session.status === 'paused';

  // Reset notification flag when session changes
  useEffect(() => {
    hasNotifiedRef.current = false;
  }, [session.id]);

  // Timer tick effect
  useEffect(() => {
    if (isPaused || !session.contextStartedAt) {
      return;
    }

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, session.contextStartedAt]);

  // Calculate current elapsed seconds for active context
  const currentElapsedSeconds = useMemo(() => {
    if (!session.contextStartedAt || isPaused) return 0;
    void tick;
    return getElapsedSeconds(session.contextStartedAt);
  }, [session.contextStartedAt, isPaused, tick]);

  const remainingSeconds = calculateSessionRemainingSeconds(
    session.totalDuration,
    session.allocations,
    currentElapsedSeconds
  );

  const isExhausted = remainingSeconds <= 0;

  // Calculate total used minutes for progress bar
  const totalUsedMinutes = session.allocations.reduce(
    (sum, a) => sum + a.usedMinutes,
    0
  ) + (currentElapsedSeconds / 60);
  const { percentage, status } = getTimeProgress(session.totalDuration, totalUsedMinutes);
  const colors = getProgressColorClass(status);
  const displayPercentage = Math.min(percentage, 100);

  // Notify when session is exhausted (only once per session)
  useEffect(() => {
    if (isExhausted && !hasNotifiedRef.current && onSessionExhausted) {
      hasNotifiedRef.current = true;
      onSessionExhausted();
    }
  }, [isExhausted, onSessionExhausted]);

  // Throttled screen reader announcements (every 30 seconds)
  useEffect(() => {
    if (isPaused) return;

    const announceTime = () => {
      const minutes = Math.floor(Math.abs(remainingSeconds) / 60);
      const prefix = remainingSeconds <= 0 ? 'Overtime: ' : '';
      triggerSessionAnnouncement(`${prefix}${minutes} minutes remaining in session`);
    };

    // Initial announcement after first 30 seconds
    const interval = setInterval(announceTime, ANNOUNCEMENT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPaused, remainingSeconds]);

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
        <span
          className={cn(
            'font-mono text-sm tabular-nums',
            isExhausted && 'text-destructive font-medium animate-pulse-slow',
            colors.text
          )}
          role="timer"
          aria-label={`Session time remaining: ${formatTime(remainingSeconds)}`}
        >
          {formatTime(remainingSeconds)}
        </span>
        {isPaused && (
          <span className="text-xs text-muted-foreground">(paused)</span>
        )}
      </div>

      <div className={cn('w-32', isPaused && 'opacity-60')}>
        <Progress
          value={displayPercentage}
          className={cn('h-1.5', colors.bg)}
          indicatorClassName={cn(
            colors.bar,
            status === 'overtime' && 'animate-pulse-slow',
            isPaused && 'transition-none'
          )}
        />
      </div>

      {/* Screen reader announcement region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}
