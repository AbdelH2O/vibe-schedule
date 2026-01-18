'use client';

import { useState, ReactNode } from 'react';
import { Header } from './Header';
import { SidebarContent, MobileSidebarClose } from './Sidebar';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';

interface AppShellProps {
  children: ReactNode;
  headerRightContent?: ReactNode;
  selectedContextId?: string | null;
  onSelectContext?: (contextId: string) => void;
}

export function AppShell({
  children,
  headerRightContent,
  selectedContextId,
  onSelectContext,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectContext = (contextId: string) => {
    onSelectContext?.(contextId);
    // Close mobile sidebar when context is selected
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        rightContent={headerRightContent}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-background">
          <SidebarContent
            selectedContextId={selectedContextId}
            onSelectContext={handleSelectContext}
          />
        </aside>

        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <MobileSidebarClose onClose={() => setSidebarOpen(false)} />
            <SidebarContent
              selectedContextId={selectedContextId}
              onSelectContext={handleSelectContext}
            />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
