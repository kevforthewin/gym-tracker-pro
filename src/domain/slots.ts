/**
 * Bewegungsplätze und Plan-Vorlagen.
 *
 * Eine Vorlage legt keine Geräte fest, sondern Plätze wie „Horizontal drücken“. Erst im Gym wird
 * daraus eine konkrete Übung: die zuletzt dort gemachte Alternative, sonst die erste, für die es
 * dort ein Gerät gibt, sonst die erste Freihantel-Alternative.
 */

export interface Slot {
  id: string;
  label: string;
  /** Übungs-IDs in Vorzugsreihenfolge */
  alternatives: string[];
  /** Grundübung (3 × 6–10) oder Isolation (3 × 10–15) */
  compound: boolean;
}

export const SLOTS: Slot[] = [
  { id: 'horizontal-push', label: 'Horizontal drücken', compound: true, alternatives: ['chest-press', 'bench-press', 'db-bench-press'] },
  { id: 'incline-push', label: 'Schräg drücken', compound: true, alternatives: ['incline-chest-press', 'db-incline-press', 'incline-bench-press'] },
  { id: 'vertical-push', label: 'Vertikal drücken', compound: true, alternatives: ['shoulder-press', 'db-shoulder-press'] },
  { id: 'vertical-pull', label: 'Vertikal ziehen', compound: true, alternatives: ['lat-pulldown', 'pullup', 'assisted-pullup'] },
  { id: 'horizontal-pull', label: 'Horizontal ziehen', compound: true, alternatives: ['seated-row', 'cable-row', 't-bar-row', 'high-row', 'db-row'] },
  { id: 'squat', label: 'Kniebeuge-Muster', compound: true, alternatives: ['leg-press', 'hack-squat', 'pendulum-squat', 'belt-squat', 'squat'] },
  { id: 'hinge', label: 'Hüfte strecken', compound: true, alternatives: ['romanian-deadlift', 'hip-thrust', 'back-extension'] },
  { id: 'chest-iso', label: 'Brust isoliert', compound: false, alternatives: ['butterfly', 'cable-fly'] },
  { id: 'lateral-raise', label: 'Seitheben', compound: false, alternatives: ['lateral-raise-machine', 'cable-lateral-raise', 'db-lateral-raise'] },
  { id: 'rear-delt', label: 'Hintere Schulter', compound: false, alternatives: ['reverse-fly', 'face-pull'] },
  { id: 'biceps', label: 'Bizeps', compound: false, alternatives: ['biceps-curl-machine', 'cable-curl', 'db-curl', 'ez-curl'] },
  { id: 'biceps-2', label: 'Bizeps (Variante)', compound: false, alternatives: ['hammer-curl', 'cable-curl', 'db-curl'] },
  { id: 'triceps', label: 'Trizeps', compound: false, alternatives: ['triceps-press', 'triceps-pushdown', 'dip-machine'] },
  { id: 'triceps-2', label: 'Trizeps (Variante)', compound: false, alternatives: ['overhead-triceps', 'triceps-pushdown', 'dips'] },
  { id: 'leg-extension', label: 'Beinstrecker', compound: false, alternatives: ['leg-extension'] },
  { id: 'leg-curl', label: 'Beinbeuger', compound: false, alternatives: ['leg-curl-seated', 'leg-curl-lying'] },
  { id: 'calves', label: 'Waden', compound: false, alternatives: ['calf-raise', 'seated-calf-raise'] },
  { id: 'adductors', label: 'Adduktoren', compound: false, alternatives: ['adductor'] },
  { id: 'abs', label: 'Bauch', compound: false, alternatives: ['ab-crunch', 'hanging-leg-raise'] },
  { id: 'shrug', label: 'Nacken', compound: false, alternatives: ['shrug-machine', 'shrug'] },
];

