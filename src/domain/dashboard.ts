/**
 * Auswertungen für das Fortschritt-Dashboard – reine Funktionen ohne DB/React.
 */
import { addWeeks, weekStart } from './insights';
import { e1rm } from './metrics';
import type { WorkSet } from './progression';
import { splitSide } from './exerciseDefaults';
import type { ExerciseType } from '../model/types';

const DAY = 86400000;

export type Split = 'push' | 'pull' | 'legs' | 'other';
export const SPLITS: Split[] = ['push', 'pull', 'legs', 'other'];
export const SPLIT_LABEL: Record<Split, string> = { push: 'Push', pull: 'Pull', legs: 'Legs', other: 'Frei' };

/** Trainingstag-Name -> Split ("Push", "Beine", "Legs (A)" …). */
export function splitOfDayName(name?: string): Split {
  const n = (name ?? '').toLowerCase();
  if (/push|drück|brust/.test(n)) return 'push';
  if (/pull|zieh|rücken/.test(n)) return 'pull';
  if (/leg|bein/.test(n)) return 'legs';
  return 'other';
}

export const isoOf = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const startOfDay = (ts: number) => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
const addDays = (ts: number, n: number) => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n).getTime();
};

// ---------------------------------------------------------------------------
// Eingabedaten

export interface DSession {
  id: string;
  gymId: string;
  split: Split;
  startedAt: number;
}
export interface DSet {
  sessionId: string;
  stationId: string;
  weightKg?: number;
  reps?: number;
  isWarmup: boolean;
  excluded?: boolean;
  setIndex: number;
  createdAt: number;
}
export interface DStation {
  id: string;
  gymId: string;
  exerciseId: string;
  name: string;
  weightIncrement: number;
  weightSteps?: number[];
  startWeight?: number;
}
export interface DExercise {
  id: string;
  name: string;
  type: ExerciseType;
}
export interface DCardio {
  date: string;
  durationMin: number;
}

// ---------------------------------------------------------------------------
// 1) Konsistenz

export interface DayCell {
  date: string;
  ts: number;
  splits: Split[];
  sessionIds: string[];
  cardioMin: number;
  future: boolean;
}
export interface WeekCol {
  start: number;
  days: DayCell[];
  sessions: number;
  goalMet: boolean;
  current: boolean;
}
export interface Consistency {
  weeks: WeekCol[];
  /** Trainings in den letzten 7 Tagen (inkl. heute) */
  last7: number;
  /** Ø Trainings pro Woche, rollierend über die letzten 28 Tage */
  avg4w: number;
  /** dasselbe für die 28 Tage davor (Trend) */
  avg4wPrev: number;
  /** Seit wie vielen Wochen liegt der rollierende 4-Wochen-Schnitt durchgehend auf/über dem Ziel? */
  inGoalWeeks: number;
  goal: number;
}

export function consistency(sessions: DSession[], cardio: DCardio[], goal: number, weeks = 16, now = Date.now()): Consistency {
  const cur = weekStart(now);
  const today = startOfDay(now);
  const byDay = new Map<string, DSession[]>();
  for (const s of sessions) byDay.set(isoOf(s.startedAt), [...(byDay.get(isoOf(s.startedAt)) ?? []), s]);
  const cardioByDay = new Map<string, number>();
  for (const c of cardio) cardioByDay.set(c.date, (cardioByDay.get(c.date) ?? 0) + c.durationMin);

  const cols: WeekCol[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addWeeks(cur, -i);
    const days: DayCell[] = Array.from({ length: 7 }, (_, d) => {
      const ts = addDays(start, d);
      const date = isoOf(ts);
      const ss = byDay.get(date) ?? [];
      return {
        date,
        ts,
        splits: [...new Set(ss.map((s) => s.split))],
        sessionIds: ss.map((s) => s.id),
        cardioMin: cardioByDay.get(date) ?? 0,
        future: ts > today,
      };
    });
    const n = days.reduce((a, d) => a + d.sessionIds.length, 0);
    cols.push({ start, days, sessions: n, goalMet: n >= goal, current: start === cur });
  }

  // Rollierende Fenster (Tage, heute inklusive) – unabhängig von Kalenderwochen
  const starts = sessions.map((x) => startOfDay(x.startedAt));
  const countDays = (lastDay: number, days: number) => {
    const from = addDays(lastDay, -(days - 1));
    return starts.filter((t) => t >= from && t <= lastDay).length;
  };
  const avgAt = (lastDay: number) => countDays(lastDay, 28) / 4;
  let inGoalWeeks = 0;
  while (inGoalWeeks < 104 && avgAt(addDays(today, -7 * inGoalWeeks)) >= goal) inGoalWeeks++;

  return {
    weeks: cols,
    last7: countDays(today, 7),
    avg4w: avgAt(today),
    avg4wPrev: avgAt(addDays(today, -28)),
    inGoalWeeks,
    goal,
  };
}

