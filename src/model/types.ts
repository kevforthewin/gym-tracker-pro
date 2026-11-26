/**
 * Datenmodell von gym-tracker-pro.
 *
 * Zwei Arten von Tabellen:
 * - GETEILT (Katalog + Gyms + Geräte im Gym): alle Nutzer lesen, jeder darf ergänzen.
 * - PRIVAT (Trainings, Pläne, Notizen …): nur der eigene Nutzer (Row Level Security in Supabase).
 *
 * Jede Zeile hat eine Client-UUID, `updatedAt` (ms) und optional `deletedAt` (Soft-Delete) –
 * Grundlage für die Offline-Synchronisierung (Last-Write-Wins je Zeile).
 */

export type ExerciseType = 'weight_reps' | 'bodyweight' | 'time_distance';
export type Split = 'push' | 'pull' | 'legs' | 'other';
export type EquipmentKind = 'selectorized' | 'plate_loaded' | 'cable' | 'free_weight' | 'bodyweight' | 'cardio';

export interface Row {
  id: string;
  updatedAt: number;
  deletedAt?: number;
}

/* ------------------------------- GETEILT -------------------------------- */

export interface Manufacturer extends Row {
  name: string;
}

/** Gerätemodell eines Herstellers, z. B. „Hoist ROC-IT Chest Press“. */
export interface EquipmentModel extends Row {
  manufacturerId: string;
  name: string;
  /** Produktlinie, z. B. „Selection 700“, „ROC-IT“ */
  line?: string;
  kind: EquipmentKind;
  /** Übung, die dieses Modell typischerweise trainiert */
  exerciseId?: string;
  weightStepKg?: number;
  /** Modellnummer des Herstellers, z. B. „RS-2301“ */
  modelNumber?: string;
  /** Quelle (Produktseite des Herstellers) */
  sourceUrl?: string;
  /** aus Herstellerangaben übernommen (nicht generiert) */
  verified?: boolean;
  createdBy?: string;
}

/** Globale Übung, z. B. „Brustpresse“. */
export interface Exercise extends Row {
  name: string;
  type: ExerciseType;
  muscleGroup?: string;
  split: Split;
  /** Freihantel/Körpergewicht: Historie automatisch über alle Gyms */
  freeWeight?: boolean;
  createdBy?: string;
}

export interface Gym extends Row {
  name: string;
  /** Kette, z. B. „McFit“, „FitX“ */
  chain?: string;
  address?: string;
  city?: string;
  createdBy?: string;
}

/** Ein konkretes Gerät in einem Gym („Gerät X steht in Gym Y“). Geteilt. */
export interface GymMachine extends Row {
  gymId: string;
  exerciseId: string;
  modelId?: string;
  /** Anzeigename im Gym, z. B. „Brustpresse (Hoist, hinten links)“ */
  label: string;
  weightStepKg: number;
  /** Tatsächlich einstellbare Gewichte (kg, aufsteigend), optional */
  weightSteps?: number[];
  createdBy?: string;
}

/* -------------------------------- PRIVAT -------------------------------- */

export interface Owned extends Row {
  userId: string;
}

/** Gyms, die ich nutze */
export interface UserGym extends Owned {
  gymId: string;
  favorite?: boolean;
}

/** Eigene Notiz zu einem Gerät (Sitz 4, Pins 2 …) */
export interface MachineNote extends Owned {
  machineId: string;
  note: string;
  startWeightKg?: number;
}

export interface Plan extends Owned {
  name: string;
  order: number;
}

export interface PlanDay extends Owned {
  planId: string;
  name: string;
  order: number;
}

export interface PlanDayExercise extends Owned {
  planDayId: string;
  exerciseId: string;
  order: number;
  sets: number;
  repMin: number;
  repMax: number;
  targetDurationSec?: number;
  targetDistanceM?: number;
}

export interface Session extends Owned {
  gymId: string;
  planDayId?: string;
  startedAt: number;
  finishedAt?: number;
  /** Plan-Übung → im Training verwendetes Gerät (Mapping/Tausch) */
  machineFor?: Record<string, string>;
  /** Eigene Reihenfolge der Plan-Übungen in diesem Training */
  order?: string[];
  notes?: string;
}

export type ExcludeReason = 'unsauber' | 'ersatz' | 'sonstiges';

export interface SetEntry extends Owned {
  sessionId: string;
  /** Gerät im Gym; leer bei Freihantel ohne konkretes Gerät */
  machineId?: string;
  exerciseId: string;
  setIndex: number;
  weightKg?: number;
  reps?: number;
  durationSec?: number;
  distanceM?: number;
  isWarmup: boolean;
  excluded?: boolean;
  excludeReason?: ExcludeReason;
  createdAt: number;
}

export interface BodyweightEntry extends Owned {
  date: string;
  weightKg: number;
}

export interface CardioEntry extends Owned {
  /** ISO yyyy-mm-dd */
  date: string;
  /** Schlüssel aus CARDIO_KINDS (oder freier Text aus Importen) */
  kind: string;
  durationMin: number;
  distanceKm?: number;
  kcal?: number;
  gymId?: string;
  /** gehört zu diesem Krafttraining (z. B. Aufwärmen auf dem Laufband) */
  sessionId?: string;
  createdAt?: number;
}

/** Cardio-Arten – bewusst eine kurze, feste Liste */
export const CARDIO_KINDS = [
  { id: 'treadmill', label: 'Laufband', icon: '🏃', distance: true },
  { id: 'run', label: 'Laufen draußen', icon: '👟', distance: true },
  { id: 'bike', label: 'Ergometer', icon: '🚴', distance: true },
  { id: 'cycling', label: 'Radfahren', icon: '🚲', distance: true },
  { id: 'cross-trainer', label: 'Crosstrainer', icon: '⛷️', distance: false },
  { id: 'rower', label: 'Rudergerät', icon: '🚣', distance: true },
  { id: 'stairs', label: 'Stepper', icon: '🪜', distance: false },
  { id: 'swim', label: 'Schwimmen', icon: '🏊', distance: true },
  { id: 'walk', label: 'Gehen', icon: '🚶', distance: true },
  { id: 'other', label: 'Sonstiges', icon: '❤️', distance: false },
] as const;

export function cardioKind(kind: string) {
  return CARDIO_KINDS.find((k) => k.id === kind) ?? { id: kind, label: kind, icon: '❤️', distance: true };
}

/** Cardio-Übungen gehören nicht in Kraft-Auswahllisten (dafür gibt es Cardio-Einträge) */
export const isCardioExercise = (e: { muscleGroup?: string }) => e.muscleGroup === 'Cardio';

/** Tabellen-Namen (lokal = remote, remote in snake_case) */
export const SHARED_TABLES = ['manufacturers', 'equipmentModels', 'exercises', 'gyms', 'gymMachines'] as const;
export const PRIVATE_TABLES = [
  'userGyms',
  'machineNotes',
  'plans',
  'planDays',
  'planDayExercises',
  'sessions',
  'sets',
  'bodyweights',
  'cardio',
] as const;
export type SharedTable = (typeof SHARED_TABLES)[number];
export type PrivateTable = (typeof PRIVATE_TABLES)[number];
export type SyncTable = SharedTable | PrivateTable;
