'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClientProvider } from './components/ClientProvider';
import { AppShell } from './components/AppShell';
import { ModeIndicator } from './components/ModeIndicator';
import { DemoTemplateButton } from './components/DemoTemplateButton';
import { ContextDetail } from './components/contexts/ContextDetail';
import { InboxView } from './components/tasks/InboxView';
import { SessionSetupDialog } from './components/session/SessionSetupDialog';
import { ActiveSessionBanner } from './components/session/ActiveSessionBanner';
import { WorkingModeView } from './components/working/WorkingModeView';
import { CreateContextDialog } from './components/contexts/CreateContextDialog';
import { QuickCaptureBar } from './components/home/QuickCaptureBar';
import { ContextCardGrid } from './components/home/ContextCardGrid';
import { SessionSuggestions } from './components/home/SessionSuggestions';
import { ReminderModal } from './components/reminders/ReminderModal';
import { DataManagement } from './components/settings/DataManagement';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { SignInDialog } from './components/auth/SignInDialog';
import { SignOutDialog } from './components/auth/SignOutDialog';
import { SyncStatusIndicator } from './components/sync/SyncStatusIndicator';
import { useReminderScheduler } from '@/lib/useReminderScheduler';
import { useStore } from '@/lib/store';
import { clearLocalData } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Settings, Loader2 } from 'lucide-react';
import type { AppState } from '@/lib/types';

type Selection =
  | { type: 'inbox' }
  | { type: 'context'; id: string }
  | null;

function AuthButtons() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (isAuthenticated) {
    return <SignOutDialog />;
  }

  return <SignInDialog />;
}

function HomeContent() {
  const { state, getContextById, resumeSession, endSession } = useStore();
  const { isAuthenticated, cloudData, isLoadingCloudData } = useAuth();

  // Initialize the reminder scheduler
  useReminderScheduler();
  const [selection, setSelection] = useState<Selection>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [createContextOpen, setCreateContextOpen] = useState(false);
  const [dataManagementOpen, setDataManagementOpen] = useState(false);

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
        headerRightContent={
          <div className="flex items-center gap-2">
            <DemoTemplateButton />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDataManagementOpen(true)}
              aria-label="Data Management"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <SyncStatusIndicator />
            <AuthButtons />
            <ModeIndicator />
          </div>
        }
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
        <DataManagement
          open={dataManagementOpen}
          onOpenChange={setDataManagementOpen}
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

function HomeWithAuth() {
  // Handle sign-out with optional data clearing
  const handleSignOut = useCallback((clearData: boolean) => {
    if (clearData) {
      clearLocalData();
      // Force page reload to reset state
      window.location.reload();
    }
  }, []);

  return (
    <AuthProvider onSignOut={handleSignOut}>
      <HomeContent />
      {/* Global reminder modal - renders on top of everything */}
      <ReminderModal />
    </AuthProvider>
  );
}

export default function Home() {
  return (
    <ClientProvider>
      <HomeWithAuth />
    </ClientProvider>
  );
}
