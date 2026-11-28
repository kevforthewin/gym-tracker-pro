/**
 * Gemeinsame Daten für den Fortschritt-Bereich: Trainings, Sätze, „Stationen“ (Gerät je Gym bzw. Freihantel),
 * Wochen-Volumen je Muskel (Hauptmuskel voll, Nebenmuskeln halb, links/rechts je Seite halb).
 */
import { useLiveQuery } from 'dexie-react-hooks';
import { all, getMeta } from '../../local/db';
import { splitOfDayName, type DCardio, type DExercise, type DSession, type DSet, type DStation, type Split } from '../../domain/dashboard';
import { weekStart } from '../../domain/insights';
import { secondaryOf } from '../../domain/muscles';
import { canonMuscle } from '../../domain/planVolume';
import { splitSide } from '../../domain/exerciseDefaults';
import { matchCatalog } from '../../import/legacyBackup';
import type { BodyweightEntry, Exercise, Gym } from '../../model/types';

/** Station-ID für Freihantel-Übungen (gym-übergreifend) */
export const FREE = (exerciseId: string) => `free:${exerciseId}`;
export const ALL_GYMS = 'all';

/** Ruhige, auf Schwarz gut unterscheidbare Farben */
export const SPLIT_COLOR: Record<Split, string> = { push: '#3987e5', pull: '#199e70', legs: '#c98500', other: '#8e8e93' };
export const CARDIO_COLOR = '#ffd60a';
export const GYM_COLORS = ['#64d2ff', '#ff9f0a', '#bf5af2', '#30d158', '#ff6482'];

export interface SessionInfo {
  dayName: string;
  gymName: string;
}

export interface ProgressData {
  sessions: DSession[];
  sets: DSet[];
  stations: DStation[];
  exercises: Map<string, DExercise & Exercise>;
  gyms: Gym[];
  gymColor: (gymId: string) => string;
  gymLabel: (gymId: string) => string;
  sessionInfo: Map<string, SessionInfo>;
  cardio: DCardio[];
  goal: number;
  /** weekStart → Muskel → Arbeitssätze */
  volume: Map<number, Map<string, number>>;
  /** Einzelne Volumen-Beiträge mit Zeitpunkt – für rollierende Zeiträume */
  volumeEntries: { ts: number; muscle: string; v: number }[];
  bodyweights: BodyweightEntry[];
}

export function useProgressData(): ProgressData | undefined {
  return useLiveQuery(async () => {
    const [sessionsRaw, setsRaw, machines, exercisesRaw, gyms, days, cardioRaw, bodyweights, goal] = await Promise.all([
      all('sessions'),
      all('sets'),
      all('gymMachines'),
      all('exercises'),
      all('gyms'),
      all('planDays'),
      all('cardio'),
      all('bodyweights'),
      getMeta<number>('weeklyGoal'),
    ]);
    const exercises = new Map(exercisesRaw.map((e) => [e.id, e as DExercise & Exercise]));
    const dayName = new Map(days.map((d) => [d.id, d.name]));
    const gymName = new Map(gyms.map((g) => [g.id, g.name]));
    const machine = new Map(machines.map((m) => [m.id, m]));

    // Trainings mit mindestens einem Satz
    const setsBySession = new Map<string, typeof setsRaw>();
    for (const s of setsRaw) setsBySession.set(s.sessionId, [...(setsBySession.get(s.sessionId) ?? []), s]);
    const sessions: DSession[] = [];
    const sessionInfo = new Map<string, SessionInfo>();
    for (const s of sessionsRaw) {
      const list = setsBySession.get(s.id);
      if (!list?.length) continue;
      let split = splitOfDayName(s.planDayId ? dayName.get(s.planDayId) : undefined);
      if (split === 'other') {
        // freies Training: häufigster Split der trainierten Übungen
        const count = new Map<Split, number>();
        for (const x of list) {
          const sp = exercises.get(x.exerciseId)?.split;
          if (sp && sp !== 'other') count.set(sp, (count.get(sp) ?? 0) + 1);
        }
        split = [...count].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'other';
      }
      sessions.push({ id: s.id, gymId: s.gymId, split, startedAt: s.startedAt });
      sessionInfo.set(s.id, { dayName: (s.planDayId && dayName.get(s.planDayId)) || 'Freies Training', gymName: gymName.get(s.gymId) ?? '' });
    }
    const started = new Map(sessions.map((s) => [s.id, s.startedAt]));

    // Stationen: Gerät je Gym, Freihantel über alle Gyms
    const stationOf = (s: (typeof setsRaw)[number]) => {
      const ex = exercises.get(s.exerciseId);
      return ex?.freeWeight || !s.machineId ? FREE(s.exerciseId) : s.machineId;
    };
    const stations = new Map<string, DStation>();
    const sets: DSet[] = [];
    for (const s of setsRaw) {
      if (!started.has(s.sessionId)) continue;
      const id = stationOf(s);
      if (!stations.has(id)) {
        const m = id.startsWith('free:') ? undefined : machine.get(id);
        stations.set(id, {
          id,
          gymId: m?.gymId ?? ALL_GYMS,
          exerciseId: s.exerciseId,
          name: m?.label ?? exercises.get(s.exerciseId)?.name ?? '',
          weightIncrement: m?.weightStepKg ?? 2.5,
        });
      }
      sets.push({
        sessionId: s.sessionId,
        stationId: id,
        weightKg: s.weightKg,
        reps: s.reps,
        isWarmup: s.isWarmup,
        excluded: s.excluded,
        setIndex: s.setIndex,
        createdAt: s.createdAt,
      });
    }

    // Wochen-Volumen
    const volume = new Map<number, Map<string, number>>();
    const volumeEntries: { ts: number; muscle: string; v: number }[] = [];
    const add = (w: number, m: string, v: number, ts: number) => {
      volumeEntries.push({ ts, muscle: canonMuscle(m), v });
      const row = volume.get(w) ?? new Map<string, number>();
      const k = canonMuscle(m);
      row.set(k, (row.get(k) ?? 0) + v);
      volume.set(w, row);
    };
    for (const s of setsRaw) {
      const ts = started.get(s.sessionId);
      const ex = exercises.get(s.exerciseId);
      if (!ts || !ex || s.isWarmup || s.excluded || ex.type === 'time_distance' || !ex.muscleGroup || ex.muscleGroup === 'Cardio') continue;
      const w = weekStart(ts);
      const f = splitSide(ex.name).side ? 0.5 : 1;
      add(w, ex.muscleGroup, f, ts);
      for (const m of secondaryOf((ex.createdBy && matchCatalog(ex.name)) || ex.id)) add(w, m, f * 0.5, ts);
    }

    const myGymIds = [...new Set(sessions.map((s) => s.gymId))];
    return {
      sessions,
      sets,
      stations: [...stations.values()],
      exercises,
      gyms,
      gymColor: (id: string) => (id === ALL_GYMS ? '#f2f2f7' : GYM_COLORS[Math.max(0, myGymIds.indexOf(id)) % GYM_COLORS.length]),
      gymLabel: (id: string) => (id === ALL_GYMS ? 'alle Gyms' : (gymName.get(id) ?? '').split(/\s+/)[0]),
      sessionInfo,
      cardio: cardioRaw.map((c) => ({ date: c.date, durationMin: c.durationMin })),
      goal: goal ?? 3,
      volume,
      volumeEntries,
      bodyweights: bodyweights.sort((a, b) => a.date.localeCompare(b.date)),
    };
  }, []);
}
