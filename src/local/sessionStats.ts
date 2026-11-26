/** Kennzahlen je Training (Sätze, Volumen, Bestwerte, Bereiche) – für Verlauf und Startseite. */
import { e1rm } from '../domain/metrics';
import type { Split } from '../model/types';
import { all } from './db';
import { counted } from './queries';

export interface SessionStat {
  id: string;
  gymId: string;
  gymName: string;
  dayName: string;
  startedAt: number;
  finished: boolean;
  sets: number;
  volume: number;
  prs: number;
  splits: Split[];
}

export async function sessionStats(): Promise<SessionStat[]> {
  const [sessions, sets, exercises, gyms, days] = await Promise.all([all('sessions'), all('sets'), all('exercises'), all('gyms'), all('planDays')]);
  const ex = new Map(exercises.map((e) => [e.id, e]));
  const gymName = new Map(gyms.map((g) => [g.id, g.name]));
  const dayName = new Map(days.map((d) => [d.id, d.name]));
  const start = new Map(sessions.map((s) => [s.id, s.startedAt]));
  const stat = new Map<string, SessionStat>(
    sessions.map((s) => [
      s.id,
      {
        id: s.id,
        gymId: s.gymId,
        gymName: gymName.get(s.gymId) ?? '',
        dayName: dayName.get(s.planDayId ?? '') ?? 'Freies Training',
        startedAt: s.startedAt,
        finished: !!s.finishedAt,
        sets: 0,
        volume: 0,
        prs: 0,
        splits: [],
      },
    ]),
  );
  // chronologisch, damit Bestwerte gegen alles Vorherige geprüft werden
  const work = sets.filter((s) => counted(s) && start.has(s.sessionId)).sort((a, b) => start.get(a.sessionId)! - start.get(b.sessionId)! || a.createdAt - b.createdAt);
  const best = new Map<string, number>();
  for (const s of work) {
    const st = stat.get(s.sessionId)!;
    const e = ex.get(s.exerciseId);
    st.sets++;
    st.volume += (s.weightKg ?? 0) * (s.reps ?? 0);
    if (e && !st.splits.includes(e.split)) st.splits.push(e.split);
    if (e?.type === 'time_distance') continue;
    const key = e?.freeWeight || !s.machineId ? `ex:${s.exerciseId}` : `m:${s.machineId}`;
    const v = e?.type === 'bodyweight' && !s.weightKg ? (s.reps ?? 0) : e1rm(s.weightKg ?? 0, s.reps ?? 0);
    const prev = best.get(key);
    if (prev !== undefined && v > prev + 1e-9) st.prs++;
    best.set(key, Math.max(prev ?? 0, v));
  }
  return [...stat.values()].map((s) => ({ ...s, volume: Math.round(s.volume) })).sort((a, b) => b.startedAt - a.startedAt);
}
