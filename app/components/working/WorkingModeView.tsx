'use client';

import { useStore } from '@/lib/store';
import { initializeAudio, playChime, playCompletion } from '@/lib/notifications';
import { getElapsedSeconds } from '@/lib/timer';
import { getContextColor } from '@/lib/colors';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Bell } from 'lucide-react';
import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { ActiveContextPanel } from './ActiveContextPanel';
import { SessionTimer } from './SessionTimer';
import { ContextDropdown, type ContextDropdownRef } from './ContextDropdown';
import { WorkingTaskList } from './WorkingTaskList';
import type { WorkingQuickAddRef } from './WorkingQuickAdd';
import { SessionControls } from './SessionControls';
import { SessionSummary, calculateSessionSummary, type SessionSummaryData } from './SessionSummary';
import { WorkingSidebar } from './WorkingSidebar';

export function WorkingModeView() {
  const { state, getContextById, endSession, pauseSession, resumeSession, suspendSession, notificationState } = useStore();
  const session = state.session;
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const quickAddRef = useRef<WorkingQuickAddRef>(null);
  const contextDropdownRef = useRef<ContextDropdownRef>(null);

  // Get active context for theming
  const activeContext = useMemo(() => {
    if (!session?.activeContextId) return null;
    return getContextById(session.activeContextId);
  }, [session?.activeContextId, getContextById]);

  // Get context color for CSS variables (subtle tint system)
  const contextColorStyle = useMemo(() => {
    const colorName = activeContext?.color ?? 'blue';
    const colors = getContextColor(colorName);

    return {
      '--context-color': colors.gradient,
      '--context-dot': colors.dotColor,  // Consistent OKLCH dot color
      '--card-bg': `oklch(0.97 0.015 ${colors.hue})`,  // Subtle tint
      '--container-bg': colors.containerBg,
    } as React.CSSProperties;
  }, [activeContext?.color]);

  // Initialize audio on first render (after user gesture from starting session)
  useEffect(() => {
    initializeAudio();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in an input or if a dialog is open
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        showSummary ||
        showEndDialog
      ) {
        return;
      }

      // Space to toggle pause/resume
      if (e.code === 'Space' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (session?.status === 'paused') {
          resumeSession();
        } else {
          pauseSession();
        }
      }

      // Escape to open end session dialog
      if (e.code === 'Escape' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setShowEndDialog(true);
      }

      // 'n' to focus quick add input
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        quickAddRef.current?.focus();
      }

      // 'c' to open context dropdown
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        contextDropdownRef.current?.open();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session?.status, pauseSession, resumeSession, showSummary, showEndDialog]);

  const handleContextTimeExhausted = useCallback(() => {
    playChime();
  }, []);

  // Prepare session end: capture summary data and show the summary dialog
  const prepareEndSession = useCallback(() => {
    if (!session) return;

    // Calculate elapsed time for current context
    const currentElapsedMinutes = session.contextStartedAt
      ? getElapsedSeconds(session.contextStartedAt) / 60
      : 0;

    // Capture summary data before ending
    const summary = calculateSessionSummary(
      session,
      state.contexts,
      state.tasks,
      currentElapsedMinutes
    );
    setSummaryData(summary);
    setShowSummary(true);
  }, [session, state.contexts, state.tasks]);

  // Actually end the session after summary is dismissed
  const handleDismissSummary = useCallback(() => {
    setShowSummary(false);
    setSummaryData(null);
    endSession();
  }, [endSession]);

  const handleSessionExhausted = useCallback(() => {
    playCompletion();
    // Show summary instead of directly ending
    prepareEndSession();
  }, [prepareEndSession]);

  const handleSuspend = useCallback(() => {
    if (!session) return;
    // Calculate elapsed time for current context since contextStartedAt
    const elapsedMinutes = session.contextStartedAt
      ? getElapsedSeconds(session.contextStartedAt) / 60
      : 0;
    suspendSession(elapsedMinutes);
  }, [session, suspendSession]);

  if (!session) {
    return null;
  }

  const activeAllocation = session.allocations.find(
    (a) => a.contextId === session.activeContextId
  );

  // Get all contexts in the session for the sidebar
  const sessionContexts = useMemo(() => {
    return session.allocations
      .map((a) => state.contexts.find((c) => c.id === a.contextId))
      .filter((c): c is NonNullable<typeof c> => c !== undefined);
  }, [session.allocations, state.contexts]);

  // Pause timer when session is manually paused OR when reminder notification is active
  const isPaused = session.status === 'paused' || notificationState.isPausedByReminder;

  return (
    <div
      className="min-h-screen pb-20 working-gradient"
      style={contextColorStyle}
    >
      {/* Context accent bar at top */}
      <div className="context-accent-bar" aria-hidden="true" />

      {/* Header with session timer and context dropdown */}
      <header aria-label="Session controls" className="border-b bg-card/80 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSuspend}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back to Planning</span>
              <span className="sm:hidden">Back</span>
            </Button>

            {/* Mobile sidebar toggle - only visible on mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden"
              aria-label="Open dates and reminders"
            >
              <Calendar className="size-4" />
            </Button>
          </div>

          {/* Context dropdown - center */}
          <ContextDropdown ref={contextDropdownRef} session={session} />

          {/* Session timer - right */}
          <SessionTimer
            session={session}
            onSessionExhausted={handleSessionExhausted}
          />
        </div>
      </header>

      {/* Main content area - single column layout */}
      <div id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Active context panel */}
          {activeContext && activeAllocation ? (
            <ActiveContextPanel
              context={activeContext}
              allocation={activeAllocation}
              contextStartedAt={session.contextStartedAt}
              isPaused={isPaused}
              isPausedByReminder={notificationState.isPausedByReminder}
              onTimeExhausted={handleContextTimeExhausted}
            />
          ) : (
            <div className="p-6 border rounded-lg bg-card">
              <p className="text-muted-foreground">No active context</p>
            </div>
          )}

          {/* Tasks for active context - full width, prominent */}
          {session.activeContextId && (
            <WorkingTaskList
              ref={quickAddRef}
              contextId={session.activeContextId}
              contextColor={activeContext?.color}
            />
          )}
        </div>
      </div>

      {/* Paused overlay indicator - only show for manual pause, not reminder pause */}
      {session.status === 'paused' && !notificationState.isPausedByReminder && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center pointer-events-none z-40">
          <div className="bg-card border rounded-lg px-6 py-4 shadow-lg">
            <p className="text-lg font-semibold text-muted-foreground">Session Paused</p>
          </div>
        </div>
      )}

      {/* Footer with session controls */}
      <footer aria-label="Session actions" className="fixed bottom-0 left-0 right-0 border-t bg-card/80 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 z-50">
        <div className="max-w-4xl mx-auto flex justify-end gap-2 sm:gap-4">
          <SessionControls
            onEndSession={prepareEndSession}
            isPaused={isPaused}
            onPause={pauseSession}
            onResume={resumeSession}
            showEndDialog={showEndDialog}
            onEndDialogChange={setShowEndDialog}
          />
        </div>
      </footer>

      {/* Session summary dialog */}
      <SessionSummary
        open={showSummary}
        onDismiss={handleDismissSummary}
        summaryData={summaryData}
      />

      {/* Working sidebar - dates and reminders */}
      <WorkingSidebar
        session={session}
        sessionContexts={sessionContexts}
        mobileOpen={mobileSidebarOpen}
        onMobileOpenChange={setMobileSidebarOpen}
      />
    </div>
  );
}
