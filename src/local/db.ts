/**
 * Lokale Datenbank (IndexedDB via Dexie). Die App liest und schreibt IMMER lokal –
 * dadurch funktioniert sie offline. Änderungen landen zusätzlich in der `outbox`
 * und werden vom Sync-Modul zu Supabase übertragen.
 */
import Dexie, { type EntityTable } from 'dexie';
import { CATALOG_EXERCISES, CATALOG_GYMS, CATALOG_MANUFACTURERS, CATALOG_MODELS, LEGACY_MODEL_ALIAS } from '../catalog/catalog';
import {
  PRIVATE_TABLES,
  type BodyweightEntry,
  type CardioEntry,
  type EquipmentModel,
  type Exercise,
  type Gym,
  type GymMachine,
  type MachineNote,
  type Manufacturer,
  type Plan,
  type PlanDay,
  type PlanDayExercise,
  type PrivateTable,
  type Row,
  type Session,
  type SetEntry,
  type SyncTable,
  type UserGym,
} from '../model/types';

export interface OutboxEntry {
  seq?: number;
  table: SyncTable;
  rowId: string;
}

export interface Meta {
  key: string;
  value: unknown;
}

export const LOCAL_USER = 'local';

export class AppDB extends Dexie {
  manufacturers!: EntityTable<Manufacturer, 'id'>;
  equipmentModels!: EntityTable<EquipmentModel, 'id'>;
  exercises!: EntityTable<Exercise, 'id'>;
  gyms!: EntityTable<Gym, 'id'>;
  gymMachines!: EntityTable<GymMachine, 'id'>;
  userGyms!: EntityTable<UserGym, 'id'>;
  machineNotes!: EntityTable<MachineNote, 'id'>;
  plans!: EntityTable<Plan, 'id'>;
  planDays!: EntityTable<PlanDay, 'id'>;
  planDayExercises!: EntityTable<PlanDayExercise, 'id'>;
  sessions!: EntityTable<Session, 'id'>;
  sets!: EntityTable<SetEntry, 'id'>;
  bodyweights!: EntityTable<BodyweightEntry, 'id'>;
  cardio!: EntityTable<CardioEntry, 'id'>;
  outbox!: EntityTable<OutboxEntry, 'seq'>;
  meta!: EntityTable<Meta, 'key'>;

  constructor(name = 'gym-tracker-pro') {
    super(name);
    this.version(1).stores({
      manufacturers: 'id, name',
      equipmentModels: 'id, manufacturerId, exerciseId',
      exercises: 'id, name',
      gyms: 'id, name, city',
      gymMachines: 'id, gymId, exerciseId, modelId',
      userGyms: 'id, gymId, userId',
      machineNotes: 'id, machineId, userId',
      plans: 'id, userId',
      planDays: 'id, planId',
      planDayExercises: 'id, planDayId, exerciseId',
      sessions: 'id, startedAt, gymId, planDayId, userId',
      sets: 'id, sessionId, machineId, exerciseId, [exerciseId+createdAt], userId',
      bodyweights: 'id, date',
      cardio: 'id, date',
      outbox: '++seq, table, [table+rowId]',
      meta: 'key',
    });
  }
}

export let db = new AppDB();

/** Nur für Tests: frische DB */
export async function resetDb(name = `test-${Math.random()}`) {
  db.close();
  db = new AppDB(name);
  await seedCatalog();
  return db;
}

export const isPrivate = (t: SyncTable): t is PrivateTable => (PRIVATE_TABLES as readonly string[]).includes(t);

export async function getMeta<T>(key: string): Promise<T | undefined> {
  return (await db.meta.get(key))?.value as T | undefined;
}
export const setMeta = (key: string, value: unknown) => db.meta.put({ key, value });

export async function currentUserId(): Promise<string> {
  return (await getMeta<string>('userId')) ?? LOCAL_USER;
}

export const uid = () => crypto.randomUUID();
export const alive = <T extends Row>(r: T | undefined): r is T => !!r && !r.deletedAt;

/** Katalog lokal bereitstellen (überschreibt keine neueren Nutzer-Änderungen). */
export const CATALOG_VERSION = 3;

/**
 * Katalog lokal bereitstellen bzw. aktualisieren.
 * Katalogzeilen (ohne Ersteller) werden überschrieben, von Nutzern angelegte bleiben unberührt.
 * Ab Version 2: generierte Modelle der geprüften Hersteller werden auf echte Modelle umgestellt.
 */
