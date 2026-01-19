/**
 * UI Component Contracts
 * Feature: 009-data-export-import
 *
 * Props interfaces for new UI components.
 */

import type { DataCategory, ImportMode, ImportResult, DataSummary } from './types';

// ============================================
// DataManagement Component
// ============================================

/**
 * Props for the main Data Management panel.
 * Displayed in a dialog/modal from settings.
 */
export interface DataManagementProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
}

/**
 * Internal state for DataManagement component.
 */
export interface DataManagementState {
  /** Current tab/view */
  activeTab: 'export' | 'import' | 'summary';
  /** Loading state for async operations */
  isLoading: boolean;
  /** Error message to display */
  error: string | null;
}

// ============================================
// Export Panel
// ============================================

/**
 * Props for the Export panel within Data Management.
 */
export interface ExportPanelProps {
  /** Current data summary for display */
  summary: DataSummary;
  /** Callback when export completes */
  onExportComplete: () => void;
}

/**
 * State for export category selection.
 */
export interface ExportSelectionState {
  /** Selected categories (checkboxes) */
  selectedCategories: Set<DataCategory>;
  /** Whether export is in progress */
  isExporting: boolean;
}

// ============================================
// Import Panel
// ============================================

/**
 * Props for the Import panel within Data Management.
 */
export interface ImportPanelProps {
  /** Callback when import completes */
  onImportComplete: (result: ImportResult) => void;
}

/**
 * State for import flow.
 */
export interface ImportState {
  /** Current step in import flow */
  step: 'select-file' | 'preview' | 'confirm' | 'importing' | 'complete';
  /** Selected file (if any) */
  selectedFile: File | null;
  /** Parsed and validated package (if valid) */
  validatedPackage: import('./types').ExportPackage | null;
  /** Validation error (if invalid) */
  validationError: string | null;
  /** Selected import mode */
  mode: ImportMode;
  /** Import result (after completion) */
  result: ImportResult | null;
}

// ============================================
// Summary Panel
// ============================================

/**
 * Props for the Data Summary panel within Data Management.
 */
export interface SummaryPanelProps {
  /** Current data summary */
  summary: DataSummary;
  /** Callback to refresh summary */
  onRefresh: () => void;
}

// ============================================
// Confirmation Dialog
// ============================================

/**
 * Props for import confirmation dialog.
 */
export interface ImportConfirmDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Import mode being confirmed */
  mode: ImportMode;
  /** Package being imported (for displaying counts) */
  package: import('./types').ExportPackage;
  /** Whether there is existing data that will be affected */
  hasExistingData: boolean;
  /** Callback for confirm action */
  onConfirm: () => void;
  /** Callback for cancel action */
  onCancel: () => void;
}

// ============================================
// File Picker Button
// ============================================

/**
 * Props for reusable file picker button.
 */
export interface FilePickerButtonProps {
  /** Button label */
  label: string;
  /** Accepted file types (e.g., ".json,application/json") */
  accept: string;
  /** Callback when file is selected */
  onFileSelected: (file: File) => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary';
}
