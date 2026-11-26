import { describe, expect, it } from 'vitest';
import {
  balanceWarnings,
  consistency,
  progressByExercise,
  progressRate,
  splitBalance,
  splitOfDayName,
  strengthHighlights,
  type DExercise,
  type DSession,
  type DSet,
  type DStation,
} from './dashboard';

// Mittwoch, 25.11.2026 12:00
const NOW = new Date(2026, 10, 25, 12).getTime();
const day = (d: number, h = 18) => new Date(2026, 10, d, h).getTime(); // November
const sess = (id: string, ts: number, split: DSession['split'], gymId = 'g1'): DSession => ({ id, gymId, split, startedAt: ts });

describe('splitOfDayName', () => {
  it('erkennt Push/Pull/Legs', () => {
    expect(splitOfDayName('Push')).toBe('push');
    expect(splitOfDayName('Pull A')).toBe('pull');
    expect(splitOfDayName('Beine')).toBe('legs');
    expect(splitOfDayName(undefined)).toBe('other');
  });
});

describe('consistency', () => {
  it('Kalender, letzte 7 Tage, rollierender Schnitt, im Ziel seit', () => {
    const sessions = [
      // KW 48 (23.–29.11.): 2
      sess('a', day(23), 'push'), sess('b', day(24), 'pull'),
      // KW 47: 3
      sess('c', day(16), 'push'), sess('d', day(18), 'pull'), sess('e', day(20), 'legs'),
      // KW 46: 3
      sess('f', day(9), 'push'), sess('g', day(11), 'pull'), sess('h', day(13), 'legs'),
      // KW 45: 1
      sess('i', day(4), 'push'),
    ];
    const c = consistency(sessions, [{ date: '2026-11-24', durationMin: 30 }], 3, 16, NOW);
    expect(c.weeks).toHaveLength(16);
    // letzte 7 Tage = 19.–25.11.: 20., 23., 24.
    expect(c.last7).toBe(3);
    // 28 Tage = 29.10.–25.11.: alle 9 -> 2,25/Woche
    expect(c.avg4w).toBeCloseTo(9 / 4);
    expect(c.avg4wPrev).toBe(0);
    expect(c.inGoalWeeks).toBe(0); // Ziel 3 nicht erreicht
    const c2 = consistency(sessions, [], 2, 16, NOW);
    // Schnitt am 25.11. (2,25) und 18.11. (7 von 22.10.–18.11. -> 1,75)
    expect(c2.inGoalWeeks).toBe(1);
    const cur = c.weeks.at(-1)!;
    expect(cur.current).toBe(true);
    expect(cur.days[1]).toMatchObject({ date: '2026-11-24', splits: ['pull'], cardioMin: 30, future: false });
    expect(cur.days[3].future).toBe(true); // Donnerstag
  });
});

describe('splitBalance', () => {
  it('Anteile, zuletzt, Warnungen', () => {
    const sessions = [sess('a', day(23), 'push'), sess('b', day(24), 'pull'), sess('c', day(2), 'legs')];
    const sets: DSet[] = [
      ...Array.from({ length: 10 }, (_, i) => ({ sessionId: 'a', stationId: 's', reps: 8, isWarmup: false, setIndex: i, createdAt: i })),
      ...Array.from({ length: 9 }, (_, i) => ({ sessionId: 'b', stationId: 's', reps: 8, isWarmup: false, setIndex: i, createdAt: i })),
      { sessionId: 'b', stationId: 's', reps: 8, isWarmup: true, setIndex: 9, createdAt: 9 },
      ...Array.from({ length: 6 }, (_, i) => ({ sessionId: 'c', stationId: 's', reps: 8, isWarmup: false, setIndex: i, createdAt: i })),
    ];
    const st = splitBalance(sessions, sets, NOW - 28 * 86400000, NOW);
    const by = Object.fromEntries(st.map((s) => [s.split, s]));
    expect(by.push).toMatchObject({ sessions: 1, sets: 10, daysSince: 2 });
    expect(by.pull.sets).toBe(9);
    expect(by.legs).toMatchObject({ sets: 6, daysSince: 23 });
    expect(by.push.share + by.pull.share + by.legs.share).toBeCloseTo(1);
    expect(balanceWarnings(st)).toEqual(['Legs: zuletzt vor 23 Tagen']);
    expect(balanceWarnings(splitBalance(sessions.slice(0, 2), sets, NOW - 28 * 86400000, NOW))).toEqual(['Legs: nur 0 % der Sätze, noch nie trainiert']);
  });
});

