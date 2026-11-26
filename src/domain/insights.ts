import { e1rm, sessionMetrics } from './metrics';
import { repsAtTop, topWeight, type SessionHistory, type Target } from './progression';

// ---------------------------------------------------------------------------
// Wochen

/** Montag 00:00 der Woche (lokale Zeit). */
export function weekStart(ts: number): number {
  const d = new Date(ts);
  const day = (d.getDay() + 6) % 7; // Mo=0
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day).getTime();
}

export const addWeeks = (weekTs: number, n: number) => {
  const d = new Date(weekTs);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n * 7).getTime();
};

/** ISO-Kalenderwoche. */
export function isoWeek(ts: number): number {
  const d = new Date(ts);
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ---------------------------------------------------------------------------
// Volumen: Arbeitssätze pro Muskelgruppe und Woche

export interface VolumeSet {
  ts: number;
  muscleGroup?: string;
  /** Einseitige Übung (links/rechts): zählt halb, damit 3 Sätze je Seite = 3 Sätze. */
  sided: boolean;
  warmup: boolean;
}

export const UNKNOWN_MUSCLE = 'Sonstige';

/** weekStart -> muscle -> Sätze */
export function weeklySets(sets: VolumeSet[]): Map<number, Map<string, number>> {
  const out = new Map<number, Map<string, number>>();
  for (const s of sets) {
    if (s.warmup) continue;
    const w = weekStart(s.ts);
    const m = s.muscleGroup || UNKNOWN_MUSCLE;
    const row = out.get(w) ?? new Map<string, number>();
    row.set(m, (row.get(m) ?? 0) + (s.sided ? 0.5 : 1));
    out.set(w, row);
  }
  return out;
}

/** Orientierung für Hypertrophie (Arbeitssätze pro Muskel und Woche). */
export const VOLUME_TARGET = { min: 10, max: 20 };

// ---------------------------------------------------------------------------
// Status

export interface StationStatusInput {
  stationId: string;
  label: string;
  history: SessionHistory[]; // älteste zuerst, nur gewertete Arbeitssätze
  target: Target;
}

export interface StatusItem {
  stationId: string;
  label: string;
  detail: string;
  date?: number;
}

export interface StatusOverview {
  deload: StatusItem[];
  stalled: StatusItem[];
  ready: StatusItem[];
  prs: StatusItem[];
}

const fmt = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 });

/** Stagnation: letzte 2 Sessions gleiches Top-Gewicht und keine Rep-Steigerung. */
export function isStalled(history: SessionHistory[]): boolean {
  const [a, b] = history.slice(-2);
  if (!a || !b) return false;
  const top = topWeight(b.sets);
  return topWeight(a.sets) === top && repsAtTop(b.sets) <= repsAtTop(a.sets);
}

export function buildStatus(items: StationStatusInput[], now = Date.now(), prWindowDays = 7): StatusOverview {
  const res: StatusOverview = { deload: [], stalled: [], ready: [], prs: [] };
  for (const it of items) {
    const last = it.history.at(-1);
    if (!last) continue;
    if (it.target.reason === 'deload') res.deload.push({ stationId: it.stationId, label: it.label, detail: it.target.message, date: last.date });
    else if (it.target.reason === 'increase')
      res.ready.push({
        stationId: it.stationId,
        label: it.label,
        detail: `→ ${fmt(it.target.sets[0]?.weightKg ?? 0)} kg`,
        date: last.date,
      });
    else if (isStalled(it.history))
      res.stalled.push({ stationId: it.stationId, label: it.label, detail: 'seit 2 Trainings keine Steigerung', date: last.date });

    // Bestwert (e1RM) im Zeitfenster?
    const series = it.history.map((h) => sessionMetrics(h.date, h.sets));
    let best = 0;
    for (const m of series) {
      if (m.bestE1rm > best) {
        if (best > 0 && m.date >= now - prWindowDays * 86400000)
          res.prs.push({ stationId: it.stationId, label: it.label, detail: `e1RM ${fmt(m.bestE1rm)} kg`, date: m.date });
        best = m.bestE1rm;
      }
    }
  }
  // je Station nur der jüngste PR
  const seen = new Set<string>();
  res.prs = res.prs.sort((a, b) => (b.date ?? 0) - (a.date ?? 0)).filter((p) => !seen.has(p.stationId) && seen.add(p.stationId));
  return res;
}

// ---------------------------------------------------------------------------
// Seitenvergleich

export interface SideComparison {
  base: string;
  left: number;
  right: number;
  /** Prozent, um die die stärkere Seite vorne liegt. */
  diffPct: number;
  weaker: 'links' | 'rechts' | null;
}

/** Vergleicht die letzte Session beider Seiten über das beste e1RM (bei 0 kg über Wdh.). */
export function compareSides(base: string, left: SessionHistory | undefined, right: SessionHistory | undefined): SideComparison | null {
  if (!left || !right) return null;
  // Gleiches Top-Gewicht -> Wdh. vergleichen (aussagekräftiger), sonst bestes e1RM.
  const sameWeight = topWeight(left.sets) === topWeight(right.sets);
  const score = (h: SessionHistory) =>
    sameWeight || topWeight(h.sets) === 0
      ? repsAtTop(h.sets)
      : Math.max(...h.sets.map((s) => e1rm(s.weightKg ?? 0, s.reps ?? 0)));
  const l = score(left);
  const r = score(right);
  if (!l || !r) return null;
  const diffPct = (Math.abs(l - r) / Math.min(l, r)) * 100;
  return { base, left: l, right: r, diffPct: Math.round(diffPct), weaker: l === r ? null : l < r ? 'links' : 'rechts' };
}
