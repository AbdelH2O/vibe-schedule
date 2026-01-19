'use client';

import { useState, useEffect } from 'react';
import { HardDrive, Clock, Database, CheckCircle2 } from 'lucide-react';
import { localStorageProvider } from '@/lib/dataProvider';
import { formatBytes, formatRelativeTime } from '@/lib/exportImport';
import type { DataSummary } from '@/lib/types';

export function SummaryPanel() {
  const [summary, setSummary] = useState<DataSummary | null>(null);

  useEffect(() => {
    setSummary(localStorageProvider.getDataSummary());
  }, []);

  if (!summary) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Data Counts */}
      <div className="rounded-md border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Your Data</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="Contexts" value={summary.counts.contexts} />
          <StatItem label="Tasks" value={summary.counts.tasks} />
          <StatItem label="Reminders" value={summary.counts.reminders} />
          <StatItem label="Presets" value={summary.counts.presets} />
        </div>
        {summary.counts.completedTasks > 0 && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            <span>{summary.counts.completedTasks} completed tasks</span>
          </div>
        )}
      </div>

      {/* Storage Usage */}
      <div className="rounded-md border p-4">
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Storage</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Used</span>
            <span className="font-medium">{formatBytes(summary.storageUsedBytes)}</span>
          </div>
          <StorageBar usedBytes={summary.storageUsedBytes} />
          <p className="text-xs text-muted-foreground">
            Local storage capacity varies by browser (typically 5-10 MB)
          </p>
        </div>
      </div>

      {/* Last Export */}
      <div className="rounded-md border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Backup Status</h3>
        </div>
        {summary.lastExportedAt ? (
          <div className="space-y-1">
            <p className="text-sm">
              Last backup: <span className="font-medium">{formatRelativeTime(summary.lastExportedAt)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(summary.lastExportedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No backups yet. Export your data to create a backup.
          </p>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function StorageBar({ usedBytes }: { usedBytes: number }) {
  // Assume 5MB typical localStorage limit for visualization
  const maxBytes = 5 * 1024 * 1024;
  const percentage = Math.min((usedBytes / maxBytes) * 100, 100);

  let colorClass = 'bg-primary';
  if (percentage > 80) {
    colorClass = 'bg-destructive';
  } else if (percentage > 60) {
    colorClass = 'bg-yellow-500';
  }

  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${colorClass}`}
        style={{ width: `${Math.max(percentage, 1)}%` }}
      />
    </div>
  );
}
