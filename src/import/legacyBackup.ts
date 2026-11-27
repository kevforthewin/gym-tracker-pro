/**
 * Import eines Backups aus der bisherigen App „Gym Progress Tracker“ (format 'gym-progress-tracker').
 *
 * - Alte Übungen werden per Schlüsselwort auf Katalog-Übungen abgebildet (z. B. „Latzug Matrix“ → Latzug).
 *   Nicht erkennbare oder seitengetrennte Übungen („… (links)“) werden als eigene Übungen angelegt.
 * - Alte Stationen werden Geräte im jeweiligen Gym (Name bleibt), Trainings/Sätze/Pläne werden übernommen.
 * - IDs bleiben erhalten → erneuter Import erzeugt keine Duplikate.
 */
import type { Exercise, ExerciseType, Split } from '../model/types';
import { planDuplicates } from '../domain/planDedupe';

interface OldExercise {
  id: string;
  name: string;
  type: ExerciseType;
  muscleGroup?: string;
  sharedAcrossGyms?: boolean;
}
interface OldStation {
  id: string;
  gymId: string;
  exerciseId: string;
  name: string;
  weightIncrement: number;
  weightSteps?: number[];
  settingsNote?: string;
  notes?: string;
  startWeight?: number;
}
export interface LegacyBackup {
  format: 'gym-progress-tracker';
  version: number;
  tables: {
    gyms?: { id: string; name: string; archived?: boolean }[];
    exercises?: OldExercise[];
    stations?: OldStation[];
    plans?: { id: string; name: string; order: number }[];
    planDays?: { id: string; planId: string; name: string; order: number }[];
    planDayExercises?: {
      id: string;
      planDayId: string;
      exerciseId: string;
      order: number;
      sets: number;
      repMin: number;
      repMax: number;
      targetDurationSec?: number;
      targetDistanceM?: number;
    }[];
    sessions?: { id: string; gymId: string; planDayId?: string; startedAt: number; finishedAt?: number; notes?: string }[];
    sets?: {
      id: string;
      sessionId: string;
      stationId: string;
      exerciseId: string;
      setIndex: number;
      weightKg?: number;
      reps?: number;
      durationSec?: number;
      distanceM?: number;
      isWarmup: boolean;
      excluded?: boolean;
      excludeReason?: 'unsauber' | 'ersatz' | 'sonstiges';
      createdAt: number;
    }[];
    bodyweights?: { id: string; date: string; weightKg: number }[];
    cardio?: { id: string; date: string; kind: string; durationMin: number; distanceKm?: number; kcal?: number; gymId?: string }[];
  };
}

export function isLegacyBackup(x: unknown): x is LegacyBackup {
  const b = x as Partial<LegacyBackup>;
  return !!b && b.format === 'gym-progress-tracker' && typeof b.tables === 'object';
}

/** Regeln: alle Wörter müssen im (kleingeschriebenen) Namen vorkommen; erste passende Regel gewinnt. */
const RULES: [string[], string][] = [
  [['reverse', 'butterfly'], 'reverse-fly'],
  [['schrägbank', 'kurzhantel'], 'db-incline-press'],
  [['schrägbank', 'langhantel'], 'incline-bench-press'],
  [['incline', 'press'], 'incline-chest-press'],
  [['bankdrücken', 'kurzhantel'], 'db-bench-press'],
  [['bankdrücken'], 'bench-press'],
  [['low-to-high'], 'cable-fly'],
  [['cable', 'fly'], 'cable-fly'],
  // Multi Pec wird meist als Seitheben-Maschine genutzt (Arme seitlich, geführte Bahn)
  [['multi', 'pec'], 'lateral-raise-machine'],
  [['pec', 'fly'], 'butterfly'],
  [['butterfly'], 'butterfly'],
  [['schulterdrücken', 'kurzhantel'], 'db-shoulder-press'],
  [['shoulder', 'press'], 'shoulder-press'],
  [['schulterpresse'], 'shoulder-press'],
  [['seithebemaschine'], 'lateral-raise-machine'],
  [['kabel-seitheben'], 'cable-lateral-raise'],
  [['kurzhantel-seitheben'], 'db-lateral-raise'],
  [['seitheben'], 'db-lateral-raise'],
  [['außenrotation'], 'external-rotation'],
  [['trizepsmaschine'], 'triceps-press'],
  [['trizeps', 'overhead'], 'overhead-triceps'],
  [['trizeps'], 'triceps-pushdown'],
  [['klimmz'], 'pullup'],
  [['latzug'], 'lat-pulldown'],
  [['t-bar'], 't-bar-row'],
  [['kabelrudern'], 'cable-row'],
  [['rudern', 'kabel'], 'cable-row'],
  [['rudern', 'frei'], 'cable-row'],
  [['rudern'], 'seated-row'],
  [['face', 'pull'], 'face-pull'],
  [['preacher'], 'biceps-curl-machine'],
  [['bizepsmaschine'], 'biceps-curl-machine'],
  [['kabelcurl'], 'cable-curl'],
  [['hammercurl'], 'hammer-curl'],
  [['sz-curl'], 'ez-curl'],
  [['curl'], 'db-curl'],
  [['shrug'], 'shrug'],
  [['rückenstrecker'], 'back-extension'],
  [['beinstrecker'], 'leg-extension'],
  [['beinbeuger', 'kniend'], 'leg-curl-lying'],
  [['beinbeuger', 'liegend'], 'leg-curl-lying'],
  [['beinbeuger'], 'leg-curl-seated'],
  [['beinpresse'], 'leg-press'],
  [['hackenschmidt'], 'hack-squat'],
  [['abduktor'], 'abductor'],
  [['adduktor'], 'adductor'],
  [['waden'], 'calf-raise'],
  [['glute', 'thrust'], 'hip-thrust'],
  [['hip', 'thrust'], 'hip-thrust'],
  [['kniebeuge'], 'squat'],
  [['kreuzheben'], 'deadlift'],
  [['dips'], 'dips'],
];

