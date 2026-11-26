import { beforeEach, describe, expect, it } from 'vitest';
import { all, db, resetDb, save, setMeta } from '../../local/db';
import { toRemote } from '../../sync/mapping';
import { cardioKindFromText } from '../../import/legacyBackup';
import { loadDemo, removeDemo } from '../../demo/demoData';
import { cardioKind, isCardioExercise } from '../../model/types';

describe('Cardio', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('Eintrag im Training wird mit session_id synchronisiert', async () => {
    await setMeta('userId', 'u');
    const c = await save('cardio', { date: '2026-11-26', kind: 'treadmill', durationMin: 10, sessionId: 's1', gymId: 'g1', createdAt: 1 });
    const remote = toRemote(c as unknown as Record<string, unknown>);
    expect(remote.session_id).toBe('s1');
    expect(remote.duration_min).toBe(10);
    expect(remote.user_id).toBe('u');
  });

  it('Freitext der alten App wird auf feste Arten abgebildet', () => {
    expect(cardioKindFromText('Laufband')).toBe('treadmill');
    expect(cardioKindFromText('Zone 2 Rad')).toBe('cycling');
    expect(cardioKindFromText('Joggen')).toBe('run');
    expect(cardioKind('unbekannt').label).toBe('unbekannt');
  });

  it('Cardio-Übungen sind aus Kraft-Auswahllisten herausgefiltert', async () => {
    const ex = await all('exercises');
    expect(ex.filter(isCardioExercise).map((e) => e.id)).toEqual(expect.arrayContaining(['treadmill', 'rower']));
    expect(isCardioExercise((await db.exercises.get('plank'))!)).toBe(false);
  });

  it('Beispieldaten enthalten Cardio und entfernen es wieder', async () => {
    await loadDemo();
    expect((await all('cardio')).length).toBeGreaterThan(8);
    await removeDemo();
    expect(await all('cardio')).toHaveLength(0);
  });
});
