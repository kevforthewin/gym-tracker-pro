/**
 * Startkatalog: Übungen, Hersteller und Gerätemodelle.
 * Hoist, Matrix, Hammer Strength und Life Fitness: geprüfte Modelle von den Herstellerseiten.
 * Übrige Hersteller: noch generiert aus typischen Gerätetypen (wird schrittweise ersetzt).
 * Nutzer ergänzen fehlende Modelle in der App. IDs sind stabil (werden in Supabase gleich geseedet).
 */
import type { EquipmentKind, EquipmentModel, Exercise, ExerciseType, Gym, Manufacturer, Split } from '../model/types';
import { exerciseForProduct, kindForLine } from './mapModels';
import { VERIFIED_MODELS } from './verifiedModels';
import { USC_KOELN_GYMS } from './uscKoeln';

const T0 = 0; // Katalog-Zeilen: updatedAt 0 → jede Nutzer-Änderung gewinnt

type Ex = [id: string, name: string, type: ExerciseType, muscle: string, split: Split, free?: boolean];

const EXERCISES: Ex[] = [
  // Push
  ['chest-press', 'Brustpresse', 'weight_reps', 'Brust', 'push'],
  ['incline-chest-press', 'Schrägbankpresse (Maschine)', 'weight_reps', 'Brust', 'push'],
  ['decline-chest-press', 'Negativ-Brustpresse (Maschine)', 'weight_reps', 'Brust', 'push'],
  ['dip-machine', 'Dips (Maschine)', 'weight_reps', 'Trizeps', 'push'],
  ['butterfly', 'Butterfly', 'weight_reps', 'Brust', 'push'],
  ['cable-fly', 'Kabelzug Fliegende', 'weight_reps', 'Brust', 'push'],
  ['bench-press', 'Bankdrücken (Langhantel)', 'weight_reps', 'Brust', 'push', true],
  ['incline-bench-press', 'Schrägbankdrücken (Langhantel)', 'weight_reps', 'Brust', 'push', true],
  ['db-bench-press', 'Bankdrücken (Kurzhantel)', 'weight_reps', 'Brust', 'push', true],
  ['db-incline-press', 'Schrägbankdrücken (Kurzhantel)', 'weight_reps', 'Brust', 'push', true],
  ['dips', 'Dips', 'bodyweight', 'Brust', 'push', true],
  ['shoulder-press', 'Schulterpresse', 'weight_reps', 'Schultern', 'push'],
  ['db-shoulder-press', 'Schulterdrücken (Kurzhantel)', 'weight_reps', 'Schultern', 'push', true],
  ['lateral-raise-machine', 'Seitheben (Maschine)', 'weight_reps', 'Schultern', 'push'],
  ['db-lateral-raise', 'Seitheben (Kurzhantel)', 'weight_reps', 'Schultern', 'push', true],
  ['cable-lateral-raise', 'Seitheben (Kabel)', 'weight_reps', 'Schultern', 'push'],
  ['triceps-press', 'Trizepsdrücken (Maschine)', 'weight_reps', 'Trizeps', 'push'],
  ['triceps-pushdown', 'Trizepsdrücken (Kabel)', 'weight_reps', 'Trizeps', 'push'],
  ['overhead-triceps', 'Überkopf-Trizeps (Kabel)', 'weight_reps', 'Trizeps', 'push'],
  // Pull
  ['lat-pulldown', 'Latzug', 'weight_reps', 'Rücken', 'pull'],
  ['seated-row', 'Rudern sitzend (Maschine)', 'weight_reps', 'Rücken', 'pull'],
  ['cable-row', 'Rudern (Kabel)', 'weight_reps', 'Rücken', 'pull'],
  ['t-bar-row', 'T-Bar-Rudern', 'weight_reps', 'Rücken', 'pull'],
  ['high-row', 'Rudern von oben (High Row)', 'weight_reps', 'Rücken', 'pull'],
  ['db-row', 'Kurzhantelrudern', 'weight_reps', 'Rücken', 'pull', true],
  ['pullup', 'Klimmzüge', 'bodyweight', 'Rücken', 'pull', true],
  ['assisted-pullup', 'Klimmzüge (unterstützt)', 'weight_reps', 'Rücken', 'pull'],
  ['pullover', 'Pullover (Maschine)', 'weight_reps', 'Rücken', 'pull'],
  ['reverse-fly', 'Reverse Butterfly', 'weight_reps', 'Hintere Schulter', 'pull'],
  ['face-pull', 'Face Pulls', 'weight_reps', 'Hintere Schulter', 'pull'],
  ['back-extension', 'Rückenstrecker', 'weight_reps', 'Unterer Rücken', 'pull'],
  ['biceps-curl-machine', 'Bizepscurl (Maschine)', 'weight_reps', 'Bizeps', 'pull'],
  ['db-curl', 'Bizepscurl (Kurzhantel)', 'weight_reps', 'Bizeps', 'pull', true],
  ['hammer-curl', 'Hammercurl', 'weight_reps', 'Bizeps', 'pull', true],
  ['cable-curl', 'Bizepscurl (Kabel)', 'weight_reps', 'Bizeps', 'pull'],
  ['shrug', 'Shrugs', 'weight_reps', 'Nacken', 'pull', true],
  ['shrug-machine', 'Shrugs (Maschine)', 'weight_reps', 'Nacken', 'pull'],
  ['external-rotation', 'Außenrotation (Kabel)', 'weight_reps', 'Rotatorenmanschette', 'pull'],
  ['ez-curl', 'SZ-Curls', 'weight_reps', 'Bizeps', 'pull', true],
  // Legs
  ['leg-press', 'Beinpresse', 'weight_reps', 'Beine', 'legs'],
  ['hack-squat', 'Hackenschmidt', 'weight_reps', 'Beine', 'legs'],
  ['pendulum-squat', 'Pendel-Kniebeuge', 'weight_reps', 'Beine', 'legs'],
  ['belt-squat', 'Gürtel-Kniebeuge (Belt Squat)', 'weight_reps', 'Beine', 'legs'],
  ['squat', 'Kniebeuge (Langhantel)', 'weight_reps', 'Beine', 'legs', true],
  ['smith-squat', 'Kniebeuge (Multipresse)', 'weight_reps', 'Beine', 'legs'],
  ['leg-extension', 'Beinstrecker', 'weight_reps', 'Quadrizeps', 'legs'],
  ['leg-curl-seated', 'Beinbeuger sitzend', 'weight_reps', 'Beinbeuger', 'legs'],
  ['leg-curl-lying', 'Beinbeuger liegend', 'weight_reps', 'Beinbeuger', 'legs'],
  ['romanian-deadlift', 'Rumänisches Kreuzheben', 'weight_reps', 'Beinbeuger', 'legs', true],
  ['deadlift', 'Kreuzheben', 'weight_reps', 'Rücken', 'legs', true],
  ['hip-thrust', 'Hip Thrust', 'weight_reps', 'Gesäß', 'legs'],
  ['glute-machine', 'Gesäßmaschine', 'weight_reps', 'Gesäß', 'legs'],
  ['abductor', 'Abduktoren', 'weight_reps', 'Abduktoren', 'legs'],
  ['adductor', 'Adduktoren', 'weight_reps', 'Adduktoren', 'legs'],
  ['calf-raise', 'Wadenheben', 'weight_reps', 'Waden', 'legs'],
  ['seated-calf-raise', 'Wadenheben sitzend', 'weight_reps', 'Waden', 'legs'],
  ['lunges', 'Ausfallschritte', 'weight_reps', 'Beine', 'legs', true],
  // Rumpf
  ['ab-crunch', 'Bauchmaschine', 'weight_reps', 'Bauch', 'other'],
  ['rotary-torso', 'Rotationsmaschine', 'weight_reps', 'Bauch', 'other'],
  ['hanging-leg-raise', 'Beinheben hängend', 'bodyweight', 'Bauch', 'other', true],
  ['plank', 'Unterarmstütz', 'time_distance', 'Bauch', 'other', true],
  // Cardio
  ['treadmill', 'Laufband', 'time_distance', 'Cardio', 'other'],
  ['bike', 'Ergometer', 'time_distance', 'Cardio', 'other'],
  ['cross-trainer', 'Crosstrainer', 'time_distance', 'Cardio', 'other'],
  ['rower', 'Rudergerät', 'time_distance', 'Cardio', 'other'],
  ['stair-climber', 'Stepper / Treppe', 'time_distance', 'Cardio', 'other'],
];

