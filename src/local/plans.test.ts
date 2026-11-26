import { beforeEach, describe, expect, it } from 'vitest';
import { all, db, getMeta, resetDb, save } from './db';
import { createPlanFromTemplate, resolveSlotInGym, suggestNextDay } from './plans';
import { toRemote } from '../sync/mapping';

describe('Pläne aus Vorlagen', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('Upper/Lower: 4 Tage mit Plätzen, Wochenziel 4', async () => {
    const plan = await createPlanFromTemplate('upper-lower');
    const days = (await all('planDays')).filter((d) => d.planId === plan.id).sort((a, b) => a.order - b.order);
    expect(days.map((d) => d.name)).toEqual(['Upper A', 'Lower A', 'Upper B', 'Lower B']);
    const pdes = await all('planDayExercises');
    expect(pdes.every((p) => p.slotId)).toBe(true);
    const bench = pdes.find((p) => p.slotId === 'horizontal-push')!;
    expect([bench.sets, bench.repMin, bench.repMax]).toEqual([3, 6, 10]);
    expect(toRemote(bench as unknown as Record<string, unknown>).slot_id).toBe('horizontal-push');
    expect(await getMeta('weeklyGoal')).toBe(4);
    const ppl = await createPlanFromTemplate('ppl', 6);
    expect(ppl.name).toBe('Push / Pull / Legs (6×/Woche)');
    expect(await getMeta('weeklyGoal')).toBe(6);
  });

  it('Platz wird im Gym aufgelöst: Gerät > Freihantel, zuletzt genutzt bevorzugt', async () => {
    const gymA = await save('gyms', { name: 'A' });
    const gymB = await save('gyms', { name: 'B' });
    await save('gymMachines', { gymId: gymA.id, exerciseId: 'chest-press', label: 'BP', weightStepKg: 2.5 });
    expect(await resolveSlotInGym('horizontal-push', gymA.id)).toBe('chest-press');
    expect(await resolveSlotInGym('horizontal-push', gymB.id)).toBe('bench-press');
    // in Gym A zuletzt KH-Bankdrücken gemacht → bleibt dabei
    const s = await save('sessions', { gymId: gymA.id, startedAt: 10 });
    await save('sets', { sessionId: s.id, exerciseId: 'db-bench-press', setIndex: 1, isWarmup: false, createdAt: 10, weightKg: 24, reps: 10 });
    expect(await resolveSlotInGym('horizontal-push', gymA.id)).toBe('db-bench-press');
  });

  it('nächster Tag folgt dem zuletzt trainierten Tag desselben Plans', async () => {
    await createPlanFromTemplate('upper-lower');
    const days = (await all('planDays')).sort((a, b) => a.order - b.order);
    expect(await suggestNextDay()).toBeUndefined();
    await save('sessions', { gymId: 'g', planDayId: days[1].id, startedAt: 5 });
    expect(await suggestNextDay()).toBe(days[2].id);
    await save('sessions', { gymId: 'g', planDayId: days[3].id, startedAt: 9 });
    expect(await suggestNextDay()).toBe(days[0].id);
    expect(await db.planDays.count()).toBe(4);
  });
});
