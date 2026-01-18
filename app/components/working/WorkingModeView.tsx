'use client';

import { useStore } from '@/lib/store';
import { initializeAudio, playChime, playCompletion } from '@/lib/notifications';
import { getElapsedSeconds } from '@/lib/timer';
import { useEffect, useCallback, useState } from 'react';
import { ActiveContextPanel } from './ActiveContextPanel';
import { SessionTimer } from './SessionTimer';
import { ContextSwitcher } from './ContextSwitcher';
import { WorkingTaskList } from './WorkingTaskList';
import { SessionControls } from './SessionControls';
import { SessionSummary, calculateSessionSummary, type SessionSummaryData } from './SessionSummary';

export function WorkingModeView() {
  const { state, getContextById, endSession, pauseSession, resumeSession } = useStore();
  const session = state.session;
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

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

  if (!session) {
    return null;
  }

  const activeContext = session.activeContextId
    ? getContextById(session.activeContextId)
    : null;

  const activeAllocation = session.allocations.find(
    (a) => a.contextId === session.activeContextId
  );

  const isPaused = session.status === 'paused';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with session timer */}
      <header className="border-b bg-card px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <h1 className="text-lg sm:text-xl font-semibold">Working Mode</h1>
          <SessionTimer
            session={session}
            onSessionExhausted={handleSessionExhausted}
          />
        </div>
      </header>

      {/* Main content area */}
      <div id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main panel - Active context and tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active context panel */}
            {activeContext && activeAllocation ? (
              <ActiveContextPanel
                context={activeContext}
                allocation={activeAllocation}
                contextStartedAt={session.contextStartedAt}
                isPaused={isPaused}
                onTimeExhausted={handleContextTimeExhausted}
              />
            ) : (
              <div className="p-6 border rounded-lg bg-card">
                <p className="text-muted-foreground">No active context</p>
              </div>
            )}

            {/* Tasks for active context */}
            {session.activeContextId && (
              <WorkingTaskList contextId={session.activeContextId} />
            )}
          </div>

          {/* Sidebar - Context switcher */}
          <div className="space-y-6">
            <ContextSwitcher session={session} />
          </div>
        </div>
      </div>

      {/* Paused overlay indicator */}
      {isPaused && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center pointer-events-none z-40">
          <div className="bg-card border rounded-lg px-6 py-4 shadow-lg">
            <p className="text-lg font-semibold text-muted-foreground">Session Paused</p>
          </div>
        </div>
      )}

      {/* Footer with session controls */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-card px-4 sm:px-6 py-3 sm:py-4 z-50">
        <div className="max-w-6xl mx-auto flex justify-end gap-2 sm:gap-4">
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
    </div>
  );
}