export const CATALOG_EXERCISES: Exercise[] = EXERCISES.map(([id, name, type, muscleGroup, split, free]) => ({
  id,
  name,
  type,
  muscleGroup,
  split,
  freeWeight: free || undefined,
  updatedAt: T0,
}));

type Mf = [id: string, name: string];
const MANUFACTURERS: Mf[] = [
  ['technogym', 'Technogym'],
  ['matrix', 'Matrix'],
  ['life-fitness', 'Life Fitness'],
  ['hammer-strength', 'Hammer Strength'],
  ['precor', 'Precor'],
  ['gym80', 'gym80'],
  ['hoist', 'Hoist'],
  ['cybex', 'Cybex'],
  ['egym', 'eGym'],
  ['panatta', 'Panatta'],
  ['nautilus', 'Nautilus'],
  ['milon', 'milon'],
  ['star-trac', 'Star Trac'],
  ['concept2', 'Concept2'],
  ['generic', 'Sonstige / unbekannt'],
];
export const CATALOG_MANUFACTURERS: Manufacturer[] = MANUFACTURERS.map(([id, name]) => ({ id, name, updatedAt: T0 }));

/** Produktlinien → welche Standard-Geräte (Übungs-IDs) sie typischerweise enthalten. */
type Line = { mf: string; line: string; kind: EquipmentKind; step: number; exercises: string[] };

