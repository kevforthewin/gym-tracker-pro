/**
 * Sinnvolle Gewichtsschritte je Übung – relativ zum aktuellen Gewicht.
 *
 * Problem: Eine feste Gerätestufe (z. B. 2,2 kg am Kabelzug) ist bei 6 kg Seitheben ein Sprung von +37 %,
 * bei 60 kg Latzug nur +4 %. Deshalb wird der Schritt nach Übungsart begrenzt:
 *  - Isolation (Seitheben, Curls, Trizeps, Fly, Beinstrecker …): höchstens ~17 %  → 6 kg → +1 kg
 *  - Grundübung Oberkörper (Drücken, Rudern, Latzug …):           höchstens ~10 %
 *  - Grundübung Beine (Beinpresse, Kniebeuge …):                   höchstens ~10 %, ab 100 kg 5 kg
 * Der Schritt wird auf „runde“ Werte gelegt (0,5 · 1 · 2 · 2,5 · 5 · 10 kg) und ist nie größer als die Gerätestufe.
 * Kurzhanteln: bis 10 kg in 1-kg-Schritten, darüber die Gerätestufe (Standard 2,5 kg).
 */
export type LoadClass = 'isolation' | 'upper' | 'lower';

interface ExLike {
  id: string;
  name: string;
  muscleGroup?: string;
  freeWeight?: boolean;
}

const ISOLATION_IDS = new Set([
  'butterfly', 'cable-fly', 'lateral-raise-machine', 'db-lateral-raise', 'cable-lateral-raise', 'triceps-press', 'triceps-pushdown',
  'overhead-triceps', 'reverse-fly', 'face-pull', 'back-extension', 'biceps-curl-machine', 'db-curl', 'hammer-curl', 'cable-curl',
  'shrug', 'shrug-machine', 'external-rotation', 'ez-curl', 'leg-extension', 'leg-curl-seated', 'leg-curl-lying', 'glute-machine',
  'abductor', 'adductor', 'calf-raise', 'seated-calf-raise', 'ab-crunch', 'rotary-torso', 'pullover',
]);
const LOWER_IDS = new Set(['leg-press', 'hack-squat', 'pendulum-squat', 'belt-squat', 'squat', 'smith-squat', 'romanian-deadlift', 'deadlift', 'hip-thrust', 'lunges']);

const ISOLATION_RE =
  /seitheb|curl|trizeps|triceps|fly|butterfly|fliegend|außenrotation|aussenrotation|face ?pull|reverse|beinstrecker|beinbeuger|abdukt|addukt|wade|shrug|crunch|bauch|rückenstreck|rotation|pec deck|pullover/i;
const LOWER_RE = /kniebeuge|squat|beinpresse|leg press|hackenschmidt|kreuzheb|deadlift|hip ?thrust|ausfallschritt|lunge/i;
const ISOLATION_MUSCLES = new Set(['Bizeps', 'Trizeps', 'Waden', 'Hintere Schulter', 'Rotatorenmanschette', 'Abduktoren', 'Adduktoren', 'Quadrizeps', 'Bauch', 'Nacken']);

export function loadClass(ex: ExLike): LoadClass {
  if (ISOLATION_IDS.has(ex.id)) return 'isolation';
  if (LOWER_IDS.has(ex.id)) return 'lower';
  if (ISOLATION_RE.test(ex.name)) return 'isolation';
  if (LOWER_RE.test(ex.name)) return 'lower';
  if (ex.muscleGroup && ISOLATION_MUSCLES.has(ex.muscleGroup)) return 'isolation';
  return ex.muscleGroup === 'Beine' || ex.muscleGroup === 'Gesäß' ? 'lower' : 'upper';
}

export const MAX_JUMP: Record<LoadClass, number> = { isolation: 0.17, upper: 0.1, lower: 0.1 };
const NICE = [10, 5, 2.5, 2, 1, 0.5];

const isDumbbell = (ex: ExLike) => ex.freeWeight && (/^db-|hammer-curl|lateral/.test(ex.id) || /kurzhantel|\bKH\b|hammercurl/i.test(ex.name));

/** Gewichtsschritt bei Gewicht `w` (kg) für diese Übung; `equipStep` = Stufe des Geräts (Standard 2,5). */
export function loadStep(ex: ExLike, w: number, equipStep = 2.5): number {
  const equip = equipStep > 0 ? equipStep : 2.5;
  if (!(w > 0)) return equip; // erstes Zusatzgewicht / unbekannt
  if (isDumbbell(ex)) return w < 10 ? Math.min(1, equip) : equip;
  const cls = loadClass(ex);
  if (cls === 'lower' && w >= 100) return Math.max(equip, 5);
  const cap = w * MAX_JUMP[cls];
  const rel = NICE.find((n) => n <= cap + 1e-9) ?? 0.5;
  return Math.min(equip, rel);
}
