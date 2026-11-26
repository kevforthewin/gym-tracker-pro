/**
 * Historie in drei Ebenen – der Kern des Produkts.
 *
 * ① machine   – genau dieses Gerät in diesem Gym
 * ② model     – gleiches Herstellermodell in anderen Gyms (vergleichbare Gewichte)
 * ③ exercise  – gleiche Übung, egal welches Gerät (nur Orientierung)
 *
 * Freihantel/Körpergewicht: Gewichte sind überall gleich → Ebene „free“ (über alle Gyms, gilt wie ①).
 */
import type { SessionHistory, WorkSet } from './progression';

export type HistoryLevel = 'machine' | 'model' | 'exercise' | 'free';

export interface HistMachine {
  id: string;
  gymId: string;
  exerciseId: string;
  modelId?: string;
}

export interface HistSet extends WorkSet {
  sessionId: string;
  machineId?: string;
  exerciseId: string;
  date: number;
  setIndex: number;
  /** Aufwärm- und „zählt nicht“-Sätze werden vorher herausgefiltert */
}

export interface LeveledHistory {
  level: HistoryLevel;
  /** Sessions, älteste zuerst */
  sessions: (SessionHistory & { sessionId: string; machineId?: string; gymId?: string })[];
}

export const LEVEL_LABEL: Record<HistoryLevel, string> = {
  machine: 'dieses Gerät',
  model: 'gleiches Modell',
  exercise: 'Übung allgemein',
  free: 'Freihantel · alle Gyms',
};

/** Ob Werte der Ebene als Ziel/Vorbefüllung taugen (Gewichte vergleichbar). */
export const LEVEL_COMPARABLE: Record<HistoryLevel, boolean> = { machine: true, model: true, exercise: false, free: true };

function group(sets: HistSet[], machines: Map<string, HistMachine>): LeveledHistory['sessions'] {
  const by = new Map<string, HistSet[]>();
  for (const s of sets) {
    const k = `${s.sessionId}|${s.machineId ?? ''}`;
    by.set(k, [...(by.get(k) ?? []), s]);
  }
  return [...by.values()]
    .map((list) => {
      list.sort((a, b) => a.setIndex - b.setIndex);
      const m = list[0].machineId ? machines.get(list[0].machineId) : undefined;
      return {
        sessionId: list[0].sessionId,
        machineId: list[0].machineId,
        gymId: m?.gymId,
        date: Math.min(...list.map((s) => s.date)),
        sets: list.map(({ weightKg, reps, durationSec, distanceM }) => ({ weightKg, reps, durationSec, distanceM })),
      };
    })
    .sort((a, b) => a.date - b.date);
}

/**
 * Liefert alle drei Ebenen für ein Gerät (bzw. eine Übung bei Freihantel).
 * `sets` = alle gewerteten Arbeitssätze des Nutzers (ggf. vorgefiltert auf die Übung).
 */
export function historyLevels(
  target: { machine?: HistMachine; exerciseId: string; freeWeight?: boolean },
  sets: HistSet[],
  machines: HistMachine[],
  excludeSessionId?: string,
): Record<HistoryLevel, LeveledHistory> {
  const mMap = new Map(machines.map((m) => [m.id, m]));
  const relevant = sets.filter((s) => s.exerciseId === target.exerciseId && s.sessionId !== excludeSessionId);
  const machine = target.machine;
  const sameMachine = machine ? relevant.filter((s) => s.machineId === machine.id) : [];
  const sameModel = machine?.modelId
    ? relevant.filter((s) => s.machineId && s.machineId !== machine.id && mMap.get(s.machineId)?.modelId === machine.modelId)
    : [];
  return {
    machine: { level: 'machine', sessions: group(sameMachine, mMap) },
    model: { level: 'model', sessions: group(sameModel, mMap) },
    exercise: { level: 'exercise', sessions: group(relevant, mMap) },
    free: { level: 'free', sessions: target.freeWeight ? group(relevant, mMap) : [] },
  };
}

/**
 * Beste Ebene für Ziel und Vorbefüllung:
 * Freihantel → free; sonst Gerät, wenn vorhanden; sonst gleiches Modell; sonst nichts Vergleichbares.
 * Die Übungs-Ebene wird nur zur Orientierung angezeigt, nicht als Ziel genutzt.
 */
export function bestLevel(levels: Record<HistoryLevel, LeveledHistory>, freeWeight?: boolean): LeveledHistory | null {
  if (freeWeight) return levels.free.sessions.length ? levels.free : null;
  if (levels.machine.sessions.length) return levels.machine;
  if (levels.model.sessions.length) return levels.model;
  return null;
}
