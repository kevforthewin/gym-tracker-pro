import { all, save } from '../local/db';
import type { SyncTable } from '../model/types';
import { isLegacyBackup, planImport } from './legacyBackup';

/** Backup der alten App einlesen und als eigene Daten speichern (werden beim nächsten Sync hochgeladen). */
export async function importLegacy(json: unknown) {
  if (!isLegacyBackup(json)) throw new Error('Keine Backup-Datei der bisherigen App (Gym Progress Tracker).');
  const plan = planImport(json, await all('exercises'));
  for (const e of plan.exercises) await save('exercises', e);
  const order: SyncTable[] = [
    'gyms',
    'userGyms',
    'gymMachines',
    'machineNotes',
    'plans',
    'planDays',
    'planDayExercises',
    'sessions',
    'sets',
    'bodyweights',
    'cardio',
  ];
  let n = 0;
  for (const table of order) {
    for (const row of plan.rows[table as keyof typeof plan.rows]) {
      await save(table, row as never);
      n++;
    }
  }
  return { ...plan.stats, rows: n, sessions: plan.rows.sessions.length, sets: plan.rows.sets.length };
}
