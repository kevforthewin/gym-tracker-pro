import { describe, expect, it } from 'vitest';
import { applyDeload, isDeloadWeek, nextDeloadWeek } from './deload';
import { weekStart } from './insights';

const W = 7 * 86400000;
const start = new Date(2026, 9, 5, 12).getTime(); // Mo 5.10.2026

describe('Deload', () => {
  it('alle N Wochen, manuell übersteuerbar', () => {
    expect(isDeloadWeek({ every: 4, planStart: start, now: start })).toBe(false);
    expect(isDeloadWeek({ every: 4, planStart: start, now: start + 3 * W })).toBe(true); // 4. Woche
    expect(isDeloadWeek({ every: 4, planStart: start, now: start + 7 * W })).toBe(true); // 8. Woche
    expect(isDeloadWeek({ every: undefined, planStart: start, now: start + 3 * W })).toBe(false);
    const now = start + 1 * W;
    expect(isDeloadWeek({ every: 4, planStart: start, now, override: { week: weekStart(now), on: true } })).toBe(true);
    expect(isDeloadWeek({ every: 4, planStart: start, now: start + 3 * W, override: { week: weekStart(start + 3 * W), on: false } })).toBe(false);
    expect(nextDeloadWeek(4, start, start + W)).toBe(weekStart(start + 3 * W));
    expect(nextDeloadWeek(4, start, start + 3 * W)).toBe(weekStart(start + 3 * W));
  });

  it('Ziel: 3 Sätze → 2, Gewicht −10 % auf Gewichtsschritt', () => {
    const t = applyDeload({ reason: 'repeat', message: '', sets: [1, 2, 3].map(() => ({ weightKg: 52.5, reps: 10 })) }, 2.5);
    expect(t.sets).toHaveLength(2);
    expect(t.sets[0].weightKg).toBe(47.5);
    expect(t.reason).toBe('deload');
  });
});