/** Freitext-Cardio der alten App („Laufband“, „Zone 2 Rad“ …) auf feste Arten abbilden */
export function cardioKindFromText(kind: string): string {
  const k = kind.toLowerCase();
  const rules: [RegExp, string][] = [
    [/laufband|treadmill/, 'treadmill'],
    [/ergo|spinning|indoor.?cycl|bike/, 'bike'],
    [/rad|cycling|fahrrad/, 'cycling'],
    [/cross/, 'cross-trainer'],
    [/ruder|row/, 'rower'],
    [/stepper|treppe|stair/, 'stairs'],
    [/schwimm|swim/, 'swim'],
    [/geh|walk|spazier|wander/, 'walk'],
    [/lauf|run|jogg/, 'run'],
  ];
  return rules.find(([r]) => r.test(k))?.[1] ?? kind;
}

export function matchCatalog(name: string): string | undefined {
  const n = name.toLowerCase();
  return RULES.find(([words]) => words.every((w) => n.includes(w)))?.[1];
}

const SIDE = /\((links|rechts)\)/i;

export interface ImportPlan {
  exercises: Omit<Exercise, 'updatedAt'>[];
  exerciseMap: Map<string, string>;
  rows: {
    gyms: { id: string; name: string }[];
    gymMachines: { id: string; gymId: string; exerciseId: string; label: string; weightStepKg: number; weightSteps?: number[] }[];
    machineNotes: { id: string; machineId: string; note: string; startWeightKg?: number }[];
    userGyms: { id: string; gymId: string }[];
    plans: { id: string; name: string; order: number }[];
    planDays: { id: string; planId: string; name: string; order: number }[];
    planDayExercises: NonNullable<LegacyBackup['tables']['planDayExercises']>;
    sessions: { id: string; gymId: string; planDayId?: string; startedAt: number; finishedAt?: number; notes?: string }[];
    sets: (Omit<NonNullable<LegacyBackup['tables']['sets']>[number], 'stationId'> & { machineId: string })[];
    bodyweights: { id: string; date: string; weightKg: number }[];
    cardio: NonNullable<LegacyBackup['tables']['cardio']>;
  };
  stats: { mapped: number; custom: number };
}

