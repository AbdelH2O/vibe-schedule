'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Upload, AlertTriangle, Check, X } from 'lucide-react';
import { FilePickerButton } from '@/app/components/common/FilePickerButton';
import { localStorageProvider } from '@/lib/dataProvider';
import { readJsonFile, getCategoryLabel } from '@/lib/exportImport';
import type { ExportPackage, ImportMode, ImportResult } from '@/lib/types';

export interface ImportPanelProps {
  /** Callback when import completes */
  onImportComplete?: (result: ImportResult) => void;
}

type ImportStep = 'select-file' | 'preview' | 'importing' | 'complete';

export function ImportPanel({ onImportComplete }: ImportPanelProps) {
  const [step, setStep] = useState<ImportStep>('select-file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validatedPackage, setValidatedPackage] = useState<ExportPackage | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>('replace');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setValidationError(null);
    setValidatedPackage(null);

    try {
      const data = await readJsonFile(file);
      const validated = localStorageProvider.validateExportPackage(data);

      if (!validated) {
        setValidationError('Invalid export file format. Please select a valid Vibe-Schedule export file.');
        return;
      }

      setValidatedPackage(validated);
      setStep('preview');
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : 'Failed to read file'
      );
    }
  };

  const handleImportClick = () => {
    if (mode === 'replace') {
      setShowConfirmDialog(true);
    } else {
      performImport();
    }
  };

  const performImport = async () => {
    if (!validatedPackage) return;

    setStep('importing');
    setShowConfirmDialog(false);

    try {
      const importResult = await localStorageProvider.applyImport(validatedPackage, mode);
      setResult(importResult);
      setStep('complete');
      onImportComplete?.(importResult);
    } catch (error) {
      setResult({
        success: false,
        mode,
        counts: {
          contextsImported: 0,
          tasksImported: 0,
          remindersImported: 0,
          presetsImported: 0,
          skipped: 0,
          renamed: 0,
          orphaned: 0,
        },
        warnings: [],
        error: error instanceof Error ? error.message : 'Import failed',
      });
      setStep('complete');
    }
  };

  const handleReset = () => {
    setStep('select-file');
    setSelectedFile(null);
    setValidatedPackage(null);
    setValidationError(null);
    setResult(null);
  };

  // Step 1: Select File
  if (step === 'select-file') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select a previously exported Vibe-Schedule data file to restore your data.
        </p>

        <FilePickerButton
          label="Select Export File"
          accept=".json,application/json"
          onFileSelected={handleFileSelected}
          className="w-full"
        />

        {validationError && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{validationError}</p>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Preview & Configure
  if (step === 'preview' && validatedPackage) {
    return (
      <div className="space-y-4">
        {/* File Info */}
        <div className="rounded-md border p-3 bg-muted/50">
          <p className="text-sm font-medium mb-2">Selected file: {selectedFile?.name}</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Exported: {new Date(validatedPackage.meta.exportedAt).toLocaleString()}</p>
            <p>Version: {validatedPackage.meta.version}</p>
          </div>
        </div>

        {/* Data Summary */}
        <div className="rounded-md border p-3">
          <p className="text-sm font-medium mb-2">Data to import:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {validatedPackage.meta.categories.map((category) => (
              <span key={category}>
                {getCategoryLabel(category)}: {getCountForCategory(validatedPackage, category)}
              </span>
            ))}
          </div>
        </div>

        {/* Import Mode Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Import mode:</Label>
          <RadioGroup
            value={mode}
            onValueChange={(value) => setMode(value as ImportMode)}
            className="space-y-2"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="replace" id="mode-replace" className="mt-1" />
              <div>
                <Label htmlFor="mode-replace" className="font-normal cursor-pointer">
                  Replace all data
                </Label>
                <p className="text-xs text-muted-foreground">
                  Clear existing data and restore from file
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="merge" id="mode-merge" className="mt-1" />
              <div>
                <Label htmlFor="mode-merge" className="font-normal cursor-pointer">
                  Merge with existing
                </Label>
                <p className="text-xs text-muted-foreground">
                  Add new items, skip duplicates, keep existing data
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleImportClick} className="flex-1">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Replace all data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your current data and replace it with the
                imported data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={performImport}>
                Yes, replace all data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Step 3: Importing
  if (step === 'importing') {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">Importing data...</p>
      </div>
    );
  }

  // Step 4: Complete
  if (step === 'complete' && result) {
    return (
      <div className="space-y-4">
        {/* Result Status */}
        <div
          className={`flex items-start gap-2 p-3 rounded-md ${
            result.success
              ? 'bg-green-500/10 text-green-700 dark:text-green-400'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {result.success ? (
            <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
          ) : (
            <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium">
              {result.success ? 'Import successful!' : 'Import failed'}
            </p>
            {result.error && <p className="text-sm mt-1">{result.error}</p>}
          </div>
        </div>

        {/* Import Counts */}
        {result.success && (
          <div className="rounded-md border p-3">
            <p className="text-sm font-medium mb-2">Imported:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span>{result.counts.contextsImported} contexts</span>
              <span>{result.counts.tasksImported} tasks</span>
              <span>{result.counts.remindersImported} reminders</span>
              <span>{result.counts.presetsImported} presets</span>
            </div>
            {result.mode === 'merge' && (result.counts.skipped > 0 || result.counts.renamed > 0 || result.counts.orphaned > 0) && (
              <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                {result.counts.skipped > 0 && <p>{result.counts.skipped} items skipped (duplicates)</p>}
                {result.counts.renamed > 0 && <p>{result.counts.renamed} items renamed (name conflicts)</p>}
                {result.counts.orphaned > 0 && <p>{result.counts.orphaned} tasks moved to inbox</p>}
              </div>
            )}
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="rounded-md border p-3">
            <p className="text-sm font-medium mb-2">Notes:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {result.warnings.slice(0, 5).map((warning, i) => (
                <li key={i}>{warning.message}</li>
              ))}
              {result.warnings.length > 5 && (
                <li>...and {result.warnings.length - 5} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <Button onClick={handleReset} className="w-full">
          Import Another File
        </Button>
      </div>
    );
  }

  return null;
}

function getCountForCategory(pkg: ExportPackage, category: string): number {
  switch (category) {
    case 'contexts':
      return pkg.data.contexts?.length ?? 0;
    case 'tasks':
      return pkg.data.tasks?.length ?? 0;
    case 'reminders':
      return pkg.data.reminders?.length ?? 0;
    case 'presets':
      return pkg.data.presets?.length ?? 0;
    case 'session':
      return pkg.data.session ? 1 : 0;
    case 'preferences':
      return pkg.data.preferences ? 1 : 0;
    default:
      return 0;
  }
}