export async function seedCatalog() {
  if ((await getMeta<number>('catalogVersion')) === CATALOG_VERSION) return;
  await db.transaction('rw', [db.manufacturers, db.equipmentModels, db.exercises, db.gyms, db.gymMachines, db.meta], async () => {
    for (const [table, rows] of [
      [db.manufacturers, CATALOG_MANUFACTURERS],
      [db.equipmentModels, CATALOG_MODELS],
      [db.exercises, CATALOG_EXERCISES],
      [db.gyms, CATALOG_GYMS],
    ] as const) {
      const t = table as EntityTable<Row & { createdBy?: string }, 'id'>;
      const existing = new Map((await t.toArray()).map((r) => [r.id, r]));
      // nur Katalogzeilen schreiben – nie eine Zeile, die ein Nutzer angelegt hat
      await t.bulkPut((rows as Row[]).filter((r) => !existing.get(r.id)?.createdBy));
    }
    // Geräte, die auf ein altes, generiertes Modell zeigen, umstellen (lokal, ohne Sync – der Server macht dasselbe per SQL)
    const old = Object.keys(LEGACY_MODEL_ALIAS);
    const machines = await db.gymMachines.where('modelId').anyOf(old).toArray();
    for (const m of machines) await db.gymMachines.update(m.id, { modelId: LEGACY_MODEL_ALIAS[m.modelId!] ?? undefined });
    await db.equipmentModels.bulkDelete(old);
    await setMeta('catalogVersion', CATALOG_VERSION);
  });
}

export interface TableRows {
  manufacturers: Manufacturer;
  equipmentModels: EquipmentModel;
  exercises: Exercise;
  gyms: Gym;
  gymMachines: GymMachine;
  userGyms: UserGym;
  machineNotes: MachineNote;
  plans: Plan;
  planDays: PlanDay;
  planDayExercises: PlanDayExercise;
  sessions: Session;
  sets: SetEntry;
  bodyweights: BodyweightEntry;
  cardio: CardioEntry;
}
type RowOf<T extends SyncTable> = TableRows[T];
type Input<T extends SyncTable> = Omit<RowOf<T>, 'updatedAt' | 'userId' | 'id'> & { id?: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableOf = <T extends SyncTable>(t: T) => db[t] as unknown as Dexie.Table<any, string>;

/** Anlegen/Ändern einer Zeile: setzt updatedAt (+ userId bei privaten Tabellen) und merkt sie für den Sync vor. */
export async function save<T extends SyncTable>(table: T, input: Input<T>): Promise<RowOf<T>> {
  const userId = await currentUserId();
  const row = {
    ...input,
    id: input.id ?? uid(),
    updatedAt: Date.now(),
    ...(isPrivate(table) ? { userId } : { createdBy: (input as { createdBy?: string }).createdBy ?? userId }),
  } as unknown as RowOf<T>;
  await db.transaction('rw', tableOf(table), db.outbox, async () => {
    await tableOf(table).put(row);
    await enqueue(table, row.id);
  });
  return row;
}

/** Teil-Update einer bestehenden Zeile. */
export async function patch<T extends SyncTable>(table: T, id: string, changes: Partial<RowOf<T>>) {
  await db.transaction('rw', tableOf(table), db.outbox, async () => {
    const cur = await tableOf(table).get(id);
    if (!cur) return;
    await tableOf(table).put({ ...cur, ...changes, updatedAt: Math.max(Date.now(), cur.updatedAt + 1) });
    await enqueue(table, id);
  });
}

/** Soft-Delete (damit die Löschung synchronisiert werden kann). */
export const remove = <T extends SyncTable>(table: T, id: string) =>
  patch(table, id, { deletedAt: Date.now() } as unknown as Partial<RowOf<T>>);

async function enqueue(table: SyncTable, rowId: string) {
  const dup = await db.outbox.where('[table+rowId]').equals([table, rowId]).first();
  if (!dup) await db.outbox.add({ table, rowId });
}

/** Alle nicht gelöschten Zeilen einer Tabelle */
export async function all<T extends SyncTable>(table: T): Promise<RowOf<T>[]> {
  return (await tableOf(table).toArray()).filter((r: Row) => !r.deletedAt) as RowOf<T>[];
}
