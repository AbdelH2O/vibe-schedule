import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadState, saveState, clearState, generateId, now } from '../storage';
import { INITIAL_STATE } from '../types';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('Storage Utilities', () => {
  beforeEach(() => {
    // Clear localStorage mock between tests
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('loadState', () => {
    it('should return INITIAL_STATE when no stored data', () => {
      const state = loadState();
      expect(state).toEqual(INITIAL_STATE);
    });

    it('should parse and return stored state', () => {
      const mockState = {
        ...INITIAL_STATE,
        contexts: [{ id: 'ctx-1', name: 'Test', priority: 1, color: 'blue', weight: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' }],
        tasks: [],
        mode: 'definition',
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      const state = loadState();
      expect(state.contexts).toHaveLength(1);
      expect(state.contexts[0].name).toBe('Test');
    });

    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem('vibe-schedule-state', 'not-valid-json{{{');

      const state = loadState();
      expect(state).toEqual(INITIAL_STATE);
    });

    it('should auto-suspend active sessions on load', () => {
      const mockState = {
        ...INITIAL_STATE,
        mode: 'working',
        session: {
          id: 'session-1',
          status: 'active',
          totalDuration: 60,
          startedAt: '2026-01-25T10:00:00Z',
          allocations: [],
          activeContextId: null,
          contextStartedAt: '2026-01-25T10:00:00Z',
        },
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      const state = loadState();
      expect(state.session?.status).toBe('suspended');
      expect(state.mode).toBe('definition');
      expect(state.session?.contextStartedAt).toBeNull();
    });

    it('should auto-suspend paused sessions on load', () => {
      const mockState = {
        ...INITIAL_STATE,
        mode: 'working',
        session: {
          id: 'session-1',
          status: 'paused',
          totalDuration: 60,
          startedAt: '2026-01-25T10:00:00Z',
          allocations: [],
          activeContextId: null,
          contextStartedAt: null,
        },
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      const state = loadState();
      expect(state.session?.status).toBe('suspended');
      expect(state.mode).toBe('definition');
    });

    it('should migrate contexts without color', () => {
      const mockState = {
        ...INITIAL_STATE,
        contexts: [
          { id: 'ctx-1', name: 'No Color', priority: 1, weight: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
        ],
        tasks: [],
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      const state = loadState();
      expect(state.contexts[0].color).toBeDefined();
    });

    it('should migrate tasks without position', () => {
      const mockState = {
        ...INITIAL_STATE,
        contexts: [],
        tasks: [
          { id: 't1', title: 'Task 1', contextId: null, completed: false, createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01' },
          { id: 't2', title: 'Task 2', contextId: null, completed: false, createdAt: '2026-01-01T11:00:00Z', updatedAt: '2026-01-01' },
        ],
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      const state = loadState();
      expect(state.tasks[0].position).toBeDefined();
      expect(state.tasks[1].position).toBeDefined();
      // Positions should be ordered by createdAt
      expect(state.tasks[0].position.localeCompare(state.tasks[1].position)).toBeLessThan(0);
    });

    it('should initialize missing arrays to empty arrays', () => {
      const mockState = {
        mode: 'definition',
      };
      localStorage.setItem('vibe-schedule-state', JSON.stringify(mockState));

      const state = loadState();
      expect(Array.isArray(state.contexts)).toBe(true);
      expect(Array.isArray(state.tasks)).toBe(true);
      expect(Array.isArray(state.presets)).toBe(true);
      expect(Array.isArray(state.reminders)).toBe(true);
    });
  });

  describe('saveState', () => {
    it('should serialize and save state to localStorage', () => {
      saveState(INITIAL_STATE);

      const stored = localStorage.getItem('vibe-schedule-state');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.mode).toBe('definition');
    });

    it('should handle save failures gracefully', () => {
      // Force an error by making setItem throw
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw
      expect(() => saveState(INITIAL_STATE)).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('clearState', () => {
    it('should remove state from localStorage', () => {
      localStorage.setItem('vibe-schedule-state', JSON.stringify(INITIAL_STATE));

      clearState();

      expect(localStorage.getItem('vibe-schedule-state')).toBeNull();
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const ids = new Set([generateId(), generateId(), generateId()]);
      expect(ids.size).toBe(3);
    });

    it('should generate string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate valid UUID format', () => {
      const id = generateId();
      // Our test mock generates test-uuid-N format
      expect(id).toMatch(/^test-uuid-\d+$/);
    });
  });

  describe('now', () => {
    it('should return ISO timestamp string', () => {
      const timestamp = now();
      expect(typeof timestamp).toBe('string');
      expect(() => new Date(timestamp)).not.toThrow();
    });

    it('should match ISO 8601 format', () => {
      const timestamp = now();
      // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return current time', () => {
      const before = Date.now();
      const timestamp = now();
      const after = Date.now();

      const parsed = new Date(timestamp).getTime();
      expect(parsed).toBeGreaterThanOrEqual(before);
      expect(parsed).toBeLessThanOrEqual(after);
    });
  });
});
