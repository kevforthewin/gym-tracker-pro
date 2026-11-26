/**
 * Zusammenfassung eines Trainings – reine Funktionen.
 */
import { e1rm } from './metrics';
import { repsAtTop, topWeight, type WorkSet } from './progression';
import type { ExerciseType } from '../model/types';

export interface SummaryExerciseInput {
  stationId: string;
  label: string;
  type: ExerciseType;
  /** gewertete Arbeitssätze dieses Trainings */
  sets: WorkSet[];
  /** frühere Trainings an diesem Gerät (bei Freihantel: alle Gyms), älteste zuerst, gewertete Arbeitssätze */
  history: WorkSet[][];
}

export type Change = 'pr' | 'up' | 'same' | 'down' | 'first';

export interface ExerciseSummary {
  stationId: string;
  label: string;
  change: Change;
  /** z. B. "+2,5 kg", "+2 Wdh.", "−5 kg" */
  detail: string;
  /** kurze Darstellung der heutigen Bestleistung, z. B. "72,5 kg × 8" */
  best: string;
}

export interface SessionSummary {
  exercises: number;
  workSets: number;
  volumeKg: number;
  totalReps: number;
  prs: ExerciseSummary[];
  up: ExerciseSummary[];
  same: ExerciseSummary[];
  down: ExerciseSummary[];
  first: ExerciseSummary[];
}

const fmt = (n: number, d = 1) => n.toLocaleString('de-DE', { maximumFractionDigits: d });
const bestE1rm = (sets: WorkSet[]) => Math.max(0, ...sets.map((s) => e1rm(s.weightKg ?? 0, s.reps ?? 0)));
const maxReps = (sets: WorkSet[]) => Math.max(0, ...sets.map((s) => s.reps ?? 0));
const maxDuration = (sets: WorkSet[]) => Math.max(0, ...sets.map((s) => s.durationSec ?? 0));
const maxDistance = (sets: WorkSet[]) => Math.max(0, ...sets.map((s) => s.distanceM ?? 0));

/** Leistungskennzahl je Training: e1RM, bei reinem Körpergewicht max. Wdh., bei Ausdauer Distanz bzw. Dauer. */
function score(type: ExerciseType, sets: WorkSet[]): number {
  if (type === 'time_distance') return maxDistance(sets) || maxDuration(sets);
  if (type === 'bodyweight' && topWeight(sets) === 0) return maxReps(sets);
  return bestE1rm(sets);
}

function bestSetLabel(type: ExerciseType, sets: WorkSet[]): string {
  if (type === 'time_distance') {
    const d = maxDistance(sets);
    return d ? `${fmt(d / 1000, 2)} km` : `${Math.round(maxDuration(sets) / 60)} min`;
  }
  const top = topWeight(sets);
  const reps = Math.max(0, ...sets.filter((s) => (s.weightKg ?? 0) === top).map((s) => s.reps ?? 0));
  if (type === 'bodyweight' && top === 0) return `${fmt(reps)} Wdh.`;
  return `${fmt(top)} kg × ${fmt(reps)}`;
}

/** Vergleich mit dem letzten Training an diesem Gerät. */
function compareToLast(type: ExerciseType, today: WorkSet[], last: WorkSet[]): { change: Exclude<Change, 'pr' | 'first'>; detail: string } {
  if (type === 'time_distance') {
    const a = score(type, last);
    const b = score(type, today);
    const diff = b - a;
    const unit = maxDistance(today) || maxDistance(last) ? 'km' : 'min';
    const v = unit === 'km' ? fmt(Math.abs(diff) / 1000, 2) : fmt(Math.abs(diff) / 60, 0);
    if (Math.abs(diff) < 1) return { change: 'same', detail: 'wie letztes Mal' };
    return { change: diff > 0 ? 'up' : 'down', detail: `${diff > 0 ? '+' : '−'}${v} ${unit}` };
  }
  const tw = topWeight(today);
  const lw = topWeight(last);
  if (Math.abs(tw - lw) > 1e-9) return { change: tw > lw ? 'up' : 'down', detail: `${tw > lw ? '+' : '−'}${fmt(Math.abs(tw - lw))} kg` };
  // gleiches Gewicht -> Wiederholungen bei diesem Gewicht (gleiche Satzzahl vergleichen)
  const n = Math.min(today.filter((s) => (s.weightKg ?? 0) === tw).length, last.filter((s) => (s.weightKg ?? 0) === lw).length);
  const diff = repsAtTop(today, n) - repsAtTop(last, n);
  if (Math.abs(diff) < 0.5) return { change: 'same', detail: 'wie letztes Mal' };
  return { change: diff > 0 ? 'up' : 'down', detail: `${diff > 0 ? '+' : '−'}${fmt(Math.abs(diff))} Wdh.` };
}

export function summarizeSession(items: SummaryExerciseInput[]): SessionSummary {
  const res: SessionSummary = { exercises: 0, workSets: 0, volumeKg: 0, totalReps: 0, prs: [], up: [], same: [], down: [], first: [] };
  for (const it of items) {
    if (!it.sets.length) continue;
    res.exercises++;
    res.workSets += it.sets.length;
    for (const s of it.sets) {
      res.volumeKg += (s.weightKg ?? 0) * (s.reps ?? 0);
      res.totalReps += s.reps ?? 0;
    }
    const best = bestSetLabel(it.type, it.sets);
    const prev = it.history.filter((h) => h.length);
    if (!prev.length) {
      res.first.push({ stationId: it.stationId, label: it.label, change: 'first', detail: 'erstes Training', best });
      continue;
    }
    const cmp = compareToLast(it.type, it.sets, prev[prev.length - 1]);
    const prevBest = Math.max(...prev.map((h) => score(it.type, h)));
    const now = score(it.type, it.sets);
    const entry = { stationId: it.stationId, label: it.label, best, ...cmp };
    if (now > prevBest + 1e-9) res.prs.push({ ...entry, change: 'pr' });
    else res[cmp.change].push(entry);
  }
  res.volumeKg = Math.round(res.volumeKg);
  return res;
}
