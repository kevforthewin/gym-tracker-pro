/**
 * Offline-Sync: Push (Outbox → Server) und Pull (Server → lokal).
 *
 * - Konflikte: Last-Write-Wins je Zeile über `updatedAt` (Client-Zeit). Der Server verwirft per
 *   Trigger ältere Schreibvorgänge; lokal überschreibt ein Pull keine neuere, noch nicht gepushte Änderung.
 * - Pull-Cursor: `server_updated_at` (Server-Zeit), damit verspätet hochgeladene Offline-Änderungen
 *   anderer Geräte nicht übersehen werden.
 */
import type { EntityTable } from 'dexie';
import { currentUserId, db, getMeta, isPrivate, LOCAL_USER, setMeta } from '../local/db';
import { SHARED_TABLES, PRIVATE_TABLES, type Row, type SyncTable } from '../model/types';
import { fromRemote, REMOTE_TABLE, toRemote } from './mapping';

export interface RemoteApi {
  upsert(table: string, rows: Record<string, unknown>[]): Promise<void>;
  /** Zeilen mit server_updated_at > since, aufsteigend sortiert */
  pull(table: string, since: string | null, limit: number): Promise<Record<string, unknown>[]>;
}

export const SYNC_ORDER: SyncTable[] = [...SHARED_TABLES, ...PRIVATE_TABLES];
const BATCH = 500;

const tbl = (t: SyncTable) => db[t] as unknown as EntityTable<Row, 'id'>;

export async function push(remote: RemoteApi): Promise<number> {
  // Im lokalen Modus (ohne Konto) wird nichts hochgeladen – die Outbox bleibt bis zum Login liegen.
  if ((await currentUserId()) === LOCAL_USER) return 0;
  const entries = await db.outbox.orderBy('seq').toArray();
  if (!entries.length) return 0;
  let pushed = 0;
  // Reihenfolge der Tabellen beachten (Fremdschlüssel: Gym vor Gerät vor Satz …)
  for (const table of SYNC_ORDER) {
    const mine = entries.filter((e) => e.table === table);
    for (let i = 0; i < mine.length; i += BATCH) {
      const chunk = mine.slice(i, i + BATCH);
      const rows = (await tbl(table).bulkGet(chunk.map((e) => e.rowId))).filter((r): r is Row => !!r);
      const uploadable = rows.filter((r) => (r as { userId?: string }).userId !== LOCAL_USER);
      if (uploadable.length) await upsertTolerant(remote, table, uploadable);
      // nur entfernen, wenn die Zeile seitdem nicht erneut geändert wurde
      await db.transaction('rw', db.outbox, tbl(table), async () => {
        for (const e of chunk) {
          const sent = rows.find((r) => r.id === e.rowId);
          const now = await tbl(table).get(e.rowId);
          if (!now || !sent || now.updatedAt === sent.updatedAt) await db.outbox.delete(e.seq!);
        }
      });
      pushed += uploadable.length;
    }
  }
  return pushed;
}

/**
 * Batch hochladen; scheitert er (z. B. weil eine geteilte Zeile einem anderen Nutzer gehört und RLS
 * die Änderung ablehnt), Zeile für Zeile wiederholen. Abgelehnte Zeilen werden protokolliert und
 * nicht endlos erneut versucht – der nächste Pull stellt den Serverstand wieder her.
 */
async function upsertTolerant(remote: RemoteApi, table: SyncTable, rows: Row[]) {
  const mapped = rows.map((r) => toRemote(r as unknown as Record<string, unknown>));
  try {
    await remote.upsert(REMOTE_TABLE[table], mapped);
    return;
  } catch (e) {
    if (isNetworkError(e)) throw e;
  }
  const rejected: string[] = [];
  for (const r of mapped) {
    try {
      await remote.upsert(REMOTE_TABLE[table], [r]);
    } catch (e) {
      if (isNetworkError(e)) throw e;
      rejected.push(`${table}:${r.id}`);
    }
  }
  if (rejected.length) {
    const prev = (await getMeta<string[]>('syncRejected')) ?? [];
    await setMeta('syncRejected', [...prev, ...rejected].slice(-200));
    // Pull-Cursor zurücksetzen, damit der Serverstand dieser Tabelle neu geholt wird
    await setMeta(`pull:${table}`, null);
  }
}

export const isNetworkError = (e: unknown) =>
  e instanceof TypeError || (e instanceof Error && /fetch|network|offline/i.test(e.message));

export async function pull(remote: RemoteApi): Promise<number> {
  let n = 0;
  for (const table of SYNC_ORDER) {
    const key = `pull:${table}`;
    let since = (await getMeta<string>(key)) ?? null;
    for (;;) {
      const page = await remote.pull(REMOTE_TABLE[table], since, BATCH);
      if (!page.length) break;
      await merge(table, page.map((r) => fromRemote(r) as unknown as Row));
      since = String(page[page.length - 1].server_updated_at);
      await setMeta(key, since);
      n += page.length;
      if (page.length < BATCH) break;
    }
  }
  return n;
}

async function merge(table: SyncTable, rows: Row[]) {
  await db.transaction('rw', tbl(table), db.outbox, async () => {
    const pending = new Set(
      (await db.outbox.where('table').equals(table).toArray()).map((e) => e.rowId),
    );
    const local = await tbl(table).bulkGet(rows.map((r) => r.id));
    const winners = rows.filter((r, i) => {
      const l = local[i];
      if (!l) return true;
      if (pending.has(r.id) && l.updatedAt > r.updatedAt) return false;
      return r.updatedAt >= l.updatedAt;
    });
    await tbl(table).bulkPut(winners);
  });
}

/**
 * Nach dem ersten Login: alles, was im lokalen Modus angelegt wurde, dem Konto zuordnen
 * und zum Hochladen vormerken.
 */
export async function adoptLocalData(userId: string) {
  for (const table of SYNC_ORDER) {
    const rows = await tbl(table).toArray();
    const field = isPrivate(table) ? 'userId' : 'createdBy';
    const mine = rows.filter((r) => (r as unknown as Record<string, unknown>)[field] === LOCAL_USER);
    if (!mine.length) continue;
    const now = Date.now();
    await db.transaction('rw', tbl(table), db.outbox, async () => {
      await tbl(table).bulkPut(mine.map((r) => ({ ...r, [field]: userId, updatedAt: Math.max(now, r.updatedAt + 1) })));
      const queued = new Set((await db.outbox.where('table').equals(table).toArray()).map((e) => e.rowId));
      await db.outbox.bulkAdd(mine.filter((r) => !queued.has(r.id)).map((r) => ({ table, rowId: r.id })));
    });
  }
  await setMeta('userId', userId);
}

export async function sync(remote: RemoteApi) {
  const pushed = await push(remote);
  const pulled = await pull(remote);
  await setMeta('lastSyncAt', Date.now());
  return { pushed, pulled };
}
