/** Umwandlung lokale Zeile (camelCase, ms-Zeitstempel) ↔ Supabase-Zeile (snake_case). */
import type { SyncTable } from '../model/types';

export const REMOTE_TABLE: Record<SyncTable, string> = {
  manufacturers: 'manufacturers',
  equipmentModels: 'equipment_models',
  exercises: 'exercises',
  gyms: 'gyms',
  gymMachines: 'gym_machines',
  userGyms: 'user_gyms',
  machineNotes: 'machine_notes',
  plans: 'plans',
  planDays: 'plan_days',
  planDayExercises: 'plan_day_exercises',
  sessions: 'sessions',
  sets: 'sets',
  bodyweights: 'bodyweights',
  cardio: 'cardio',
};

/** Spalten, deren Name in SQL reserviert ist */
const RENAME: Record<string, string> = { order: 'sort_order' };
const RENAME_BACK = Object.fromEntries(Object.entries(RENAME).map(([a, b]) => [b, a]));

const snake = (k: string) => RENAME[k] ?? k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const camel = (k: string) => RENAME_BACK[k] ?? k.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/** Felder, die nur auf dem Server existieren */
const SERVER_ONLY = new Set(['server_updated_at']);

export function toRemote(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[snake(k)] = v === undefined ? null : v;
  return out;
}

export function fromRemote(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (SERVER_ONLY.has(k) || v === null) continue;
    out[camel(k)] = v;
  }
  return out;
}
