import { beforeEach, describe, expect, it } from 'vitest';
import { all, db, resetDb, save, setMeta } from '../local/db';
import { sessionStats } from '../local/sessionStats';
import { targetFor } from '../local/queries';
import { hasDemo, loadDemo, removeDemo } from './demoData';

describe('Beispieldaten', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('laden ohne Sync-Outbox, Ziel über gleiches Modell, rückstandslos entfernen', async () => {
    await save('gyms', { name: 'Mein Gym' });
    const outboxBefore = await db.outbox.count();
    await loadDemo();
    expect(await hasDemo()).toBe(true);
    expect(await db.outbox.count()).toBe(outboxBefore);
    expect((await all('sessions')).length).toBe(24);
    // Brustpresse Gym B ist dasselbe Hoist-Modell wie in Gym A
    const ex = (await db.exercises.get('chest-press'))!;
    const neu = { id: 'x', gymId: 'neu', exerciseId: 'chest-press', modelId: 'hoist--rs-2301', label: 'BP', weightStepKg: 2.5, updatedAt: 0 };
    await db.gymMachines.put(neu);
    const t = await targetFor({ exercise: ex, machine: neu, prescription: { sets: 3, repMin: 8, repMax: 12 } });
    expect(t.used?.level).toBe('model');
    const stats = await sessionStats();
    expect(stats.some((s) => s.prs > 0)).toBe(true);
    await db.gymMachines.delete('x');

    // eigener Satz im Beispiel-Gym wird mit entfernt
    await setMeta('userId', 'u');
    const s = await save('sessions', { gymId: 'demo-gym-a', startedAt: Date.now() });
    await save('sets', { sessionId: s.id, exerciseId: 'chest-press', setIndex: 1, isWarmup: false, createdAt: Date.now(), weightKg: 50, reps: 10 });
    await removeDemo();
    expect(await hasDemo()).toBe(false);
    expect((await all('sessions')).length).toBe(0);
    expect((await all('sets')).length).toBe(0);
    expect((await all('gyms')).filter((g) => !g.id.startsWith('usc-')).map((g) => g.name)).toEqual(['Mein Gym']);
    expect((await db.outbox.toArray()).every((e) => e.table === 'gyms')).toBe(true);
  });
});
