import { beforeEach, describe, expect, it } from 'vitest';
import { all, db, patch, resetDb, save, setMeta } from '../local/db';
import { adoptLocalData, pull, push, sync, type RemoteApi } from './engine';

/** In-Memory-Server mit Last-Write-Wins wie der Supabase-Trigger */
function fakeServer() {
  const tables = new Map<string, Map<string, Record<string, unknown>>>();
  let clock = 0;
  const api: RemoteApi = {
    async upsert(table, rows) {
      const t = tables.get(table) ?? new Map();
      tables.set(table, t);
      for (const r of rows) {
        const cur = t.get(r.id as string);
        if (cur && (cur.updated_at as number) > (r.updated_at as number)) continue;
        t.set(r.id as string, { ...r, server_updated_at: String(++clock).padStart(8, '0') });
      }
    },
    async pull(table, since, limit) {
      return [...(tables.get(table)?.values() ?? [])]
        .filter((r) => since === null || (r.server_updated_at as string) > since)
        .sort((a, b) => ((a.server_updated_at as string) < (b.server_updated_at as string) ? -1 : 1))
        .slice(0, limit);
    },
  };
  return { api, tables };
}

describe('sync', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('lokaler Modus lädt nichts hoch; nach Login wird übernommen und gepusht', async () => {
    const s = fakeServer();
    const gym = await save('gyms', { name: 'McFit Mitte', city: 'Berlin' });
    await save('sessions', { gymId: gym.id, startedAt: 1 });
    expect(await push(s.api)).toBe(0);
    expect(await db.outbox.count()).toBe(2);

    await adoptLocalData('user-1');
    const r = await sync(s.api);
    expect(r.pushed).toBe(2);
    expect(s.tables.get('sessions')!.size).toBe(1);
    const remoteSession = [...s.tables.get('sessions')!.values()][0];
    expect(remoteSession.user_id).toBe('user-1');
    expect(remoteSession.gym_id).toBe(gym.id);
    expect([...s.tables.get('gyms')!.values()][0].created_by).toBe('user-1');
  });

  it('zweites Gerät bekommt Daten per Pull; neuere lokale Änderung gewinnt', async () => {
    const s = fakeServer();
    await setMeta('userId', 'u');
    const gym = await save('gyms', { name: 'FitX', city: 'Köln' });
    await push(s.api);

    // "zweites Gerät"
    await resetDb();
    await setMeta('userId', 'u');
    await pull(s.api);
    expect((await all('gyms')).filter((g) => !g.id.startsWith('usc-')).map((g) => g.name)).toEqual(['FitX']);

    // Server bekommt ältere Änderung, lokal ist neuer und noch nicht gepusht
    await patch('gyms', gym.id, { name: 'FitX Ehrenfeld' });
    const local = await db.gyms.get(gym.id);
    await s.api.upsert('gyms', [{ ...[...s.tables.get('gyms')!.values()][0], name: 'alt', updated_at: local!.updatedAt - 10 }]);
    await pull(s.api);
    expect((await db.gyms.get(gym.id))!.name).toBe('FitX Ehrenfeld');
    await push(s.api);
    expect([...s.tables.get('gyms')!.values()][0].name).toBe('FitX Ehrenfeld');
  });

  it('Löschungen werden als Soft-Delete synchronisiert; Katalog ist lokal vorhanden', async () => {
    const s = fakeServer();
    await setMeta('userId', 'u');
    const b = await save('bodyweights', { date: '2026-11-26', weightKg: 80 });
    await sync(s.api);
    const { remove } = await import('../local/db');
    await remove('bodyweights', b.id);
    await sync(s.api);
    expect([...s.tables.get('bodyweights')!.values()][0].deleted_at).toBeTypeOf('number');
    expect(await all('bodyweights')).toHaveLength(0);
    expect((await all('exercises')).length).toBeGreaterThan(40);
    expect((await all('equipmentModels')).length).toBeGreaterThan(200);
  });

  it('vom Server abgelehnte Zeilen blockieren den Sync nicht', async () => {
    const s = fakeServer();
    const upsert = s.api.upsert;
    s.api.upsert = async (table, rows) => {
      if (rows.some((r) => r.name === 'fremd')) throw new Error('new row violates row-level security policy');
      return upsert(table, rows);
    };
    await setMeta('userId', 'u');
    await save('gyms', { name: 'fremd' });
    await save('gyms', { name: 'meins' });
    await push(s.api);
    expect([...s.tables.get('gyms')!.values()].map((g) => g.name)).toEqual(['meins']);
    expect(await db.outbox.count()).toBe(0);
    const { getMeta } = await import('../local/db');
    expect(await getMeta<string[]>('syncRejected')).toHaveLength(1);
  });
});
