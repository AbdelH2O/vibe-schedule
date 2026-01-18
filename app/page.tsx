'use client';

import { useState, useEffect } from 'react';
import { ClientProvider } from './components/ClientProvider';
import { AppShell } from './components/AppShell';
import { ModeIndicator } from './components/ModeIndicator';
import { ContextDetail } from './components/contexts/ContextDetail';
import { InboxView } from './components/tasks/InboxView';
import { SessionSetupDialog } from './components/session/SessionSetupDialog';
import { ActiveSessionBanner } from './components/session/ActiveSessionBanner';
import { WorkingModeView } from './components/working/WorkingModeView';
import { CreateContextDialog } from './components/contexts/CreateContextDialog';
import { QuickCaptureBar } from './components/home/QuickCaptureBar';
import { ContextCardGrid } from './components/home/ContextCardGrid';
import { SessionSuggestions } from './components/home/SessionSuggestions';
import { useStore } from '@/lib/store';

type Selection =
  | { type: 'inbox' }
  | { type: 'context'; id: string }
  | null;

function HomeContent() {
  const { state, getContextById, resumeSession, endSession } = useStore();
  const [selection, setSelection] = useState<Selection>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [createContextOpen, setCreateContextOpen] = useState(false);

  // Compute mode announcement text - displayed via aria-live region
  const modeAnnouncement = state.mode === 'definition' ? 'Definition Mode' : 'Working Mode';

  // Check if we have a suspended session to show the banner
  const hasSuspendedSession = state.session?.status === 'suspended';

  // Global keyboard shortcut: Cmd/Ctrl + S to resume or start session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();

        // Don't trigger when typing in inputs
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }

        if (state.session?.status === 'suspended') {
          resumeSession();
        } else {
          setSessionDialogOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.session?.status, resumeSession]);

  // Render Working Mode when in working mode with active session
  if (state.mode === 'working' && state.session) {
    return (
      <>
        <ModeAnnouncementRegion mode={state.mode} announcement={modeAnnouncement} />
        <WorkingModeView />
      </>
    );
  }

  // For backward compatibility with AppShell
  const selectedContextId = selection?.type === 'context' ? selection.id : null;
  const setSelectedContextId = (id: string | null) => {
    setSelection(id ? { type: 'context', id } : null);
  };

  const selectedContext = selectedContextId
    ? getContextById(selectedContextId)
    : undefined;

  const isInboxSelected = selection?.type === 'inbox';
  const isHomeSelected = selection === null;

  const handleSelectInbox = () => {
    setSelection({ type: 'inbox' });
  };

  const handleSelectHome = () => {
    setSelection(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ModeAnnouncementRegion mode={state.mode} announcement={modeAnnouncement} />
      {hasSuspendedSession && state.session && (
        <div className="shrink-0">
          <ActiveSessionBanner
            session={state.session}
            contexts={state.contexts}
            onResume={resumeSession}
            onDiscard={endSession}
          />
        </div>
      )}
      <AppShell
        headerRightContent={<ModeIndicator />}
        selectedContextId={selectedContextId}
        onSelectContext={setSelectedContextId}
        isInboxSelected={isInboxSelected}
        onSelectInbox={handleSelectInbox}
        isHomeSelected={isHomeSelected}
        onSelectHome={handleSelectHome}
      >
        <div className="max-w-4xl mx-auto">
        {isInboxSelected ? (
          <InboxView />
        ) : selectedContext ? (
          <ContextDetail
            context={selectedContext}
            onDeleted={() => setSelection(null)}
          />
        ) : (
          <div className="space-y-6">
            {/* Quick Capture Bar */}
            <QuickCaptureBar onNavigateToInbox={handleSelectInbox} />

            {/* Context Cards Grid */}
            <ContextCardGrid
              onSelectContext={setSelectedContextId}
              onCreateContext={() => setCreateContextOpen(true)}
            />

            {/* Session Suggestions */}
            {state.mode === 'definition' && (
              <SessionSuggestions
                onOpenCustomDialog={() => setSessionDialogOpen(true)}
              />
            )}
          </div>
        )}
        </div>

        <SessionSetupDialog
          open={sessionDialogOpen}
          onOpenChange={setSessionDialogOpen}
        />
        <CreateContextDialog
          open={createContextOpen}
          onOpenChange={setCreateContextOpen}
        />
      </AppShell>
    </div>
  );
}

function ModeAnnouncementRegion({ mode, announcement }: { mode: string; announcement: string }) {
  // Use mode as key to trigger screen reader announcement on mode change
  return (
    <div
      key={mode}
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      className="sr-only"
    >
      Switched to {announcement}
    </div>
  );
}

export default function Home() {
  return (
    <ClientProvider>
      <HomeContent />
    </ClientProvider>
  );
}
