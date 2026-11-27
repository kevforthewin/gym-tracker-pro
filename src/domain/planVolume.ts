/**
 * Wochenvolumen eines Plans je Muskel: Arbeitssätze pro Woche.
 * Hauptmuskel zählt voll, Nebenmuskeln halb. Empfehlung: 10–20 Sätze pro Muskel und Woche,
 * kleine Muskeln (Bauch, Waden, Nacken …) 4–16.
 */
import { secondaryOf } from './muscles';

export const VOLUME_RANGE = { min: 10, max: 20 };
/** Kleine Muskeln, die durch Grundübungen viel mitbekommen: niedrigerer Bereich, kein Hinweis wenn 0 */
export const MINOR_RANGE = { min: 4, max: 16 };
const MINOR = new Set(['Bauch', 'Waden', 'Nacken', 'Unterer Rücken', 'Adduktoren', 'Abduktoren']);
export const rangeOf = (muscle: string) => (MINOR.has(muscle) ? MINOR_RANGE : VOLUME_RANGE);
export const isMinor = (muscle: string) => MINOR.has(muscle);

/** Muskelgruppen in fester Anzeigereihenfolge (gleiche Namen wie an den Übungen) */
export const MUSCLE_ORDER = [
  'Brust',
  'Schultern',
  'Hintere Schulter',
  'Rücken',
  'Nacken',
  'Bizeps',
  'Trizeps',
  'Bauch',
  'Unterer Rücken',
  'Quadrizeps',
  'Beinbeuger',
  'Gesäß',
  'Adduktoren',
  'Abduktoren',
  'Waden',
];

/** Synonyme zusammenführen */
const CANON: Record<string, string> = { Beine: 'Quadrizeps', Rotatorenmanschette: 'Hintere Schulter', Core: 'Bauch' };
export const canonMuscle = (m: string) => CANON[m] ?? m;
const canon = canonMuscle;

export interface VolumeInput {
  /** Trainingstage des Plans mit ihren Übungen */
  days: { items: { exerciseId: string; muscle?: string; sets: number }[] }[];
  /** Trainings pro Woche (Wochenziel) */
  perWeek: number;
}

export interface MuscleVolume {
  muscle: string;
  sets: number;
  status: 'low' | 'ok' | 'high';
  min: number;
  max: number;
  minor: boolean;
}

export function planVolume({ days, perWeek }: VolumeInput): MuscleVolume[] {
  if (!days.length) return [];
  // Wie oft wird jeder Tag pro Woche trainiert? (Rotation durch alle Tage)
  const factor = perWeek / days.length;
  const sum = new Map<string, number>();
  const add = (m: string, v: number) => sum.set(canon(m), (sum.get(canon(m)) ?? 0) + v);
  for (const d of days)
    for (const it of d.items) {
      if (!it.muscle || it.muscle === 'Cardio') continue;
      add(it.muscle, it.sets * factor);
      for (const s of secondaryOf(it.exerciseId)) add(s, it.sets * factor * 0.5);
    }
  return MUSCLE_ORDER.map((muscle) => {
    const sets = Math.round((sum.get(muscle) ?? 0) * 2) / 2;
    const { min, max } = rangeOf(muscle);
    return { muscle, sets, min, max, minor: MINOR.has(muscle), status: sets < min ? 'low' : sets > max ? 'high' : 'ok' } as MuscleVolume;
  });
}
