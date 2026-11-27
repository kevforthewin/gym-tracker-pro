/**
 * Einheitliche Reihenfolge für Übungslisten – so, wie man im Gym trainiert:
 * 1. Muskelgruppe (große zuerst: Brust, Rücken, Schultern, Beine … kleine wie Arme, Waden, Bauch zuletzt)
 * 2. Bewegungsmuster (Grundübungen vor Isolation; flach → schräg → Fliegende; Kniebeuge → Presse → Beinstrecker …)
 * 3. Gerät (Langhantel → Kurzhantel → Maschine/Kabel), dann Name (links vor rechts).
 */
import { canonMuscle } from './planVolume';
import { loadClass } from './loadStep';

export interface OrderEx {
  id: string;
  name: string;
  muscleGroup?: string;
  freeWeight?: boolean;
}

export const TRAINING_MUSCLE_ORDER = [
  'Brust',
  'Rücken',
  'Schultern',
  'Hintere Schulter',
  'Quadrizeps',
  'Beinbeuger',
  'Gesäß',
  'Adduktoren',
  'Abduktoren',
  'Unterer Rücken',
  'Trizeps',
  'Bizeps',
  'Nacken',
  'Waden',
  'Bauch',
];

/** Bewegungsmuster in Trainingsreihenfolge (erstes passendes gewinnt) */
const PATTERNS: RegExp[] = [
  /kniebeuge|squat|kreuzheb|deadlift/i,
  /beinpresse|leg press|hackenschmidt|pendel/i,
  /ausfallschritt|lunge|hip ?thrust/i,
  /^(?!.*(schräg|incline|negativ|decline)).*(bankdrück|bench|brustpresse|chest press)/i,
  /schräg|incline/i,
  /negativ|decline|dips/i,
  /klimmz|pull-?up|\bchin-?up/i,
  /latzug|pull ?down|lat /i,
  /rudern|row/i,
  /pullover/i,
  /schulterdr|schulterpresse|shoulder press|overhead press|military/i,
  /butterfly|fly|fliegend|pec/i,
  /seitheb|lateral/i,
  /face ?pull|reverse|rear|außenrot|aussenrot/i,
  /rumänisch|romanian/i,
  /beinbeuger|leg curl/i,
  /beinstrecker|leg extension/i,
  /gesäß|glute/i,
  /addukt/i,
  /abdukt/i,
  /rückenstreck|back extension|hyperext/i,
  /(trizeps|triceps).*(drück|press|dip)|close/i,
  /überkopf|overhead|french|skull/i,
  /pushdown|pressdown|trizeps|triceps/i,
  /sz|ez|langhantel.*curl|curl.*langhantel/i,
  /hammer/i,
  /preacher|scott/i,
  /curl|bizeps|biceps/i,
  /shrug/i,
  /wade|calf/i,
  /crunch|bauch|ab |rotation|beinheben/i,
];

const equipRank = (e: OrderEx) => (/\b(lh|langhantel)\b|\(langhantel\)|kniebeuge|kreuzheb/i.test(e.name) ? 0 : e.freeWeight ? 1 : /kabel|cable/i.test(e.name) ? 3 : 2);

export function exerciseKey(e: OrderEx): [number, number, number, number, string] {
  const m = TRAINING_MUSCLE_ORDER.indexOf(canonMuscle(e.muscleGroup ?? ''));
  const pattern = PATTERNS.findIndex((re) => re.test(e.name));
  return [m === -1 ? 99 : m, loadClass(e) === 'isolation' ? 1 : 0, pattern === -1 ? 99 : pattern, equipRank(e), e.name.toLocaleLowerCase('de')];
}

export function compareExercises(a: OrderEx, b: OrderEx): number {
  const ka = exerciseKey(a);
  const kb = exerciseKey(b);
  for (let i = 0; i < 4; i++) if (ka[i] !== kb[i]) return (ka[i] as number) - (kb[i] as number);
  return ka[4].localeCompare(kb[4], 'de');
}
