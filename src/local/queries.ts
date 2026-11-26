/** Lese-Abfragen für die Oberfläche (alle lokal, offline-fähig). */
import { modelTitle } from '../catalog/catalog';
import { bestLevel, historyLevels, type HistMachine, type HistSet, type HistoryLevel, type LeveledHistory } from '../domain/history';
import { computeTarget, type Prescription, type Target } from '../domain/progression';
import type { EquipmentModel, Exercise, Gym, GymMachine, Manufacturer, PlanDayExercise, SetEntry } from '../model/types';
import { alive, all, db, save } from './db';

export const counted = (s: SetEntry) => !s.isWarmup && !s.excluded && !s.deletedAt;

export async function myGyms(): Promise<Gym[]> {
  const links = await all('userGyms');
  const gyms = await db.gyms.bulkGet(links.map((l) => l.gymId));
  return gyms.filter(alive).sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export async function addMyGym(gymId: string) {
  const exists = (await all('userGyms')).find((l) => l.gymId === gymId);
  if (!exists) await save('userGyms', { gymId });
}

/** Geteilte Gyms durchsuchen (Name, Kette, Stadt) */
export async function searchGyms(q: string): Promise<Gym[]> {
  const t = q.trim().toLowerCase();
  const gyms = await all('gyms');
  if (!t) return gyms.slice(0, 30);
  return gyms.filter((g) => [g.name, g.chain, g.city, g.address].some((x) => x?.toLowerCase().includes(t))).slice(0, 30);
}

export interface MachineView extends GymMachine {
  exercise?: Exercise;
  model?: EquipmentModel;
  manufacturer?: Manufacturer;
  modelTitle?: string;
}

export async function machineViews(machines: GymMachine[]): Promise<MachineView[]> {
  const [ex, models, mfs] = await Promise.all([all('exercises'), all('equipmentModels'), all('manufacturers')]);
  const exM = new Map(ex.map((e) => [e.id, e]));
  const moM = new Map(models.map((m) => [m.id, m]));
  const mfM = new Map(mfs.map((m) => [m.id, m]));
  return machines.map((m) => {
    const model = m.modelId ? moM.get(m.modelId) : undefined;
    const manufacturer = model ? mfM.get(model.manufacturerId) : undefined;
    return { ...m, exercise: exM.get(m.exerciseId), model, manufacturer, modelTitle: model ? modelTitle(model, manufacturer) : undefined };
  });
}

export async function gymMachines(gymId: string): Promise<MachineView[]> {
  const ms = (await db.gymMachines.where('gymId').equals(gymId).toArray()).filter(alive);
  return machineViews(ms);
}

/** Katalogsuche: alle Wörter müssen in „Hersteller Linie Gerät“ vorkommen */
export async function searchModels(q: string, exerciseId?: string): Promise<(EquipmentModel & { title: string })[]> {
  const [models, mfs, exercises] = await Promise.all([all('equipmentModels'), all('manufacturers'), all('exercises')]);
  const mfM = new Map(mfs.map((m) => [m.id, m]));
  const exName = new Map(exercises.map((e) => [e.id, e.name]));
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return models
    .filter((m) => !exerciseId || m.exerciseId === exerciseId)
    .map((m) => ({ ...m, title: modelTitle(m, mfM.get(m.manufacturerId)) }))
    .filter((m) => words.every((w) => `${m.title} ${exName.get(m.exerciseId ?? '') ?? ''}`.toLowerCase().includes(w)))
    // geprüfte Herstellermodelle zuerst
    .sort((a, b) => Number(!!b.verified) - Number(!!a.verified) || a.title.localeCompare(b.title, 'de'))
    .slice(0, 60);
}

/** Alle gewerteten Sätze einer Übung als Historien-Sätze */
export async function exerciseHistSets(exerciseId: string): Promise<HistSet[]> {
  const sets = (await db.sets.where('exerciseId').equals(exerciseId).toArray()).filter(counted);
  const sessions = new Map((await db.sessions.bulkGet([...new Set(sets.map((s) => s.sessionId))])).filter(alive).map((s) => [s.id, s]));
  return sets
    .filter((s) => sessions.has(s.sessionId))
    .map((s) => ({
      sessionId: s.sessionId,
      machineId: s.machineId,
      exerciseId: s.exerciseId,
      setIndex: s.setIndex,
      date: sessions.get(s.sessionId)!.startedAt,
      weightKg: s.weightKg,
      reps: s.reps,
      durationSec: s.durationSec,
      distanceM: s.distanceM,
    }));
}

export async function allHistMachines(): Promise<HistMachine[]> {
  return (await db.gymMachines.toArray()).map(({ id, gymId, exerciseId, modelId }) => ({ id, gymId, exerciseId, modelId }));
}

export interface TargetInfo {
  levels: Record<HistoryLevel, LeveledHistory>;
  used: LeveledHistory | null;
  target: Target;
}

/** Ziel fürs nächste Training an einem Gerät (bzw. Freihantel) inkl. verwendeter Historien-Ebene */
export async function targetFor(args: {
  exercise: Exercise;
  machine?: GymMachine;
  prescription: Prescription;
  excludeSessionId?: string;
  startWeightKg?: number;
}): Promise<TargetInfo> {
  const [sets, machines] = await Promise.all([exerciseHistSets(args.exercise.id), allHistMachines()]);
  const levels = historyLevels(
    { machine: args.machine, exerciseId: args.exercise.id, freeWeight: args.exercise.freeWeight || !args.machine },
    sets,
    machines,
    args.excludeSessionId,
  );
  const used = bestLevel(levels, args.exercise.freeWeight || !args.machine);
  const target = computeTarget({
    type: args.exercise.type,
    prescription: args.prescription,
    increment: args.machine?.weightStepKg ?? 2.5,
    steps: args.machine?.weightSteps,
    startWeight: args.startWeightKg,
    history: used?.sessions ?? [],
  });
  return { levels, used, target };
}

export const prescriptionOf = (p?: PlanDayExercise): Prescription =>
  p
    ? { sets: p.sets, repMin: p.repMin, repMax: p.repMax, targetDurationSec: p.targetDurationSec, targetDistanceM: p.targetDistanceM }
    : { sets: 3, repMin: 8, repMax: 12 };

/** Zuletzt in diesem Gym für die Übung genutztes Gerät */
export async function lastMachineFor(gymId: string, exerciseId: string): Promise<string | undefined> {
  const machines = (await db.gymMachines.where('gymId').equals(gymId).toArray()).filter((m) => alive(m) && m.exerciseId === exerciseId);
  if (machines.length <= 1) return machines[0]?.id;
  const ids = new Set(machines.map((m) => m.id));
  const sets = (await db.sets.where('exerciseId').equals(exerciseId).toArray()).filter((s) => s.machineId && ids.has(s.machineId));
  sets.sort((a, b) => b.createdAt - a.createdAt);
  return sets[0]?.machineId ?? machines[0].id;
}
