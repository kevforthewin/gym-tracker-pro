import { beforeEach, describe, expect, it } from 'vitest';
import { all, db, getMeta, resetDb, save, setMeta } from './db';
import { mergeGymInto, mergeSuggestions } from './mergeGym';
import { myGyms } from './queries';

describe('Gym zusammenführen', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('schlägt passende Katalog-Gyms vor', async () => {
    const iron = await save('gyms', { name: 'IRON & Soul' });
    expect((await mergeSuggestions(iron))[0].name).toBe('Iron&Soul Köln');
    const evo = await save('gyms', { name: 'EVO Fitness' });
    expect((await mergeSuggestions(evo)).map((g) => g.name)).toEqual(expect.arrayContaining(['EVO Fitness Belgisches Viertel', 'EVO Fitness Ehrenstraße']));
  });

  it('zieht Geräte, Trainings, Cardio und Verknüpfung um', async () => {
    await setMeta('userId', 'u');
    const old = await save('gyms', { name: 'IRON & Soul' });
    await save('userGyms', { gymId: old.id });
    const m = await save('gymMachines', { gymId: old.id, exerciseId: 'chest-press', label: 'BP', weightStepKg: 2.5 });
    const s = await save('sessions', { gymId: old.id, startedAt: 1 });
    await save('cardio', { date: '2026-11-01', kind: 'treadmill', durationMin: 10, gymId: old.id });
    await setMeta('lastStart', { gymId: old.id, dayId: '' });
    const target = (await mergeSuggestions(old))[0];

    const r = await mergeGymInto(old.id, target.id);
    expect(r).toEqual({ machines: 1, sessions: 1 });
    expect((await db.gymMachines.get(m.id))!.gymId).toBe(target.id);
    expect((await db.sessions.get(s.id))!.gymId).toBe(target.id);
    expect((await all('cardio'))[0].gymId).toBe(target.id);
    expect((await myGyms()).map((g) => g.id)).toEqual([target.id]);
    expect(await all('gyms').then((g) => g.some((x) => x.id === old.id))).toBe(false);
    expect((await getMeta<{ gymId: string }>('lastStart'))!.gymId).toBe(target.id);
  });
});
