import { describe, expect, it } from 'vitest';
import { planVolume } from './planVolume';

describe('Wochenvolumen eines Plans', () => {
  it('Haupt voll, Neben halb, Faktor aus Wochenziel', () => {
    const days = [
      { items: [{ exerciseId: 'chest-press', muscle: 'Brust', sets: 3 }, { exerciseId: 'butterfly', muscle: 'Brust', sets: 3 }] },
      { items: [{ exerciseId: 'lat-pulldown', muscle: 'Rücken', sets: 3 }] },
    ];
    // 4×/Woche bei 2 Tagen → jeder Tag 2× pro Woche
    const v = planVolume({ days, perWeek: 4 });
    const get = (m: string) => v.find((x) => x.muscle === m)!;
    expect(get('Brust').sets).toBe(12);
    expect(get('Brust').status).toBe('ok');
    // Schultern: Brustpresse 3×0,5 + Butterfly 3×0,5 = 3 pro Tag → 6/Woche
    expect(get('Schultern').sets).toBe(6);
    expect(get('Rücken').sets).toBe(6);
    expect(get('Rücken').status).toBe('low');
    expect(get('Hintere Schulter').sets).toBe(3);
    expect(get('Waden').sets).toBe(0);
    expect(get('Waden').minor).toBe(true);
    expect(get('Waden').min).toBe(4);
  });

  it('Synonyme werden zusammengeführt, Cardio ignoriert', () => {
    const v = planVolume({ days: [{ items: [{ exerciseId: 'x', muscle: 'Beine', sets: 3 }, { exerciseId: 'treadmill', muscle: 'Cardio', sets: 1 }] }], perWeek: 7 });
    expect(v.find((x) => x.muscle === 'Quadrizeps')!.sets).toBe(21);
    expect(v.find((x) => x.muscle === 'Quadrizeps')!.status).toBe('high');
  });
});
