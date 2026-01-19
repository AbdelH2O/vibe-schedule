'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Download, Upload } from 'lucide-react';
import { ExportPanel } from './ExportPanel';
import { ImportPanel } from './ImportPanel';
import { SummaryPanel } from './SummaryPanel';

export interface DataManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataManagement({ open, onOpenChange }: DataManagementProps) {
  const [activeTab, setActiveTab] = useState('summary');
  // Key to force re-render of panels after import
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImportComplete = () => {
    // Refresh summary after import
    setRefreshKey((k) => k + 1);
    setActiveTab('summary');
  };

  const handleExportComplete = () => {
    // Refresh summary to show updated last export date
    setRefreshKey((k) => k + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </DialogTitle>
          <DialogDescription>
            Export your data for backup, or import from a previous export.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2 flex-1 flex flex-col min-h-0">
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="summary" className="flex-1">
              <Database className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex-1">
              <Download className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex-1">
              <Upload className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Import</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="summary" className="mt-0">
              <SummaryPanel key={refreshKey} />
            </TabsContent>

            <TabsContent value="export" className="mt-0">
              <ExportPanel onExportComplete={handleExportComplete} />
            </TabsContent>

            <TabsContent value="import" className="mt-0">
              <ImportPanel onImportComplete={handleImportComplete} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
