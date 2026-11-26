import { describe, expect, it } from 'vitest';
import { e1rm, personalRecords, prDates, sessionMetrics } from './metrics';

describe('metrics', () => {
  it('e1rm nach Epley', () => {
    expect(e1rm(100, 1)).toBe(100);
    expect(e1rm(100, 10)).toBe(133.3);
    expect(e1rm(0, 10)).toBe(0);
  });

  it('sessionMetrics aggregiert', () => {
    const m = sessionMetrics(1, [
      { weightKg: 50, reps: 10 },
      { weightKg: 55, reps: 6 },
    ]);
    expect(m.topWeight).toBe(55);
    expect(m.volume).toBe(830);
    expect(m.totalReps).toBe(16);
    expect(m.bestE1rm).toBe(66.7);
  });

  it('PRs und PR-Daten', () => {
    const series = [
      sessionMetrics(1, [{ weightKg: 50, reps: 8 }]),
      sessionMetrics(2, [{ weightKg: 55, reps: 8 }]),
      sessionMetrics(3, [{ weightKg: 52.5, reps: 8 }]),
    ];
    expect(personalRecords(series, ['topWeight'])).toEqual([{ key: 'topWeight', value: 55, date: 2 }]);
    expect([...prDates(series, 'topWeight')]).toEqual([2]);
  });
});
