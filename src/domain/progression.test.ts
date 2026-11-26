import { describe, expect, it } from 'vitest';
import { computeTarget, floorToIncrement, type TargetInput, type WorkSet } from './progression';

const rx = { sets: 3, repMin: 8, repMax: 12 };
const s = (weightKg: number, ...reps: number[]): WorkSet[] => reps.map((r) => ({ weightKg, reps: r }));
const base = (history: WorkSet[][], extra: Partial<TargetInput> = {}): TargetInput => ({
  type: 'weight_reps',
  prescription: rx,
  increment: 2.5,
  history: history.map((sets, i) => ({ date: i, sets })),
  ...extra,
});

describe('computeTarget – Gewicht × Reps', () => {
  it('erste Session nutzt Startgewicht und repMin', () => {
    const t = computeTarget(base([], { startWeight: 40 }));
    expect(t.reason).toBe('first');
    expect(t.sets).toEqual([
      { weightKg: 40, reps: 8 },
      { weightKg: 40, reps: 8 },
      { weightKg: 40, reps: 8 },
    ]);
  });

  it('erste Session ohne Startgewicht lässt Gewicht offen', () => {
    const t = computeTarget(base([]));
    expect(t.sets[0].weightKg).toBeUndefined();
  });

  it('steigert Gewicht, wenn alle Sätze repMax erreichen', () => {
    const t = computeTarget(base([s(40, 12, 12, 12)]));
    expect(t.reason).toBe('increase');
    expect(t.sets).toEqual(s(42.5, 8, 8, 8));
  });

  it('steigert nicht, wenn zu wenige Sätze absolviert wurden', () => {
    const t = computeTarget(base([s(40, 12, 12)]));
    expect(t.reason).toBe('repeat');
  });

  it('wiederholt Gewicht mit +1 Rep je Satz, gedeckelt bei repMax', () => {
    const t = computeTarget(base([s(40, 12, 10, 9)]));
    expect(t.reason).toBe('repeat');
    expect(t.sets).toEqual(s(40, 12, 11, 10));
  });

  it('halbe Wiederholungen werden auf ganze Ziel-Wdh. aufgerundet', () => {
    const t = computeTarget(base([s(65, 10.5, 9, 8.5)]));
    expect(t.sets.map((x) => x.reps)).toEqual([11, 10, 9]);
  });

  it('Zusatzsatz (4. Satz mit weniger Wdh.) blockiert die Steigerung nicht', () => {
    const t = computeTarget(base([s(40, 12, 12, 12, 9)]));
    expect(t.reason).toBe('increase');
    expect(t.sets).toHaveLength(3);
  });

  it('Zusatzsatz zählt nicht als Fortschritt bei der Stagnation', () => {
    const t = computeTarget(base([s(50, 10, 9, 8), s(50, 10, 9, 8, 8), s(50, 10, 9, 8)]));
    expect(t.reason).toBe('deload');
  });

  it('ignoriert leichtere Back-off-Sätze für die Bewertung', () => {
    const t = computeTarget(base([[...s(40, 12, 12, 12), ...s(30, 15)]]));
    expect(t.reason).toBe('increase');
  });

  it('Deload nach 3 Sessions ohne Fortschritt', () => {
    const t = computeTarget(base([s(50, 10, 9, 8), s(50, 10, 9, 8), s(50, 9, 9, 8)]));
    expect(t.reason).toBe('deload');
    expect(t.sets[0]).toEqual({ weightKg: 45, reps: 8 });
  });

  it('kein Deload, wenn Reps steigen', () => {
    const t = computeTarget(base([s(50, 10, 9, 8), s(50, 10, 9, 9), s(50, 10, 10, 9)]));
    expect(t.reason).toBe('repeat');
  });

  it('kein Deload, wenn Gewicht zwischendurch gewechselt hat', () => {
    const t = computeTarget(base([s(47.5, 12, 12, 12), s(50, 9, 8, 8), s(50, 9, 8, 8)]));
    expect(t.reason).toBe('repeat');
  });

  it('Deload rundet auf das Geräte-Inkrement ab', () => {
    expect(floorToIncrement(72.5 * 0.9, 5)).toBe(65);
    const t = computeTarget(base([s(20, 8, 8, 8), s(20, 8, 8, 8), s(20, 8, 8, 8)], { increment: 5 }));
    expect(t.sets[0].weightKg).toBe(15);
  });
});