// ---------------------------------------------------------------------------
// 2) Push / Pull / Legs-Balance

export interface SplitStat {
  split: Split;
  sessions: number;
  sets: number;
  share: number; // Anteil an Sätzen 0..1
  lastTs?: number;
  daysSince?: number;
}

export function splitBalance(sessions: DSession[], sets: DSet[], sinceTs: number, now = Date.now()): SplitStat[] {
  const workBySession = new Map<string, number>();
  for (const s of sets) if (!s.isWarmup) workBySession.set(s.sessionId, (workBySession.get(s.sessionId) ?? 0) + 1);
  const res = SPLITS.map((split) => {
    const all = sessions.filter((s) => s.split === split);
    const inWin = all.filter((s) => s.startedAt >= sinceTs);
    const lastTs = all.reduce<number | undefined>((m, s) => (m === undefined || s.startedAt > m ? s.startedAt : m), undefined);
    return {
      split,
      sessions: inWin.length,
      sets: inWin.reduce((a, s) => a + (workBySession.get(s.id) ?? 0), 0),
      share: 0,
      lastTs,
      daysSince: lastTs === undefined ? undefined : Math.floor((startOfDay(now) - startOfDay(lastTs)) / DAY),
    };
  });
  const total = res.reduce((a, r) => a + r.sets, 0);
  for (const r of res) r.share = total ? r.sets / total : 0;
  return res;
}

