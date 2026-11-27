import { existsSync, readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { CATALOG_EXERCISES } from '../catalog/catalog';
import { all, db, resetDb } from '../local/db';
import { targetFor } from '../local/queries';
import { importLegacy } from './applyImport';
import { matchCatalog, planImport, type LegacyBackup } from './legacyBackup';

const backup: LegacyBackup = {
  format: 'gym-progress-tracker',
  version: 3,
  tables: {
    gyms: [
      { id: 'g1', name: 'EVO' },
      { id: 'g2', name: 'IRON' },
    ],
    exercises: [
      { id: 'e1', name: 'Latzug Matrix', type: 'weight_reps' },
      { id: 'e2', name: 'Beinstrecker (links)', type: 'weight_reps' },
      { id: 'e3', name: 'Kurzhantel Incline Curl', type: 'weight_reps', sharedAcrossGyms: true },
      { id: 'e4', name: 'Irgendwas Exotisches', type: 'weight_reps', muscleGroup: 'Bauch' },
    ],
    stations: [
      { id: 's1', gymId: 'g1', exerciseId: 'e1', name: 'Latzug Matrix', weightIncrement: 5, settingsNote: 'Polster 3' },
      { id: 's2', gymId: 'g1', exerciseId: 'e2', name: 'Beinstrecker (links)', weightIncrement: 2.5 },
      { id: 's3', gymId: 'g2', exerciseId: 'e3', name: 'KH Curl', weightIncrement: 2 },
      { id: 's4', gymId: 'g1', exerciseId: 'e3', name: 'KH Curl', weightIncrement: 2 },
    ],
    plans: [{ id: 'p1', name: 'PPL', order: 0 }],
    planDays: [{ id: 'd1', planId: 'p1', name: 'Pull', order: 0 }],
    planDayExercises: [{ id: 'x1', planDayId: 'd1', exerciseId: 'e1', order: 0, sets: 3, repMin: 8, repMax: 12 }],
    sessions: [
      { id: 'a', gymId: 'g1', planDayId: 'd1', startedAt: 1000 },
      { id: 'b', gymId: 'g2', startedAt: 2000 },
    ],
    sets: [
      { id: 'z1', sessionId: 'a', stationId: 's1', exerciseId: 'e1', setIndex: 1, weightKg: 50, reps: 12, isWarmup: false, createdAt: 1000 },
      { id: 'z2', sessionId: 'a', stationId: 's1', exerciseId: 'e1', setIndex: 2, weightKg: 50, reps: 12, isWarmup: false, createdAt: 1001 },
      { id: 'z3', sessionId: 'a', stationId: 's1', exerciseId: 'e1', setIndex: 3, weightKg: 50, reps: 12, isWarmup: false, createdAt: 1002 },
      { id: 'z4', sessionId: 'b', stationId: 's3', exerciseId: 'e3', setIndex: 1, weightKg: 14, reps: 10, isWarmup: false, createdAt: 2000 },
    ],
  },
};

describe('Import aus der alten App', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('ordnet Übungen dem Katalog zu', () => {
    expect(matchCatalog('Latzug alte Maschine')).toBe('lat-pulldown');
    expect(matchCatalog('Reverse Butterfly')).toBe('reverse-fly');
    expect(matchCatalog('Multi Pec')).toBe('lateral-raise-machine');
    expect(matchCatalog('Pec Fly')).toBe('butterfly');
    expect(matchCatalog('Butterfly Matrix')).toBe('butterfly');
    expect(matchCatalog('Schrägbankdrücken Kurzhantel 30°')).toBe('db-incline-press');
    expect(matchCatalog('Trizeps Overhead Kabel')).toBe('overhead-triceps');
    expect(matchCatalog('Beinbeuger kniend (links)')).toBe('leg-curl-lying');
    const p = planImport(backup, CATALOG_EXERCISES);
    expect(p.exerciseMap.get('e1')).toBe('lat-pulldown');
    expect(p.exerciseMap.get('e3')).toBe('db-curl');
    // seitengetrennt + unbekannt → eigene Übungen
    expect(p.exercises.map((e) => e.name)).toEqual(['Beinstrecker (links)', 'Irgendwas Exotisches']);
    expect(p.exercises[0].split).toBe('legs');
  });

  it('übernimmt Gyms, Geräte, Pläne und Trainings – Ziel funktioniert danach', async () => {
    const r = await importLegacy(backup);
    expect(r.sessions).toBe(2);
    expect((await all('userGyms')).length).toBe(2);
    expect((await all('machineNotes'))[0].note).toBe('Polster 3');
    const machine = await db.gymMachines.get('s1');
    expect(machine?.exerciseId).toBe('lat-pulldown');
    const ex = (await db.exercises.get('lat-pulldown'))!;
    const info = await targetFor({ exercise: ex, machine: machine!, prescription: { sets: 3, repMin: 8, repMax: 12 } });
    expect(info.used?.level).toBe('machine');
    expect(info.target.reason).toBe('increase');
    expect(info.target.sets[0].weightKg).toBe(55);
    // Freihantel: Gym 1 nutzt Historie aus Gym 2
    const curl = (await db.exercises.get('db-curl'))!;
    const c = await targetFor({ exercise: curl, machine: (await db.gymMachines.get('s4'))!, prescription: { sets: 3, repMin: 8, repMax: 12 } });
    expect(c.used?.level).toBe('free');
    // erneuter Import erzeugt keine Duplikate
    await importLegacy(backup);
    expect((await all('sessions')).length).toBe(2);
    expect((await all('sets')).length).toBe(4);
  });

  // Optional: echtes Backup (liegt nur lokal, wird nie committet)
  const real = process.env.LEGACY_BACKUP;
  it.runIf(!!real && existsSync(real!))('echtes Backup lässt sich importieren', async () => {
    const json = JSON.parse(readFileSync(real!, 'utf8'));
    const r = await importLegacy(json);
    console.log('Import:', r, 'eigene Übungen:', planImport(json, CATALOG_EXERCISES).exercises.map((e) => e.name));
    expect(r.sessions).toBeGreaterThan(0);
  });
});