export const slotById = (id?: string) => SLOTS.find((s) => s.id === id);
export const repsFor = (slot: Slot) => (slot.compound ? { sets: 3, repMin: 6, repMax: 10 } : { sets: 3, repMin: 10, repMax: 15 });

export interface Template {
  id: string;
  name: string;
  description: string;
  /** mögliche Trainings pro Woche (erste = Standard) */
  frequencies: number[];
  days: { name: string; slots: string[] }[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'upper-lower',
    name: 'Upper / Lower',
    description: 'Oberkörper und Unterkörper im Wechsel, je zwei Varianten.',
    frequencies: [4],
    days: [
      { name: 'Upper A', slots: ['horizontal-push', 'horizontal-pull', 'vertical-push', 'vertical-pull', 'lateral-raise', 'biceps', 'triceps'] },
      { name: 'Lower A', slots: ['squat', 'hinge', 'leg-extension', 'leg-curl', 'calves', 'abs'] },
      { name: 'Upper B', slots: ['incline-push', 'vertical-pull', 'chest-iso', 'horizontal-pull', 'rear-delt', 'triceps-2', 'biceps-2'] },
      { name: 'Lower B', slots: ['hinge', 'squat', 'leg-curl', 'leg-extension', 'adductors', 'calves'] },
    ],
  },
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    description: 'Drücken, Ziehen, Beine – einmal oder zweimal pro Woche durch.',
    frequencies: [3, 6],
    days: [
      { name: 'Push', slots: ['horizontal-push', 'incline-push', 'vertical-push', 'lateral-raise', 'triceps'] },
      { name: 'Pull', slots: ['vertical-pull', 'horizontal-pull', 'rear-delt', 'biceps', 'shrug'] },
      { name: 'Legs', slots: ['squat', 'hinge', 'leg-extension', 'leg-curl', 'calves', 'abs'] },
    ],
  },
  {
    id: 'full-body',
    name: 'Ganzkörper',
    description: 'Zwei Ganzkörper-Einheiten im Wechsel – ideal bei wenig Zeit.',
    frequencies: [3, 2],
    days: [
      { name: 'Ganzkörper A', slots: ['squat', 'horizontal-push', 'vertical-pull', 'leg-curl', 'lateral-raise', 'abs'] },
      { name: 'Ganzkörper B', slots: ['hinge', 'vertical-push', 'horizontal-pull', 'leg-extension', 'biceps', 'triceps'] },
    ],
  },
  {
    id: 'bro-split',
    name: 'Bro-Split',
    description: 'Jeder Muskelbereich hat seinen eigenen Tag.',
    frequencies: [5],
    days: [
      { name: 'Brust', slots: ['horizontal-push', 'incline-push', 'chest-iso', 'triceps'] },
      { name: 'Rücken', slots: ['vertical-pull', 'horizontal-pull', 'hinge', 'rear-delt'] },
      { name: 'Schultern', slots: ['vertical-push', 'lateral-raise', 'rear-delt', 'shrug'] },
      { name: 'Beine', slots: ['squat', 'hinge', 'leg-extension', 'leg-curl', 'calves'] },
      { name: 'Arme', slots: ['biceps', 'triceps', 'biceps-2', 'triceps-2', 'abs'] },
    ],
  },
];

/**
 * Welche Übung wird im Gym für einen Platz genommen?
 * @param available Übungen, für die es im Gym ein Gerät gibt
 * @param freeWeight Freihantel-Übungen (gehen überall)
 * @param lastUsed zuletzt in diesem Gym gemachte Alternative dieses Platzes
 */
export function resolveSlot(slot: Slot, available: Set<string>, freeWeight: Set<string>, lastUsed?: string): string {
  if (lastUsed && slot.alternatives.includes(lastUsed) && (available.has(lastUsed) || freeWeight.has(lastUsed))) return lastUsed;
  return (
    slot.alternatives.find((a) => available.has(a)) ?? slot.alternatives.find((a) => freeWeight.has(a)) ?? slot.alternatives[0]
  );
}
