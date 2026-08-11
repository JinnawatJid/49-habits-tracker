import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getTodayISO, getPolishedHeaderDate } from './dateHelpers';

describe('dateHelpers', () => {
  beforeEach(() => {
    // Setup fake timer system to mock system clock
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore the system clock
    vi.useRealTimers();
  });

  describe('getTodayISO', () => {
    it('returns date formatted as YYYY-MM-DD for standard dates', () => {
      // Mock specific date: October 24, 2026
      const date = new Date(2026, 9, 24); // 9 represents October (0-indexed)
      vi.setSystemTime(date);

      const result = getTodayISO();
      expect(result).toBe('2026-10-24');
    });

    it('correctly pads single-digit months and days', () => {
      // Mock specific date: January 5, 2026
      const date = new Date(2026, 0, 5); // 0 represents January
      vi.setSystemTime(date);

      const result = getTodayISO();
      expect(result).toBe('2026-01-05');
    });

    it('handles transition boundaries like leap year (Feb 29)', () => {
      // Mock leap day: Feb 29, 2028
      const date = new Date(2028, 1, 29); // 1 represents February
      vi.setSystemTime(date);

      const result = getTodayISO();
      expect(result).toBe('2028-02-29');
    });

    it('handles December 31 boundary', () => {
      // Mock specific date: December 31, 2026
      const date = new Date(2026, 11, 31); // 11 represents December
      vi.setSystemTime(date);

      const result = getTodayISO();
      expect(result).toBe('2026-12-31');
    });
  });

  describe('getPolishedHeaderDate', () => {
    it('returns correctly formatted date in US locale style', () => {
      // Mock specific date: Tuesday, May 12, 2026
      const date = new Date(2026, 4, 12); // 4 represents May
      vi.setSystemTime(date);

      const result = getPolishedHeaderDate();
      // Expect "Tuesday, May 12" format
      expect(result).toBe('Tuesday, May 12');
    });

    it('returns correctly formatted date for single digit day', () => {
      // Mock specific date: Monday, Jan 5, 2026
      const date = new Date(2026, 0, 5); // 0 represents January
      vi.setSystemTime(date);

      const result = getPolishedHeaderDate();
      // Expect "Monday, Jan 5" format
      expect(result).toBe('Monday, Jan 5');
    });
  });
});
