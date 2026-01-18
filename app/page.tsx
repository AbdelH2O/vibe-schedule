'use client';

import { useState } from 'react';
import { ClientProvider } from './components/ClientProvider';
import { AppShell } from './components/AppShell';
import { ModeIndicator } from './components/ModeIndicator';
import { ContextDetail } from './components/contexts/ContextDetail';
import { InboxView } from './components/tasks/InboxView';
import { SessionSetupDialog } from './components/session/SessionSetupDialog';
import { ActiveSessionBanner } from './components/session/ActiveSessionBanner';
import { WorkingModeView } from './components/working/WorkingModeView';
import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Play, RefreshCw } from 'lucide-react';

type Selection =
  | { type: 'inbox' }
  | { type: 'context'; id: string }
  | null;

function HomeContent() {
  const { state, getContextById, resumeSession, endSession } = useStore();
  const [selection, setSelection] = useState<Selection>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);

  // Compute mode announcement text - displayed via aria-live region
  const modeAnnouncement = state.mode === 'definition' ? 'Definition Mode' : 'Working Mode';

  // Check if we have a suspended session to show the banner
  const hasSuspendedSession = state.session?.status === 'suspended';

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
    <>
      <ModeAnnouncementRegion mode={state.mode} announcement={modeAnnouncement} />
      {hasSuspendedSession && state.session && (
        <ActiveSessionBanner
          session={state.session}
          contexts={state.contexts}
          onResume={resumeSession}
          onDiscard={endSession}
        />
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
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Welcome to Vibe-Schedule
              </CardTitle>
              <CardDescription>
                A context-driven productivity system that blends task management
                with flexible time allocation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <Card className="py-4">
                  <CardHeader className="pb-2 pt-0">
                    <CardDescription className="text-xs uppercase tracking-wide">
                      Mode
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-lg font-semibold capitalize">
                      {state.mode}
                    </p>
                  </CardContent>
                </Card>

                <Card className="py-4">
                  <CardHeader className="pb-2 pt-0">
                    <CardDescription className="text-xs uppercase tracking-wide">
                      Contexts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-lg font-semibold">
                      {state.contexts.length}
                    </p>
                  </CardContent>
                </Card>

                <Card className="py-4">
                  <CardHeader className="pb-2 pt-0">
                    <CardDescription className="text-xs uppercase tracking-wide">
                      Tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-lg font-semibold">{state.tasks.length}</p>
                  </CardContent>
                </Card>
              </div>

              {state.contexts.length === 0 ? (
                <div className="mt-6 p-6 border rounded-lg bg-muted/50 text-center">
                  <Layers className="size-12 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
                  <h3 className="font-medium mb-1">Get started</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first context using the sidebar to organize your
                    work.
                  </p>
                </div>
              ) : state.mode === 'definition' && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  {state.session?.status === 'suspended' ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        You have a suspended session
                      </p>
                      <div className="flex gap-2">
                        <Button size="lg" onClick={resumeSession} className="gap-2">
                          <Play className="size-4" />
                          Continue Session
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => {
                            endSession();
                            setSessionDialogOpen(true);
                          }}
                          className="gap-2"
                        >
                          <RefreshCw className="size-4" />
                          Start New
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => setSessionDialogOpen(true)}
                      className="gap-2"
                    >
                      <Play className="size-4" />
                      Start Session
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        </div>

        <SessionSetupDialog
          open={sessionDialogOpen}
          onOpenChange={setSessionDialogOpen}
        />
      </AppShell>
    </>
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
