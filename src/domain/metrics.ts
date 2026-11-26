import type { WorkSet } from './progression';

/** Geschätztes 1RM nach Epley. */
export function e1rm(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export interface SessionMetrics {
  date: number;
  topWeight: number;
  bestE1rm: number;
  volume: number;
  totalReps: number;
  maxReps: number;
  maxDurationSec: number;
  maxDistanceM: number;
}

export function sessionMetrics(date: number, sets: WorkSet[]): SessionMetrics {
  let topWeight = 0;
  let bestE1rm = 0;
  let volume = 0;
  let totalReps = 0;
  let maxReps = 0;
  let maxDurationSec = 0;
  let maxDistanceM = 0;
  for (const s of sets) {
    const w = s.weightKg ?? 0;
    const r = s.reps ?? 0;
    topWeight = Math.max(topWeight, w);
    bestE1rm = Math.max(bestE1rm, e1rm(w, r));
    volume += w * r;
    totalReps += r;
    maxReps = Math.max(maxReps, r);
    maxDurationSec = Math.max(maxDurationSec, s.durationSec ?? 0);
    maxDistanceM = Math.max(maxDistanceM, s.distanceM ?? 0);
  }
  return {
    date,
    topWeight,
    bestE1rm,
    volume: Math.round(volume * 10) / 10,
    totalReps,
    maxReps,
    maxDurationSec,
    maxDistanceM,
  };
}

export type PrKey = 'topWeight' | 'bestE1rm' | 'volume' | 'maxReps' | 'maxDurationSec' | 'maxDistanceM';

export interface PersonalRecord {
  key: PrKey;
  value: number;
  date: number;
}

/** Liefert je Kennzahl den Bestwert (erste Session, in der er erreicht wurde). */
export function personalRecords(series: SessionMetrics[], keys: PrKey[]): PersonalRecord[] {
  return keys
    .map((key) => {
      let best: PersonalRecord | undefined;
      for (const m of series) {
        if (m[key] > 0 && (!best || m[key] > best.value)) best = { key, value: m[key], date: m.date };
      }
      return best;
    })
    .filter((r): r is PersonalRecord => !!r);
}

/** Sessions (Daten), in denen ein neuer Bestwert für `key` erreicht wurde. */
export function prDates(series: SessionMetrics[], key: PrKey): Set<number> {
  const out = new Set<number>();
  let best = 0;
  for (const m of series) {
    if (m[key] > best) {
      if (best > 0) out.add(m.date);
      best = m[key];
    }
  }
  return out;
}