describe('computeTarget – Gewichtsstufen', () => {
  const steps = [29.8, 32, 34.3, 36.6, 38.9];
  it('Steigerung springt auf die nächste echte Stufe', () => {
    const t = computeTarget(base([s(34.3, 12, 12, 12)], { steps }));
    expect(t.sets[0].weightKg).toBe(36.6);
    expect(t.message).toContain('+2,3 kg');
  });
  it('Deload auf Stufe <= 90 %', () => {
    const t = computeTarget(base([s(38.9, 9, 9, 9), s(38.9, 9, 9, 9), s(38.9, 8, 9, 9)], { steps }));
    expect(t.reason).toBe('deload');
    expect(t.sets[0].weightKg).toBe(34.3);
  });
  it('über der höchsten Stufe -> Inkrement', () => {
    const t = computeTarget(base([s(38.9, 12, 12, 12)], { steps }));
    expect(t.sets[0].weightKg).toBe(41.4);
  });
});

describe('computeTarget – Körpergewicht', () => {
  const bw = (h: WorkSet[][]) => base(h, { type: 'bodyweight', prescription: { sets: 3, repMin: 5, repMax: 10 } });

  it('erste Session ohne Zusatzgewicht', () => {
    expect(computeTarget(bw([])).sets[0]).toEqual({ weightKg: 0, reps: 5 });
  });

  it('Reps-Progression ohne Zusatzgewicht', () => {
    const t = computeTarget(bw([s(0, 7, 6, 6)]));
    expect(t.sets).toEqual(s(0, 8, 7, 7));
  });

  it('nach repMax Hinweis auf Zusatzgewicht', () => {
    const t = computeTarget(bw([s(0, 10, 10, 10)]));
    expect(t.reason).toBe('increase');
    expect(t.sets[0]).toEqual({ weightKg: 2.5, reps: 5 });
    expect(t.message).toContain('Zusatzgewicht');
  });

  it('kein Deload ohne Zusatzgewicht', () => {
    const t = computeTarget(bw([s(0, 6, 6, 6), s(0, 6, 6, 6), s(0, 6, 6, 6)]));
    expect(t.reason).toBe('repeat');
  });
});

describe('computeTarget – Zeit/Distanz', () => {
  const td = (h: WorkSet[][], p: Partial<TargetInput['prescription']> = {}) =>
    base(h, { type: 'time_distance', prescription: { sets: 1, repMin: 0, repMax: 0, ...p } });

  it('erste Session nutzt Planwerte', () => {
    const t = computeTarget(td([], { targetDurationSec: 1200, targetDistanceM: 4000 }));
    expect(t.reason).toBe('first');
    expect(t.sets[0]).toEqual({ durationSec: 1200, distanceM: 4000 });
  });

  it('Distanz +5 % bei gleicher Zeit', () => {
    const t = computeTarget(td([[{ durationSec: 1200, distanceM: 4000 }]]));
    expect(t.sets[0]).toEqual({ durationSec: 1200, distanceM: 4200 });
  });

  it('nur Dauer (Plank) +5 % auf 5 s gerundet', () => {
    const t = computeTarget(td([[{ durationSec: 60 }]]));
    expect(t.sets[0]).toEqual({ durationSec: 65 });
  });

  it('Planziel verfehlt -> wiederholen', () => {
    const t = computeTarget(td([[{ durationSec: 1200, distanceM: 3500 }]], { targetDistanceM: 4000, targetDurationSec: 1200 }));
    expect(t.reason).toBe('repeat');
    expect(t.sets[0].distanceM).toBe(4000);
  });
});