/** Reine Umwandlung (ohne DB) – testbar. */
export function planImport(b: LegacyBackup, catalog: Exercise[]): ImportPlan {
  const t = b.tables;
  const cat = new Map(catalog.map((e) => [e.id, e]));
  const exerciseMap = new Map<string, string>();
  const custom: Omit<Exercise, 'updatedAt'>[] = [];
  let mapped = 0;
  // Konflikte vermeiden: Würden zwei verschiedene alte Übungen auf dieselbe Katalog-Übung fallen und
  // dadurch ihre Historie vermischen (Freihantel: über alle Gyms; Plan: zwei Slots am selben Tag),
  // bleiben sie eigene Übungen. Beispiel: „Schrägbank KH 30°“ und „… 45°“.
  const target = new Map((t.exercises ?? []).map((e) => [e.id, SIDE.test(e.name) ? undefined : matchCatalog(e.name)]));
  const conflicted = new Set<string>();
  const byTarget = new Map<string, string[]>();
  for (const [id, tg] of target) if (tg) byTarget.set(tg, [...(byTarget.get(tg) ?? []), id]);
  for (const [tg, ids] of byTarget) if (ids.length > 1 && cat.get(tg)?.freeWeight) ids.forEach((id) => conflicted.add(id));
  const gymsOf = (exId: string) => new Set((t.stations ?? []).filter((st) => st.exerciseId === exId).map((st) => st.gymId));
  const perDay = new Map<string, string[]>();
  for (const p of t.planDayExercises ?? []) perDay.set(p.planDayId, [...(perDay.get(p.planDayId) ?? []), p.exerciseId]);
  for (const ids of perDay.values()) {
    const seen = new Map<string, string>();
    for (const id of ids) {
      const tg = target.get(id);
      if (!tg) continue;
      const other = seen.get(tg);
      // nur ein Konflikt, wenn beide Übungen im selben Gym ein Gerät haben (sonst wählt das Gym das Gerät)
      if (other && other !== id && [...gymsOf(id)].some((g) => gymsOf(other).has(g))) conflicted.add(id).add(other);
      seen.set(tg, id);
    }
  }
  for (const e of t.exercises ?? []) {
    const hit = matchCatalog(e.name);
    const base = hit ? cat.get(hit) : undefined;
    if (base && !SIDE.test(e.name) && !conflicted.has(e.id)) {
      exerciseMap.set(e.id, base.id);
      mapped++;
      continue;
    }
    // eigene Übung (seitengetrennt oder unbekannt) – Eigenschaften möglichst vom Katalog erben
    const split: Split = base?.split ?? 'other';
    custom.push({
      id: e.id,
      name: e.name,
      type: e.type,
      muscleGroup: base?.muscleGroup ?? e.muscleGroup,
      split,
      freeWeight: base?.freeWeight ?? e.sharedAcrossGyms ?? undefined,
    });
    exerciseMap.set(e.id, e.id);
  }
  const ex = (id: string) => exerciseMap.get(id) ?? id;
  const gyms = (t.gyms ?? []).filter((g) => !g.archived);
  const stations = t.stations ?? [];

  return {
    exercises: custom,
    exerciseMap,
    stats: { mapped, custom: custom.length },
    rows: {
      gyms: gyms.map((g) => ({ id: g.id, name: g.name })),
      userGyms: gyms.map((g) => ({ id: `ug-${g.id}`, gymId: g.id })),
      gymMachines: stations.map((s) => ({
        id: s.id,
        gymId: s.gymId,
        exerciseId: ex(s.exerciseId),
        label: s.name,
        weightStepKg: s.weightIncrement || 2.5,
        weightSteps: s.weightSteps,
      })),
      machineNotes: stations
        .filter((s) => s.settingsNote || s.notes || s.startWeight)
        .map((s) => ({
          id: `note-${s.id}`,
          machineId: s.id,
          note: [s.settingsNote, s.notes].filter(Boolean).join(' · '),
          startWeightKg: s.startWeight,
        })),
      plans: t.plans ?? [],
      planDays: t.planDays ?? [],
      planDayExercises: (() => {
        // gleiche Übung aus Gym-spezifischen Einträgen (z. B. „Latzug“ / „Latzug Matrix“) nur einmal pro Tag
        const rows = (t.planDayExercises ?? []).map((p) => ({ ...p, exerciseId: ex(p.exerciseId) }));
        const { remove, update } = planDuplicates(rows);
        const upd = new Map(update.map((u) => [u.id, u]));
        return rows.filter((p) => !remove.includes(p.id)).map((p) => (upd.has(p.id) ? { ...p, sets: upd.get(p.id)!.sets } : p));
      })(),
      sessions: (t.sessions ?? []).map(({ id, gymId, planDayId, startedAt, finishedAt, notes }) => ({
        id,
        gymId,
        planDayId,
        startedAt,
        finishedAt: finishedAt ?? startedAt,
        notes,
      })),
      sets: (t.sets ?? []).map(({ stationId, ...s }) => ({ ...s, machineId: stationId, exerciseId: ex(s.exerciseId) })),
      bodyweights: (t.bodyweights ?? []).map(({ id, date, weightKg }) => ({ id, date, weightKg })),
      cardio: (t.cardio ?? []).map(({ id, date, kind, durationMin, distanceKm, kcal, gymId }) => ({
        id,
        date,
        kind: cardioKindFromText(kind),
        durationMin,
        distanceKm,
        kcal,
        gymId,
      })),
    },
  };
}
