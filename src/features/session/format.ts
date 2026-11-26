import type { ExerciseType } from '../../model/types';
import type { WorkSet } from '../../domain/progression';
import { fmtDistance, fmtDuration, fmtNumber } from '../../domain/units';

export function fmtSet(type: ExerciseType, s: WorkSet): string {
  if (type === 'time_distance') {
    const parts = [s.durationSec !== undefined ? fmtDuration(s.durationSec) : '', s.distanceM ? fmtDistance(s.distanceM) : ''];
    return parts.filter(Boolean).join(' · ') || '–';
  }
  const w = s.weightKg;
  const reps = s.reps === undefined ? '?' : fmtNumber(s.reps, 1);
  if (type === 'bodyweight') return w ? `KG+${fmtNumber(w)} × ${reps}` : `KG × ${reps}`;
  return w === undefined ? `${reps} Wdh.` : `${fmtNumber(w)} kg × ${reps}`;
}
