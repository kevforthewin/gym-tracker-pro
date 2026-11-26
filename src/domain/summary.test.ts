import { describe, expect, it } from 'vitest';
import { summarizeSession } from './summary';
import type { WorkSet } from './progression';

const s = (w: number, ...reps: number[]): WorkSet[] => reps.map((r) => ({ weightKg: w, reps: r }));

describe('summarizeSession', () => {
  it('Bestwert, gesteigert, gleich, schwächer, erstes Mal', () => {
    const r = summarizeSession([
      // neuer Bestwert: mehr Gewicht als je zuvor
      { stationId: 'bank', label: 'Bankdrücken', type: 'weight_reps', sets: s(72.5, 7, 6, 6), history: [s(70, 8, 8, 8), s(70, 7, 7, 7)] },
      // gleiches Gewicht, mehr Wdh., aber früher schon mal besser -> gesteigert, kein Bestwert
      { stationId: 'lat', label: 'Latzug', type: 'weight_reps', sets: s(66, 11, 10, 10), history: [s(66, 12, 12, 12), s(66, 10, 10, 9)] },
      { stationId: 'row', label: 'Rudern', type: 'weight_reps', sets: s(66, 10, 10, 10), history: [s(66, 10, 10, 10)] },
      { stationId: 'fly', label: 'Butterfly', type: 'weight_reps', sets: s(54, 8, 7, 7), history: [s(56.3, 10, 9, 9)] },
      { stationId: 'new', label: 'Neu', type: 'weight_reps', sets: s(20, 10), history: [] },
      { stationId: 'empty', label: 'Leer', type: 'weight_reps', sets: [], history: [s(1, 1)] },
    ]);
    expect(r.exercises).toBe(5);
    expect(r.workSets).toBe(13);
    expect(r.volumeKg).toBe(Math.round(72.5 * 19 + 66 * 31 + 66 * 30 + 54 * 22 + 200));
    expect(r.prs).toMatchObject([{ label: 'Bankdrücken', detail: '+2,5 kg', best: '72,5 kg × 7' }]);
    expect(r.up).toMatchObject([{ label: 'Latzug', detail: '+2 Wdh.' }]);
    expect(r.same).toMatchObject([{ label: 'Rudern', detail: 'wie letztes Mal' }]);
    expect(r.down).toMatchObject([{ label: 'Butterfly', detail: '−2,3 kg' }]);
    expect(r.first).toMatchObject([{ label: 'Neu' }]);
  });

  it('Zusatzsatz verfälscht den Wdh.-Vergleich nicht', () => {
    const r = summarizeSession([{ stationId: 'x', label: 'X', type: 'weight_reps', sets: s(50, 10, 10, 10, 6), history: [s(50, 11, 11, 11), s(50, 10, 10, 10)] }]);
    expect(r.same).toHaveLength(1);
  });

  it('Körpergewicht: Wdh., Ausdauer: Distanz', () => {
    const r = summarizeSession([
      { stationId: 'k', label: 'Klimmzüge', type: 'bodyweight', sets: s(0, 8, 7, 7), history: [s(0, 7, 7, 6)] },
      { stationId: 'c', label: 'Laufband', type: 'time_distance', sets: [{ durationSec: 1200, distanceM: 3100 }], history: [[{ durationSec: 1200, distanceM: 3000 }]] },
    ]);
    expect(r.prs.map((x) => [x.label, x.detail, x.best])).toEqual([
      ['Klimmzüge', '+2 Wdh.', '8 Wdh.'],
      ['Laufband', '+0,1 km', '3,1 km'],
    ]);
  });

});
