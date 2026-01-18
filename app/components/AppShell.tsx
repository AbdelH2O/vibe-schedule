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
  isInboxSelected?: boolean;
  onSelectInbox?: () => void;
  isHomeSelected?: boolean;
  onSelectHome?: () => void;
}

export function AppShell({
  children,
  headerRightContent,
  selectedContextId,
  onSelectContext,
  isInboxSelected,
  onSelectInbox,
  isHomeSelected,
  onSelectHome,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectContext = (contextId: string) => {
    onSelectContext?.(contextId);
    // Close mobile sidebar when context is selected
    setSidebarOpen(false);
  };

  const handleSelectInbox = () => {
    onSelectInbox?.();
    // Close mobile sidebar when inbox is selected
    setSidebarOpen(false);
  };

  const handleSelectHome = () => {
    onSelectHome?.();
    // Close mobile sidebar when home is selected
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        rightContent={headerRightContent}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside aria-label="Main navigation" className="hidden lg:flex w-64 border-r bg-background">
          <nav className="flex-1">
            <SidebarContent
              className="flex-1"
              selectedContextId={selectedContextId}
              onSelectContext={handleSelectContext}
              isInboxSelected={isInboxSelected}
              onSelectInbox={handleSelectInbox}
              isHomeSelected={isHomeSelected}
              onSelectHome={handleSelectHome}
            />
          </nav>
        </aside>

        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <MobileSidebarClose onClose={() => setSidebarOpen(false)} />
            <SidebarContent
              selectedContextId={selectedContextId}
              onSelectContext={handleSelectContext}
              isInboxSelected={isInboxSelected}
              onSelectInbox={handleSelectInbox}
              isHomeSelected={isHomeSelected}
              onSelectHome={handleSelectHome}
            />
          </SheetContent>
        </Sheet>

        {/* Main content - with transition for mode changes */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 transition-all duration-300 ease-out">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
