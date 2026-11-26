/**
 * Deload-Wochen: alle N Wochen eine leichtere Woche (weniger Sätze, ~10 % weniger Gewicht).
 * Deload-Trainings zählen nicht für die Progression – danach geht es mit dem alten Ziel weiter.
 */
import { addWeeks, weekStart } from './insights';
import { floorToStep, roundToIncrement, type Target } from './progression';

export const DELOAD_WEIGHT = 0.9;

export interface DeloadOverride {
  /** Wochenbeginn (ms), für die die manuelle Einstellung gilt */
  week: number;
  on: boolean;
}

/** Wochen seit Planstart (0 = erste Woche) */
export const weekIndex = (planStart: number, now = Date.now()) =>
  Math.round((weekStart(now) - weekStart(planStart)) / (7 * 86400000));

/** Ist diese Woche eine Deload-Woche? */
export function isDeloadWeek(args: { every?: number; planStart?: number; override?: DeloadOverride | null; now?: number }): boolean {
  const now = args.now ?? Date.now();
  if (args.override && args.override.week === weekStart(now)) return args.override.on;
  if (!args.every || args.every < 2 || args.planStart === undefined) return false;
  return (weekIndex(args.planStart, now) + 1) % args.every === 0;
}

/** Beginn der nächsten automatischen Deload-Woche (oder undefined) */
export function nextDeloadWeek(every: number | undefined, planStart: number | undefined, now = Date.now()): number | undefined {
  if (!every || every < 2 || planStart === undefined) return undefined;
  const i = weekIndex(planStart, now);
  const k = Math.ceil((i + 1) / every) * every - 1; // Index der nächsten Deload-Woche (≥ i)
  return addWeeks(weekStart(now), k - i);
}

/** Ziel für eine Deload-Woche: ein Drittel weniger Sätze, ~10 % weniger Gewicht */
export function applyDeload(target: Target, increment: number, steps?: number[]): Target {
  if (!target.sets.length) return target;
  const n = Math.max(1, Math.round((target.sets.length * 2) / 3));
  return {
    reason: 'deload',
    message: 'Deload-Woche: weniger Sätze und etwa 10 % leichter – Erholung, kein Rekordversuch.',
    sets: target.sets.slice(0, n).map((s) => ({
      ...s,
      // auf den nächsten möglichen Gewichtsschritt (bei festen Stufen: die nächstniedrigere)
      weightKg: s.weightKg ? (steps?.length ? floorToStep(s.weightKg * DELOAD_WEIGHT, increment, steps) : roundToIncrement(s.weightKg * DELOAD_WEIGHT, increment)) : s.weightKg,
    })),
  };
}
