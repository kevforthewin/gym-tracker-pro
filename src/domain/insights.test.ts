import { describe, expect, it } from 'vitest';
import { buildStatus, compareSides, isStalled, isoWeek, weekStart, weeklySets } from './insights';
import { computeTarget, type WorkSet } from './progression';
import { splitSide, guessMuscleGroup } from './exerciseDefaults';

const day = 86400000;
const s = (w: number, ...reps: number[]): WorkSet[] => reps.map((r) => ({ weightKg: w, reps: r }));

describe('Wochen', () => {
  it('weekStart ist Montag', () => {
    const sun = new Date(2026, 10, 22, 18).getTime(); // So 22.11.
    expect(new Date(weekStart(sun)).getDate()).toBe(16);
    expect(isoWeek(sun)).toBe(47);
  });
});

describe('weeklySets', () => {
  it('zählt Arbeitssätze je Muskel, einseitig halb, ohne Warmup', () => {
    const ts = new Date(2026, 10, 18).getTime();
    const m = weeklySets([
      { ts, muscleGroup: 'Brust', sided: false, warmup: false },
      { ts, muscleGroup: 'Brust', sided: false, warmup: true },
      { ts, muscleGroup: 'Schultern', sided: true, warmup: false },
      { ts, muscleGroup: 'Schultern', sided: true, warmup: false },
      { ts },
    ].map((x) => ({ sided: false, warmup: false, ...x })));
    const row = m.get(weekStart(ts))!;
    expect(row.get('Brust')).toBe(1);
    expect(row.get('Schultern')).toBe(1);
    expect(row.get('Sonstige')).toBe(1);
  });
});

describe('Status', () => {
  const mk = (sets: WorkSet[][]) => {
    const history = sets.map((x, i) => ({ date: Date.now() - (sets.length - i) * 3 * day, sets: x }));
    return { history, target: computeTarget({ type: 'weight_reps', prescription: { sets: 3, repMin: 8, repMax: 12 }, increment: 2.5, history }) };
  };
  it('ordnet Deload, Steigern, Stagnation und PRs zu', () => {
    const a = mk([s(50, 10, 9, 8), s(50, 10, 9, 8), s(50, 9, 9, 8)]);
    const b = mk([s(40, 11, 11, 11), s(40, 12, 12, 12)]);
    const c = mk([s(30, 10, 10, 9), s(30, 10, 9, 9)]);
    const st = buildStatus([
      { stationId: 'a', label: 'A', ...a },
      { stationId: 'b', label: 'B', ...b },
      { stationId: 'c', label: 'C', ...c },
    ]);
    expect(st.deload.map((x) => x.label)).toEqual(['A']);
    expect(st.ready.map((x) => x.label)).toEqual(['B']);
    expect(st.stalled.map((x) => x.label)).toEqual(['C']);
    expect(st.prs.map((x) => x.label)).toEqual(['B']);
  });
  it('isStalled braucht 2 Sessions', () => {
    expect(isStalled([{ date: 0, sets: s(10, 8) }])).toBe(false);
  });
});

describe('Seiten', () => {
  it('splitSide', () => {
    expect(splitSide('Kabel-Seitheben (links)')).toEqual({ base: 'Kabel-Seitheben', side: 'links' });
    expect(splitSide('Bankdrücken')).toEqual({ base: 'Bankdrücken' });
  });
  it('compareSides erkennt schwächere Seite', () => {
    const c = compareSides('Beinstrecker', { date: 0, sets: s(41, 7, 7, 7) }, { date: 0, sets: s(41, 9, 8, 8) })!;
    expect(c.weaker).toBe('links');
    expect(c.diffPct).toBeGreaterThan(5);
  });
  it('Muskelgruppe raten', () => {
    expect(guessMuscleGroup('Hoist Mid Row')).toBe('Rücken');
    expect(guessMuscleGroup('Bauchmuskelmaschine')).toBe('Core');
    expect(guessMuscleGroup('Reverse Butterfly einarmig (links)')).toBe('Hintere Schulter');
  });
});
