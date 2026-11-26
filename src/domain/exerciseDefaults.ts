/** Hilfen rund um Übungsnamen: Seiten, Muskelgruppen-Vorschläge. */

export type Side = 'links' | 'rechts';

/** "Kabel-Seitheben (links)" -> { base: "Kabel-Seitheben", side: "links" } */
export function splitSide(name: string): { base: string; side?: Side } {
  const m = name.match(/^(.*?)\s*\((links|rechts)\)\s*$/i);
  return m ? { base: m[1].trim(), side: m[2].toLowerCase() as Side } : { base: name.trim() };
}

const MUSCLE_RULES: [RegExp, string][] = [
  [/bauch|crunch|abdominal|core|plank/i, 'Core'],
  [/rückenstrecker|back extension|hyperextension/i, 'Unterer Rücken'],
  [/face ?pull|reverse butterfly|rear delt|außenrotation/i, 'Hintere Schulter'],
  [/seitheb|lateral|multi pec/i, 'Schultern'],
  [/schulterdr|shoulder press|overhead press/i, 'Schultern'],
  [/shrug|nacken/i, 'Nacken'],
  [/latzug|klimmz|pull ?down|pull-?up|chin/i, 'Rücken'],
  [/rudern|row/i, 'Rücken'],
  [/trizeps|triceps|dips|pressdown/i, 'Trizeps'],
  [/curl|bizeps|biceps/i, 'Bizeps'],
  [/butterfly|fly|pec|brust|bank|bench|incline press|chest/i, 'Brust'],
  [/wade|calf|calves/i, 'Waden'],
  [/glute|gesäß|hip thrust/i, 'Gesäß'],
  [/bein|leg|squat|kniebeuge|lunge|adduktor|abduktor/i, 'Beine'],
];

export function guessMuscleGroup(name: string): string | undefined {
  const { base } = splitSide(name);
  return MUSCLE_RULES.find(([re]) => re.test(base))?.[1];
}

/**
 * Freihantel-/Körpergewichtsübungen sind in jedem Gym gleich -> Historie gym-übergreifend.
 * Maschinen (Matrix, Hoist, Hammer Strength …) und Kabelzüge bleiben je Gym getrennt.
 */
export function guessSharedAcrossGyms(name: string): boolean {
  const { base } = splitSide(name);
  if (/maschine|matrix|hoist|hammer strength|kabel|cable|multi pec|smith|presse/i.test(base)) return false;
  return /kurzhantel|langhantel|\bkh\b|\blh\b|sz-|hantel|klimmz|chin.?up|pull.?up|dips|hammercurl|shrug|^bankdrücken$|^bench press$/i.test(base);
}