const SELECTORIZED_FULL = [
  'chest-press',
  'incline-chest-press',
  'butterfly',
  'reverse-fly',
  'shoulder-press',
  'lateral-raise-machine',
  'lat-pulldown',
  'seated-row',
  'pullover',
  'biceps-curl-machine',
  'triceps-press',
  'leg-press',
  'leg-extension',
  'leg-curl-seated',
  'leg-curl-lying',
  'abductor',
  'adductor',
  'glute-machine',
  'calf-raise',
  'back-extension',
  'ab-crunch',
  'rotary-torso',
  'assisted-pullup',
];
const SELECTORIZED_CORE = [
  'chest-press',
  'butterfly',
  'reverse-fly',
  'shoulder-press',
  'lat-pulldown',
  'seated-row',
  'biceps-curl-machine',
  'triceps-press',
  'leg-press',
  'leg-extension',
  'leg-curl-seated',
  'abductor',
  'adductor',
  'back-extension',
  'ab-crunch',
];
const PLATE_LOADED = [
  'chest-press',
  'incline-chest-press',
  'shoulder-press',
  'lat-pulldown',
  'seated-row',
  't-bar-row',
  'leg-press',
  'hack-squat',
  'hip-thrust',
  'calf-raise',
];

/** Noch nicht geprüfte Linien (generiert aus typischen Gerätetypen) – werden nach und nach durch Herstellerdaten ersetzt. */
const LINES: Line[] = [
  { mf: 'technogym', line: 'Selection 700', kind: 'selectorized', step: 2.5, exercises: SELECTORIZED_FULL },
  { mf: 'technogym', line: 'Selection 900', kind: 'selectorized', step: 2.5, exercises: SELECTORIZED_CORE },
  { mf: 'technogym', line: 'Pure Strength', kind: 'plate_loaded', step: 2.5, exercises: PLATE_LOADED },
  { mf: 'precor', line: 'Discovery', kind: 'selectorized', step: 2.5, exercises: SELECTORIZED_FULL },
  { mf: 'precor', line: 'Resolute', kind: 'selectorized', step: 2.5, exercises: SELECTORIZED_CORE },
  { mf: 'gym80', line: 'Sygnum', kind: 'selectorized', step: 2.5, exercises: SELECTORIZED_FULL },
  { mf: 'gym80', line: 'Pure Kraft', kind: 'plate_loaded', step: 2.5, exercises: PLATE_LOADED },
  { mf: 'cybex', line: 'Eagle NX', kind: 'selectorized', step: 2.5, exercises: SELECTORIZED_FULL },
  { mf: 'cybex', line: 'Prestige', kind: 'selectorized', step: 2.5, exercises: SELECTORIZED_CORE },
  { mf: 'egym', line: 'Smart Strength', kind: 'selectorized', step: 1, exercises: SELECTORIZED_CORE },
  { mf: 'panatta', line: 'Fit Evo', kind: 'selectorized', step: 2.5, exercises: SELECTORIZED_FULL },
  { mf: 'panatta', line: 'Monolith', kind: 'selectorized', step: 2.5, exercises: SELECTORIZED_CORE },
  { mf: 'panatta', line: 'Freeweight HP', kind: 'plate_loaded', step: 2.5, exercises: PLATE_LOADED },
  { mf: 'nautilus', line: 'Inspiration', kind: 'selectorized', step: 2.5, exercises: SELECTORIZED_CORE },
  { mf: 'nautilus', line: 'Impact', kind: 'selectorized', step: 2.5, exercises: SELECTORIZED_CORE },
  { mf: 'milon', line: 'Kraftzirkel', kind: 'selectorized', step: 1, exercises: SELECTORIZED_CORE },
];