// ---- Daten für Ziel-Erfüllung / Fortschritt / Highlights
const exercises = new Map<string, DExercise>([
  ['bank', { id: 'bank', name: 'Bankdrücken', type: 'weight_reps' }],
  ['klimm', { id: 'klimm', name: 'Klimmzüge', type: 'bodyweight' }],
]);
const stations: DStation[] = [
  { id: 'bank-evo', gymId: 'evo', exerciseId: 'bank', name: 'Bankdrücken', weightIncrement: 2.5 },
  { id: 'bank-iron', gymId: 'iron', exerciseId: 'bank', name: 'Bankdrücken', weightIncrement: 2.5 },
  { id: 'klimm-evo', gymId: 'evo', exerciseId: 'klimm', name: 'Klimmzüge', weightIncrement: 2.5 },
];
function build(rows: [string, string, number, [number, number][]][]) {
  const sessions: DSession[] = [];
  const sets: DSet[] = [];
  for (const [sid, stationId, ts, ss] of rows) {
    const gymId = stations.find((s) => s.id === stationId)!.gymId;
    if (!sessions.some((s) => s.id === sid)) sessions.push(sess(sid, ts, 'push', gymId));
    ss.forEach(([w, r], i) => sets.push({ sessionId: sid, stationId, weightKg: w, reps: r, isWarmup: false, setIndex: i, createdAt: ts + i }));
  }
  return { sessions, sets };
}

describe('progressRate', () => {
  it('vergleicht bestes e1RM 4 Wochen mit den 4 Wochen davor', () => {
    const { sessions, sets } = build([
      ['a1', 'bank-evo', day(1) - 7 * 86400000, [[60, 8]]],
      ['a2', 'bank-evo', day(20), [[65, 8]]],
      ['b1', 'bank-iron', day(2) - 7 * 86400000, [[70, 7]]],
      ['b2', 'bank-iron', day(21), [[70, 7]]],
      ['c1', 'klimm-evo', day(3) - 7 * 86400000, [[0, 8]]],
      ['c2', 'klimm-evo', day(22), [[0, 6]]],
    ]);
    const r = progressRate(sessions, sets, stations, exercises, () => true, { now: NOW });
    expect(r.up.map((x) => x.stationId)).toEqual(['bank-evo']);
    expect(r.flat.map((x) => x.stationId)).toEqual(['bank-iron']);
    expect(r.down).toMatchObject([{ stationId: 'klimm-evo', unit: 'Wdh.', before: 8, now: 6 }]);
  });
});

describe('progressByExercise', () => {
  it('fasst Gyms je Übung zusammen (Mittelwert)', () => {
    const { sessions, sets } = build([
      ['a1', 'bank-evo', day(1) - 7 * 86400000, [[60, 8]]],
      ['a2', 'bank-evo', day(20), [[66, 8]]], // +10 %
      ['b1', 'bank-iron', day(2) - 7 * 86400000, [[70, 8]]],
      ['b2', 'bank-iron', day(21), [[69.3, 8]]], // -1 %
    ]);
    const r = progressByExercise(progressRate(sessions, sets, stations, exercises, () => true, { now: NOW }), stations, exercises);
    expect(r.up).toHaveLength(1);
    expect(r.up[0].name).toBe('Bankdrücken');
    expect(r.up[0].parts.map((p) => p.gymId).sort()).toEqual(['evo', 'iron']);
    expect(r.up[0].pct).toBeCloseTo((0.1 - 0.01) / 2, 2);
  });
});

describe('strengthHighlights', () => {
  it('meisttrainierte Übungen mit Verlauf je Gym', () => {
    const { sessions, sets } = build([
      ['a1', 'bank-evo', day(2), [[60, 8]]],
      ['a2', 'bank-evo', day(9), [[62.5, 8]]],
      ['a3', 'bank-evo', day(16), [[65, 8]]],
      ['b1', 'bank-iron', day(3), [[70, 6]]],
      ['b2', 'bank-iron', day(10), [[70, 7]]],
      ['c1', 'klimm-evo', day(4), [[0, 6]]],
      ['c2', 'klimm-evo', day(11), [[0, 7]]],
    ]);
    const h = strengthHighlights(sessions, sets, stations, exercises, () => true, { now: NOW });
    expect(h.map((x) => [x.name, x.unit, x.sessions, x.series.length])).toEqual([
      ['Bankdrücken', 'kg', 5, 2],
      ['Klimmzüge', 'Wdh.', 2, 1],
    ]);
    const evo = h[0].series.find((s) => s.gymId === 'evo')!;
    expect(evo.pct).toBeCloseTo((65 - 60) / 60);
  });
});
