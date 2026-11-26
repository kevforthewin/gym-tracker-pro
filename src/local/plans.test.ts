import { beforeEach, describe, expect, it } from 'vitest';
import { all, db, getMeta, patch, resetDb, save } from './db';
import { targetFor } from './queries';
import { createPlanFromTemplate, deloadState, resolveSlotInGym, setDeloadThisWeek, suggestNextDay } from './plans';
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

  it('Deload: Intervall ab erstem Training, manuell übersteuerbar, zählt nicht für Progression', async () => {
    const plan = await createPlanFromTemplate('ppl');
    const days = (await all('planDays')).sort((a, b) => a.order - b.order);
    const W = 7 * 86400000;
    const now = Date.now();
    await save('sessions', { gymId: 'g', planDayId: days[0].id, startedAt: now - 3 * W });
    expect((await deloadState(now)).active).toBe(false);
    await patch('plans', plan.id, { deloadEvery: 4 });
    expect((await deloadState(now)).active).toBe(true); // 4. Woche
    await setDeloadThisWeek(false, now);
    expect((await deloadState(now)).active).toBe(false);
    expect((await deloadState(now)).manual).toBe(true);
    await setDeloadThisWeek(null, now);
    expect((await deloadState(now)).active).toBe(true);

    // Deload-Training wird bei der Zielberechnung übersprungen
    const ex = (await db.exercises.get('db-curl'))!;
    const s1 = await save('sessions', { gymId: 'g', startedAt: 1 });
    for (const i of [1, 2, 3]) await save('sets', { sessionId: s1.id, exerciseId: 'db-curl', setIndex: i, isWarmup: false, createdAt: i, weightKg: 14, reps: 12 });
    const s2 = await save('sessions', { gymId: 'g', startedAt: 2, deload: true });
    for (const i of [1, 2]) await save('sets', { sessionId: s2.id, exerciseId: 'db-curl', setIndex: i, isWarmup: false, createdAt: 10 + i, weightKg: 12, reps: 10 });
    const t = await targetFor({ exercise: ex, prescription: { sets: 3, repMin: 8, repMax: 12 } });
    expect(t.used?.sessions).toHaveLength(1);
    expect(t.target.reason).toBe('increase');
  });
});