/** Hinweise bei Ungleichgewicht (nur Push/Pull/Legs). */
export function balanceWarnings(stats: SplitStat[]): string[] {
  const main = stats.filter((s) => s.split !== 'other');
  const total = main.reduce((a, s) => a + s.sets, 0);
  if (!total) return [];
  const out: string[] = [];
  for (const s of main) {
    const share = s.sets / total;
    if (share < 0.2)
      out.push(
        `${SPLIT_LABEL[s.split]}: nur ${Math.round(share * 100)} % der Sätze` +
          (s.daysSince !== undefined ? `, zuletzt vor ${s.daysSince} Tagen` : ', noch nie trainiert'),
      );
    else if (s.daysSince !== undefined && s.daysSince >= 10) out.push(`${SPLIT_LABEL[s.split]}: zuletzt vor ${s.daysSince} Tagen`);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Gemeinsame Aufbereitung: Sessions je Station (gewertete Arbeitssätze)

interface StationSession {
  sessionId: string;
  ts: number;
  sets: WorkSet[];
}

function stationSessions(sessions: DSession[], sets: DSet[]): Map<string, StationSession[]> {
  const sessTs = new Map(sessions.map((s) => [s.id, s.startedAt]));
  const tmp = new Map<string, Map<string, DSet[]>>();
  for (const s of sets) {
    if (s.isWarmup || s.excluded || !sessTs.has(s.sessionId)) continue;
    const st = tmp.get(s.stationId) ?? new Map<string, DSet[]>();
    st.set(s.sessionId, [...(st.get(s.sessionId) ?? []), s]);
    tmp.set(s.stationId, st);
  }
  const out = new Map<string, StationSession[]>();
  for (const [stationId, bySess] of tmp) {
    out.set(
      stationId,
      [...bySess]
        .map(([sessionId, list]) => ({
          sessionId,
          ts: sessTs.get(sessionId)!,
          sets: list
            .sort((a, b) => a.setIndex - b.setIndex || a.createdAt - b.createdAt)
            .map(({ weightKg, reps }) => ({ weightKg, reps })),
        }))
        .sort((a, b) => a.ts - b.ts),
    );
  }
  return out;
}

// ---------------------------------------------------------------------------
// 4) Fortschrittsquote: bestes e1RM letzte 4 Wochen vs. 4 Wochen davor

export interface ProgressItem {
  stationId: string;
  label: string;
  before: number;
  now: number;
  pct: number;
  unit: 'kg' | 'Wdh.';
}
export interface ProgressRate {
  up: ProgressItem[];
  flat: ProgressItem[];
  down: ProgressItem[];
}

const sessionScore = (type: ExerciseType, sets: WorkSet[]) => {
  const top = Math.max(0, ...sets.map((s) => s.weightKg ?? 0));
  if (type === 'bodyweight' && top === 0) return { v: Math.max(0, ...sets.map((s) => s.reps ?? 0)), unit: 'Wdh.' as const };
  return { v: Math.max(0, ...sets.map((s) => e1rm(s.weightKg ?? 0, s.reps ?? 0))), unit: 'kg' as const };
};

export function progressRate(
  sessions: DSession[],
  sets: DSet[],
  stations: DStation[],
  exercises: Map<string, DExercise>,
  include: (station: DStation) => boolean,
  opts: { days?: number; now?: number; threshold?: number } = {},
): ProgressRate {
  const now = opts.now ?? Date.now();
  const days = opts.days ?? 28;
  const thr = opts.threshold ?? 0.01;
  const winFrom = now - days * DAY;
  const prevFrom = winFrom - days * DAY;
  const per = stationSessions(sessions, sets);
  const res: ProgressRate = { up: [], flat: [], down: [] };
  for (const st of stations) {
    const ex = exercises.get(st.exerciseId);
    if (!ex || ex.type === 'time_distance' || !include(st)) continue;
    const hist = per.get(st.id) ?? [];
    const win = hist.filter((h) => h.ts >= winFrom);
    let prev = hist.filter((h) => h.ts >= prevFrom && h.ts < winFrom);
    if (!prev.length) prev = hist.filter((h) => h.ts < winFrom).slice(-1); // sonst letzte Session davor
    if (!win.length || !prev.length) continue;
    const best = (list: StationSession[]) => {
      const scores = list.map((h) => sessionScore(ex.type, h.sets));
      return { v: Math.max(...scores.map((s) => s.v)), unit: scores[0].unit };
    };
    const a = best(prev);
    const b = best(win);
    if (!a.v || a.unit !== b.unit) continue;
    const pct = (b.v - a.v) / a.v;
    const item = { stationId: st.id, label: st.name, before: a.v, now: b.v, pct, unit: b.unit };
    (pct > thr ? res.up : pct < -thr ? res.down : res.flat).push(item);
  }
  res.up.sort((x, y) => y.pct - x.pct);
  res.down.sort((x, y) => x.pct - y.pct);
  res.flat.sort((x, y) => x.label.localeCompare(y.label));
  return res;
}

// ---------------------------------------------------------------------------
// 5) Kraft-Highlights: meisttrainierte Übungen, Verlauf je Gym

export interface HighlightSeries {
  gymId: string;
  unit: 'kg' | 'Wdh.';
  stationId: string;
  points: { ts: number; v: number }[];
  first: number;
  last: number;
  pct: number;
}
export interface Highlight {
  exerciseId: string;
  name: string;
  unit: 'kg' | 'Wdh.';
  sessions: number;
  series: HighlightSeries[];
}

export function strengthHighlights(
  sessions: DSession[],
  sets: DSet[],
  stations: DStation[],
  exercises: Map<string, DExercise>,
  include: (station: DStation) => boolean,
  opts: { weeks?: number; max?: number; now?: number } = {},
): Highlight[] {
  const now = opts.now ?? Date.now();
  const from = now - (opts.weeks ?? 12) * 7 * DAY;
  const per = stationSessions(sessions, sets);
  const byExercise = new Map<string, HighlightSeries[]>();
  const count = new Map<string, number>();
  for (const st of stations) {
    const ex = exercises.get(st.exerciseId);
    if (!ex || ex.type === 'time_distance' || splitSide(ex.name).side || !include(st)) continue;
    const hist = (per.get(st.id) ?? []).filter((h) => h.ts >= from);
    if (hist.length < 2) {
      count.set(ex.id, (count.get(ex.id) ?? 0) + hist.length);
      continue;
    }
    const scored = hist.map((h) => ({ ts: h.ts, ...sessionScore(ex.type, h.sets) }));
    const unit = scored[scored.length - 1].unit;
    const points = scored.filter((p) => p.v > 0 && p.unit === unit).map(({ ts, v }) => ({ ts, v }));
    if (points.length < 2) continue;
    const first = points[0].v;
    const last = points[points.length - 1].v;
    byExercise.set(ex.id, [
      ...(byExercise.get(ex.id) ?? []),
      { gymId: st.gymId, unit, stationId: st.id, points, first, last, pct: (last - first) / first },
    ]);
    count.set(ex.id, (count.get(ex.id) ?? 0) + hist.length);
  }
  return [...byExercise]
    .map(([exerciseId, series]) => ({
      exerciseId,
      name: exercises.get(exerciseId)!.name,
      unit: series[0].unit,
      sessions: count.get(exerciseId) ?? 0,
      series,
    }))
    .sort((a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name))
    .slice(0, opts.max ?? 6);
}

// ---------------------------------------------------------------------------
// Fortschritt je Übung (gym-übergreifend zusammengefasst)

export interface ExerciseProgress {
  exerciseId: string;
  name: string;
  /** Mittelwert der relativen Veränderung über die Geräte (Gyms) */
  pct: number;
  parts: (ProgressItem & { gymId: string })[];
}
export interface ExerciseProgressRate {
  up: ExerciseProgress[];
  flat: ExerciseProgress[];
  down: ExerciseProgress[];
}

/** Fasst die Fortschrittsquote je Übung zusammen – unabhängig davon, in welchem Gym trainiert wurde. */
export function progressByExercise(
  rate: ProgressRate,
  stations: DStation[],
  exercises: Map<string, DExercise>,
  threshold = 0.01,
): ExerciseProgressRate {
  const st = new Map(stations.map((s) => [s.id, s]));
  const groups = new Map<string, ExerciseProgress>();
  for (const it of [...rate.up, ...rate.flat, ...rate.down]) {
    const s = st.get(it.stationId);
    if (!s) continue;
    const g = groups.get(s.exerciseId) ?? { exerciseId: s.exerciseId, name: exercises.get(s.exerciseId)?.name ?? it.label, pct: 0, parts: [] };
    g.parts.push({ ...it, gymId: s.gymId });
    groups.set(s.exerciseId, g);
  }
  const res: ExerciseProgressRate = { up: [], flat: [], down: [] };
  for (const g of groups.values()) {
    g.pct = g.parts.reduce((a, p) => a + p.pct, 0) / g.parts.length;
    (g.pct > threshold ? res.up : g.pct < -threshold ? res.down : res.flat).push(g);
  }
  res.up.sort((a, b) => b.pct - a.pct);
  res.down.sort((a, b) => a.pct - b.pct);
  res.flat.sort((a, b) => a.name.localeCompare(b.name));
  return res;
}
