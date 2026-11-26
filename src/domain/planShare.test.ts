import { beforeEach, describe, expect, it } from 'vitest';
import { decodePlan, encodePlan } from './planShare';
import { all, resetDb, save } from '../local/db';
import { createPlanFromTemplate, exportPlan, importSharedPlan } from '../local/plans';

describe('Pläne teilen', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('Export → Link → Import ergibt denselben Plan (inkl. eigener Übung, Umlaute)', async () => {
    const plan = await createPlanFromTemplate('upper-lower');
    const day = (await all('planDays')).find((d) => d.name === 'Upper A')!;
    const custom = await save('exercises', { name: 'Kabel-Außenrotation', type: 'weight_reps', muscleGroup: 'Hintere Schulter', split: 'pull' });
    await save('planDayExercises', { planDayId: day.id, exerciseId: custom.id, order: 99, sets: 2, repMin: 12, repMax: 15 });
    const link = encodePlan(await exportPlan(plan.id));
    expect(link).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(link.length).toBeLessThan(3000);

    await resetDb();
    const p = decodePlan(link);
    expect(p.name).toBe('Upper / Lower');
    expect(p.days.map((d) => d.n)).toEqual(['Upper A', 'Lower A', 'Upper B', 'Lower B']);
    await importSharedPlan(p);
    const pdes = await all('planDayExercises');
    expect(pdes.filter((x) => x.slotId).length).toBe(26);
    expect((await all('exercises')).some((e) => e.name === 'Kabel-Außenrotation')).toBe(true);
  });

  it('ungültige Links werden abgelehnt bzw. begrenzt', () => {
    expect(() => decodePlan('kaputt!!')).toThrow();
    const raw = btoa(JSON.stringify({ v: 1, name: 'x'.repeat(500), days: [{ n: 'A', x: [{ e: 'chest-press', k: 999, a: 12, b: 3 }] }] }));
    const p = decodePlan(raw.replace(/=+$/, ''));
    expect(p.name.length).toBe(80);
    expect(p.days[0].x[0]).toMatchObject({ k: 20, a: 12, b: 12 });
  });
});
