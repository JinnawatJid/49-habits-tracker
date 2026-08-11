import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchSupabaseData, pushSupabaseData, subscribeSupabaseRealtime } from './syncEngine';
import { supabase } from './supabaseClient';

// Mock the supabase client module
vi.mock('./supabaseClient', () => {
  const mockSupabase = {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  };
  return {
    supabase: mockSupabase,
  };
});

describe('syncEngine', () => {
  let consoleLogSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    // Clear all mock call histories/implementation state
    vi.clearAllMocks();
    // Spy on console.log and suppress actual console output during tests
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('fetchSupabaseData', () => {
    it('returns null if syncCode is falsy', async () => {
      const result = await fetchSupabaseData('');
      expect(result).toBeNull();
    });

    it('returns formatted data on successful fetch', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          active_habit: {
            currentLevel: 3,
            activeCheckIns: ['2026-10-24'],
            masteredLevels: [1, 2],
            theme: 'dark',
            goldTransactions: [{ id: 1 }]
          }
        },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      supabase.from.mockReturnValue({ select: mockSelect });

      const result = await fetchSupabaseData('TEST-CODE');

      expect(supabase.from).toHaveBeenCalledWith('user_habits');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('sync_code', 'TEST-CODE');
      expect(result).toEqual({
        currentLevel: 3,
        activeCheckIns: ['2026-10-24'],
        masteredLevels: [1, 2],
        theme: 'dark',
        goldTransactions: [{ id: 1 }]
      });
    });

    it('returns default fallback values if fields in active_habit are missing or incorrect types', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          active_habit: {
            currentLevel: null,
            activeCheckIns: null,
            masteredLevels: 'not-an-array',
            theme: null,
            goldTransactions: null
          }
        },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      supabase.from.mockReturnValue({ select: mockSelect });

      const result = await fetchSupabaseData('TEST-CODE');

      expect(result).toEqual({
        currentLevel: 1,
        activeCheckIns: [],
        masteredLevels: [],
        theme: 'light',
        goldTransactions: []
      });
    });

    it('returns null and logs message if Supabase returns an error', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch' },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      supabase.from.mockReturnValue({ select: mockSelect });

      const result = await fetchSupabaseData('TEST-CODE');

      expect(result).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('Supabase fetch notice:', 'Failed to fetch');
    });

    it('returns null and logs exception if a promise rejection/throw occurs', async () => {
      const mockSingle = vi.fn().mockRejectedValue(new Error('Network Error'));
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      supabase.from.mockReturnValue({ select: mockSelect });

      const result = await fetchSupabaseData('TEST-CODE');

      expect(result).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('Supabase fetch exception:', expect.any(Error));
    });
  });

  describe('pushSupabaseData', () => {
    it('returns early if syncCode is falsy', async () => {
      await pushSupabaseData('', {});
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('calls upsert with correct payload format and theme defaults', async () => {
      const mockDate = new Date('2026-10-24T12:00:00.000Z');
      vi.setSystemTime(mockDate);

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      supabase.from.mockReturnValue({ upsert: mockUpsert });

      const payload = {
        currentLevel: 5,
        activeCheckIns: ['2026-10-24'],
        masteredLevels: [1, 2, 3, 4],
        goldTransactions: [{ amount: 10 }]
      };

      await pushSupabaseData('TEST-CODE', payload);

      expect(supabase.from).toHaveBeenCalledWith('user_habits');
      expect(mockUpsert).toHaveBeenCalledWith({
        sync_code: 'TEST-CODE',
        active_habit: {
          currentLevel: 5,
          activeCheckIns: ['2026-10-24'],
          masteredLevels: [1, 2, 3, 4],
          theme: 'light', // defaulted
          goldTransactions: [{ amount: 10 }]
        },
        updated_at: mockDate.toISOString()
      }, { onConflict: 'sync_code' });
    });

    it('logs notice if Supabase upsert returns an error', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'Database constraint failed' } });
      supabase.from.mockReturnValue({ upsert: mockUpsert });

      await pushSupabaseData('TEST-CODE', {});

      expect(consoleLogSpy).toHaveBeenCalledWith('Supabase upsert notice:', 'Database constraint failed');
    });

    it('logs exception in try/catch if an exception is thrown during upsert', async () => {
      const mockError = new Error('Database connection lost');
      const mockUpsert = vi.fn().mockRejectedValue(mockError);
      supabase.from.mockReturnValue({ upsert: mockUpsert });

      await pushSupabaseData('TEST-CODE', {});

      expect(consoleLogSpy).toHaveBeenCalledWith('Supabase push exception:', mockError);
    });
  });

  describe('subscribeSupabaseRealtime', () => {
    it('returns cleanup function that does nothing if syncCode is falsy', () => {
      const unsubscribe = subscribeSupabaseRealtime('', () => {});
      expect(supabase.channel).not.toHaveBeenCalled();

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
      expect(supabase.removeChannel).not.toHaveBeenCalled();
    });

    it('sets up channel, registers postgres_changes handler, and returns a cleanup function', () => {
      const onUpdateMock = vi.fn();
      let callbackHolder = null;

      const mockChannel = {
        on: vi.fn().mockImplementation((event, filter, callback) => {
          callbackHolder = callback;
          return mockChannel;
        }),
        subscribe: vi.fn().mockImplementation(() => {
          return mockChannel;
        }),
      };

      supabase.channel.mockReturnValue(mockChannel);

      const unsubscribe = subscribeSupabaseRealtime('TEST-CODE', onUpdateMock);

      expect(supabase.channel).toHaveBeenCalledWith('realtime:user_habits:TEST-CODE');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_habits',
          filter: 'sync_code=eq.TEST-CODE'
        },
        expect.any(Function)
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();

      // Ensure cleanup removes the exact channel
      unsubscribe();
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);

      // Verify the Postgres changes handler triggers onUpdate when payload is received
      expect(callbackHolder).toBeInstanceOf(Function);

      callbackHolder({
        new: {
          active_habit: {
            currentLevel: 4,
            activeCheckIns: ['2026-10-25'],
            masteredLevels: [1, 2, 3],
            theme: 'dark',
            goldTransactions: [{ id: 2 }]
          }
        }
      });

      expect(onUpdateMock).toHaveBeenCalledWith({
        currentLevel: 4,
        activeCheckIns: ['2026-10-25'],
        masteredLevels: [1, 2, 3],
        theme: 'dark',
        goldTransactions: [{ id: 2 }]
      });
    });

    it('handles payload with default fallback values if active_habit is missing fields', () => {
      const onUpdateMock = vi.fn();
      let callbackHolder = null;

      const mockChannel = {
        on: vi.fn().mockImplementation((event, filter, callback) => {
          callbackHolder = callback;
          return mockChannel;
        }),
        subscribe: vi.fn().mockImplementation(() => {
          return mockChannel;
        }),
      };

      supabase.channel.mockReturnValue(mockChannel);

      subscribeSupabaseRealtime('TEST-CODE', onUpdateMock);

      callbackHolder({
        new: {
          active_habit: {}
        }
      });

      expect(onUpdateMock).toHaveBeenCalledWith({
        currentLevel: 1,
        activeCheckIns: [],
        masteredLevels: [],
        theme: 'light',
        goldTransactions: []
      });
    });
  });
});