const exName = new Map(EXERCISES.map(([id, name]) => [id, name]));

const slug = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const GENERIC_MODELS: EquipmentModel[] = LINES.flatMap((l) =>
  l.exercises.map((ex) => ({
    id: `${l.mf}--${slug(l.line)}--${ex}`,
    manufacturerId: l.mf,
    line: l.line,
    name: exName.get(ex) ?? ex,
    kind: l.kind,
    exerciseId: ex,
    weightStepKg: l.step,
    updatedAt: T0,
  })),
);

const seen = new Set<string>();
/** Geprüfte Modelle von den Herstellerseiten (siehe verifiedModels.ts) */
export const VERIFIED_CATALOG_MODELS: EquipmentModel[] = VERIFIED_MODELS.flatMap(([mf, line, name, model, src]) => {
  const exerciseId = exerciseForProduct(name);
  const id = `${mf}--${slug(model || `${line}-${name}`)}`;
  if (!exerciseId || seen.has(id)) return [];
  seen.add(id);
  return [
    {
      id,
      manufacturerId: mf,
      line,
      name,
      modelNumber: model || undefined,
      sourceUrl: src,
      verified: true,
      kind: kindForLine(line),
      exerciseId,
      weightStepKg: 2.5,
      updatedAt: T0,
    },
  ];
});

export const CATALOG_MODELS: EquipmentModel[] = [...VERIFIED_CATALOG_MODELS, ...GENERIC_MODELS];

/**
 * Frühere, generierte Modell-IDs (Katalog v1) der inzwischen geprüften Hersteller → neues Modell
 * (gleicher Hersteller, passende Linie, gleiche Übung) oder null, wenn es keine Entsprechung gibt.
 */
const OLD_LINES: [mf: string, oldLine: string, newLine: RegExp, exercises: string[]][] = [
  ['matrix', 'Ultra', /^Ultra$/, SELECTORIZED_FULL],
  ['matrix', 'Versa', /^Versa$/, SELECTORIZED_CORE],
  ['matrix', 'Aura', /^Aura$/, SELECTORIZED_CORE],
  ['matrix', 'Magnum (Plate Loaded)', /^Magnum/, PLATE_LOADED],
  ['life-fitness', 'Insignia', /^Insignia/, SELECTORIZED_FULL],
  ['life-fitness', 'Optima', /^Axiom/, SELECTORIZED_CORE],
  ['hammer-strength', 'Plate-Loaded', /^Plate-Loaded$/, PLATE_LOADED],
  ['hammer-strength', 'Select', /^Select$/, SELECTORIZED_CORE],
  ['hoist', 'ROC-IT', /^ROC-IT Selectorized$/, SELECTORIZED_FULL],
  ['hoist', 'HD Dual', /^HD Dual$/, SELECTORIZED_CORE],
];
export const LEGACY_MODEL_ALIAS: Record<string, string | null> = Object.fromEntries(
  OLD_LINES.flatMap(([mf, oldLine, newLine, exercises]) =>
    exercises.map((ex) => [
      `${mf}--${slug(oldLine)}--${ex}`,
      VERIFIED_CATALOG_MODELS.find((m) => m.manufacturerId === mf && newLine.test(m.line ?? '') && m.exerciseId === ex)?.id ?? null,
    ]),
  ),
);

/** Anzeigename eines Modells: „Chest Press · Hoist ROC-IT Selectorized“ (Gerät vorne, Linie hinten, ohne Modellnummer) */
export function modelTitle(m: Pick<EquipmentModel, 'line' | 'name'>, mf?: Pick<Manufacturer, 'name'>): string {
  return `${m.name} · ${[mf?.name, m.line].filter(Boolean).join(' ')}`;
}

/** Katalog-Gyms (aktuell: Köln, Urban-Sports-Club-Partner) */
export const CATALOG_GYMS: Gym[] = USC_KOELN_GYMS.map(([slug, name, kind, chain, district, street, plans]) => ({
  id: `usc-koeln-${slug}`,
  name,
  kind,
  chain: chain ?? undefined,
  district,
  address: street,
  city: 'Köln',
  uscPlans: plans,
  sourceUrl: `https://urbansportsclub.com/de/venues/${slug}`,
  updatedAt: T0,
}));
