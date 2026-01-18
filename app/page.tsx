'use client';

import { useState } from 'react';
import { ClientProvider } from './components/ClientProvider';
import { AppShell } from './components/AppShell';
import { ModeIndicator } from './components/ModeIndicator';
import { ContextDetail } from './components/contexts/ContextDetail';
import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Layers } from 'lucide-react';

function HomeContent() {
  const { state, getContextById } = useStore();
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);

  const selectedContext = selectedContextId
    ? getContextById(selectedContextId)
    : undefined;

  return (
    <AppShell
      headerRightContent={<ModeIndicator />}
      selectedContextId={selectedContextId}
      onSelectContext={setSelectedContextId}
    >
      <div className="max-w-4xl mx-auto">
        {selectedContext ? (
          <ContextDetail
            context={selectedContext}
            onDeleted={() => setSelectedContextId(null)}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {state.contexts.length === 0 && (
                <div className="mt-6 p-6 border rounded-lg bg-muted/50 text-center">
                  <Layers className="size-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-medium mb-1">Get started</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first context using the sidebar to organize your
                    work.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

export default function Home() {
  return (
    <ClientProvider>
      <HomeContent />
    </ClientProvider>
  );
}
