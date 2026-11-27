import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { all, db, save } from './db';
import { repairMultiPec } from './repairs';

describe('repairMultiPec', () => {
  beforeEach(async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });
  it('macht aus Multi Pec eine Seitheben-Maschine – Gerät, Sätze und Ausblendung im Gym', async () => {
    const m = await save('gymMachines', { gymId: 'evo', exerciseId: 'butterfly', label: 'Multi Pec', weightStepKg: 2.5 });
    const fly = await save('gymMachines', { gymId: 'evo', exerciseId: 'butterfly', label: 'Pec Fly', weightStepKg: 2.5 });
    await save('sets', { sessionId: 's', machineId: m.id, exerciseId: 'butterfly', setIndex: 1, isWarmup: false, createdAt: 1, weightKg: 20, reps: 10 });
    await save('sets', { sessionId: 's', machineId: fly.id, exerciseId: 'butterfly', setIndex: 1, isWarmup: false, createdAt: 2, weightKg: 50, reps: 10 });
    await save('planDayExercises', { planDayId: 'push', exerciseId: 'lateral-raise-machine', order: 0, sets: 3, repMin: 8, repMax: 12, skipGyms: ['evo'] });
    expect(await repairMultiPec()).toBe(1);
    const machines = await all('gymMachines');
    expect(machines.find((x) => x.label === 'Multi Pec')!.exerciseId).toBe('lateral-raise-machine');
    expect(machines.find((x) => x.label === 'Pec Fly')!.exerciseId).toBe('butterfly');
    expect((await all('sets')).map((s) => s.exerciseId).sort()).toEqual(['butterfly', 'lateral-raise-machine']);
    expect((await all('planDayExercises'))[0].skipGyms).toEqual([]);
    expect(await repairMultiPec()).toBe(0);
  });
});
