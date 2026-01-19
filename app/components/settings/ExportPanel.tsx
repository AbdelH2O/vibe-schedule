'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Check } from 'lucide-react';
import { localStorageProvider } from '@/lib/dataProvider';
import { downloadExport, getCategoryLabel } from '@/lib/exportImport';
import type { DataCategory, DataSummary } from '@/lib/types';
import { ALL_DATA_CATEGORIES } from '@/lib/types';

export interface ExportPanelProps {
  /** Callback when export completes */
  onExportComplete?: () => void;
}

export function ExportPanel({ onExportComplete }: ExportPanelProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<DataCategory>>(
    new Set(ALL_DATA_CATEGORIES)
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [summary, setSummary] = useState<DataSummary | null>(null);

  // Load data summary on mount
  useEffect(() => {
    setSummary(localStorageProvider.getDataSummary());
  }, []);

  const handleCategoryToggle = (category: DataCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
    setExportSuccess(false);
  };

  const handleSelectAll = () => {
    setSelectedCategories(new Set(ALL_DATA_CATEGORIES));
    setExportSuccess(false);
  };

  const handleSelectNone = () => {
    setSelectedCategories(new Set());
    setExportSuccess(false);
  };

  const handleExport = async () => {
    if (selectedCategories.size === 0) return;

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const categories = Array.from(selectedCategories);
      const pkg = await localStorageProvider.createExport(categories);
      downloadExport(pkg);

      // Update last export date
      localStorageProvider.setLastExportDate(new Date().toISOString());

      setExportSuccess(true);
      onExportComplete?.();

      // Refresh summary to show updated last export date
      setSummary(localStorageProvider.getDataSummary());
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getCategoryCount = (category: DataCategory): number => {
    if (!summary) return 0;
    switch (category) {
      case 'contexts':
        return summary.counts.contexts;
      case 'tasks':
        return summary.counts.tasks;
      case 'reminders':
        return summary.counts.reminders;
      case 'presets':
        return summary.counts.presets;
      case 'session':
        return summary.counts.activeSession ? 1 : 0;
      case 'preferences':
        return 1; // Always has preferences
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      {/* Data Summary */}
      {summary && (
        <div className="rounded-md border p-3 bg-muted/50">
          <p className="text-sm text-muted-foreground mb-2">Your data includes:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span>{summary.counts.contexts} contexts</span>
            <span>{summary.counts.tasks} tasks</span>
            <span>{summary.counts.reminders} reminders</span>
            <span>{summary.counts.presets} presets</span>
          </div>
        </div>
      )}

      {/* Category Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Select data to export:</Label>
          <div className="space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleSelectAll}
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleSelectNone}
            >
              None
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ALL_DATA_CATEGORIES.map((category) => {
            const count = getCategoryCount(category);
            return (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`export-${category}`}
                  checked={selectedCategories.has(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label
                  htmlFor={`export-${category}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getCategoryLabel(category)}{' '}
                  <span className="text-muted-foreground">({count})</span>
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleExport}
          disabled={selectedCategories.size === 0 || isExporting}
          className="flex-1"
        >
          {isExporting ? (
            <>Exporting...</>
          ) : exportSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Exported
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </div>

      {selectedCategories.size === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Select at least one category to export
        </p>
      )}
    </div>
  );
}
