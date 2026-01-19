/**
 * Version migration framework for export packages
 * Handles upgrading data from older export format versions
 */

import { ExportPackage, EXPORT_FORMAT_VERSION } from './types';

/**
 * Current version as a semver tuple for comparison
 */
const CURRENT_VERSION_PARTS = EXPORT_FORMAT_VERSION.split('.').map(Number);

/**
 * Parse a semver string into a tuple [major, minor, patch]
 */
function parseVersion(version: string): [number, number, number] {
  const parts = version.split('.').map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

/**
 * Compare two versions: returns -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const [aMajor, aMinor, aPatch] = parseVersion(a);
  const [bMajor, bMinor, bPatch] = parseVersion(b);

  if (aMajor !== bMajor) return aMajor < bMajor ? -1 : 1;
  if (aMinor !== bMinor) return aMinor < bMinor ? -1 : 1;
  if (aPatch !== bPatch) return aPatch < bPatch ? -1 : 1;
  return 0;
}

/**
 * Check if an export package needs migration to current version
 */
export function needsMigration(pkg: ExportPackage): boolean {
  return compareVersions(pkg.meta.version, EXPORT_FORMAT_VERSION) < 0;
}

/**
 * Check if an export package is from a future version (incompatible)
 */
export function isFutureVersion(pkg: ExportPackage): boolean {
  return compareVersions(pkg.meta.version, EXPORT_FORMAT_VERSION) > 0;
}

/**
 * Registry of migration functions.
 * Key format: "fromVersion_to_toVersion"
 * Each function transforms an ExportPackage from one version to the next.
 */
type MigrationFn = (pkg: ExportPackage) => ExportPackage;

const migrations: Record<string, MigrationFn> = {
  // Example: Migration from 1.0.0 to 1.1.0 (placeholder for future use)
  // '1.0.0_to_1.1.0': (pkg) => {
  //   // Add new field with default value
  //   return {
  //     ...pkg,
  //     meta: { ...pkg.meta, version: '1.1.0' },
  //     data: {
  //       ...pkg.data,
  //       // Add migration logic here
  //     },
  //   };
  // },
};

/**
 * Get the next version in the migration chain
 */
function getNextVersion(currentVersion: string): string | null {
  // Find all migrations that start from this version
  const migrationKey = Object.keys(migrations).find((key) =>
    key.startsWith(`${currentVersion}_to_`)
  );

  if (!migrationKey) {
    return null;
  }

  // Extract the target version from the key
  const match = migrationKey.match(/_to_(.+)$/);
  return match ? match[1] : null;
}

/**
 * Migrate an export package to the current format version.
 * Applies sequential migrations from the package's version to EXPORT_FORMAT_VERSION.
 * Returns null if migration is not possible (e.g., future version or no migration path).
 */
export function migrateExportPackage(pkg: ExportPackage): ExportPackage | null {
  // Check if already at current version
  if (compareVersions(pkg.meta.version, EXPORT_FORMAT_VERSION) === 0) {
    return pkg;
  }

  // Check if from future version (incompatible)
  if (isFutureVersion(pkg)) {
    return null;
  }

  // Apply sequential migrations
  let current = { ...pkg };

  while (compareVersions(current.meta.version, EXPORT_FORMAT_VERSION) < 0) {
    const nextVersion = getNextVersion(current.meta.version);

    if (!nextVersion) {
      // No migration path available, but version is older
      // This means we're at 1.0.0 with no migrations yet, which is fine
      // Just update the version number
      return {
        ...current,
        meta: { ...current.meta, version: EXPORT_FORMAT_VERSION },
      };
    }

    const migrationKey = `${current.meta.version}_to_${nextVersion}`;
    const migration = migrations[migrationKey];

    if (!migration) {
      // Migration function not found - this shouldn't happen if getNextVersion worked
      return null;
    }

    current = migration(current);
  }

  return current;
}

/**
 * Get list of all supported versions (versions we can migrate from)
 */
export function getSupportedVersions(): string[] {
  // For now, we support 1.0.0 (current) only
  // As we add migrations, this list will grow
  return [EXPORT_FORMAT_VERSION];
}
