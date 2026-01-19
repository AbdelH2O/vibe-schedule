/**
 * LocalStorage DataProvider Contract
 * Feature: 009-data-export-import
 *
 * This is the contract for the localStorage implementation of DataProvider.
 * Implementation will go in lib/dataProvider.ts
 */

import type {
  DataProvider,
  DataCategory,
  ExportPackage,
  ImportMode,
  ImportResult,
  DataSummary,
} from './types';
import type { AppState } from '../../../lib/types';

/**
 * LocalStorage implementation of DataProvider.
 *
 * Responsibilities:
 * - Wraps existing lib/storage.ts functions
 * - Implements export package creation
 * - Implements import with validation and migration
 * - Manages last export date tracking
 *
 * Usage:
 * ```typescript
 * import { localStorageProvider } from '@/lib/dataProvider';
 *
 * // Export all data
 * const pkg = await localStorageProvider.createExport(['contexts', 'tasks']);
 * downloadAsJson(pkg, 'backup.json');
 *
 * // Import data
 * const file = await readJsonFile(selectedFile);
 * const pkg = localStorageProvider.validateExportPackage(file);
 * if (pkg) {
 *   const result = await localStorageProvider.applyImport(pkg, 'replace');
 *   if (result.success) {
 *     // refresh UI
 *   }
 * }
 * ```
 */
export interface LocalStorageDataProvider extends DataProvider {
  readonly id: 'localStorage';
  readonly name: 'Local Storage';
}

/**
 * Expected function signatures for the implementation module.
 */
export interface DataProviderModule {
  /** Singleton instance */
  localStorageProvider: LocalStorageDataProvider;

  /**
   * Download export package as JSON file.
   * Triggers browser download dialog.
   */
  downloadExport(pkg: ExportPackage, filename?: string): void;

  /**
   * Read JSON file from File input.
   * Returns parsed object or throws on invalid JSON.
   */
  readJsonFile(file: File): Promise<unknown>;

  /**
   * Check if export package needs migration.
   */
  needsMigration(pkg: ExportPackage): boolean;

  /**
   * Migrate export package to current format version.
   * Returns migrated package or null if migration impossible.
   */
  migrateExportPackage(pkg: ExportPackage): ExportPackage | null;
}
