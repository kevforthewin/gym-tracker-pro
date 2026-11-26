/**
 * Pläne teilen: kompaktes, versioniertes Format, als Link kodiert (base64url, ohne Server).
 * Eingehende Links sind fremde Daten → streng prüfen und begrenzen.
 */
import type { ExerciseType, Split } from '../model/types';

export interface SharedItem {
  /** Bewegungsplatz (Vorlage) */
  s?: string;
  /** Übungs-ID */
  e: string;
  /** Sätze, Wdh. min, Wdh. max */
  k: number;
  a: number;
  b: number;
}

export interface SharedExercise {
  id: string;
  name: string;
  type: ExerciseType;
  muscleGroup?: string;
  split: Split;
  freeWeight?: boolean;
}

export interface SharedPlan {
  v: 1;
  name: string;
  perWeek?: number;
  deloadEvery?: number;
  days: { n: string; x: SharedItem[] }[];
  /** eigene (nicht im Katalog enthaltene) Übungen */
  ex?: SharedExercise[];
}

const b64url = {
  encode(s: string) {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  decode(s: string) {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  },
};

export const encodePlan = (p: SharedPlan) => b64url.encode(JSON.stringify(p));

const str = (x: unknown, max = 80) => (typeof x === 'string' && x.trim() ? x.trim().slice(0, max) : undefined);
const int = (x: unknown, min: number, max: number) => (typeof x === 'number' && Number.isFinite(x) ? Math.min(max, Math.max(min, Math.round(x))) : undefined);
const TYPES: ExerciseType[] = ['weight_reps', 'bodyweight', 'time_distance'];
const SPLITS: Split[] = ['push', 'pull', 'legs', 'other'];

/** Link-Inhalt prüfen; wirft bei ungültigen Daten */
export function decodePlan(data: string): SharedPlan {
  let raw: unknown;
  try {
    raw = JSON.parse(b64url.decode(data));
  } catch {
    throw new Error('Der Link ist beschädigt.');
  }
  const r = raw as Record<string, unknown>;
  if (!r || r.v !== 1 || !Array.isArray(r.days)) throw new Error('Unbekanntes Plan-Format.');
  const name = str(r.name) ?? 'Geteilter Plan';
  const days = (r.days as unknown[]).slice(0, 14).map((d, i) => {
    const dd = d as Record<string, unknown>;
    const items = (Array.isArray(dd.x) ? dd.x : []).slice(0, 30).flatMap((it) => {
      const o = it as Record<string, unknown>;
      const e = str(o.e, 60);
      if (!e) return [];
      const a = int(o.a, 1, 100) ?? 8;
      return [{ s: str(o.s, 40), e, k: int(o.k, 1, 20) ?? 3, a, b: Math.max(a, int(o.b, 1, 100) ?? 12) }];
    });
    return { n: str(dd.n, 40) ?? `Tag ${i + 1}`, x: items };
  });
  if (!days.length) throw new Error('Der Plan enthält keine Tage.');
  const ex = (Array.isArray(r.ex) ? r.ex : []).slice(0, 100).flatMap((x) => {
    const o = x as Record<string, unknown>;
    const id = str(o.id, 60);
    const nm = str(o.name);
    if (!id || !nm) return [];
    return [
      {
        id,
        name: nm,
        type: TYPES.includes(o.type as ExerciseType) ? (o.type as ExerciseType) : 'weight_reps',
        muscleGroup: str(o.muscleGroup, 40),
        split: SPLITS.includes(o.split as Split) ? (o.split as Split) : 'other',
        freeWeight: o.freeWeight === true || undefined,
      } satisfies SharedExercise,
    ];
  });
  return { v: 1, name, perWeek: int(r.perWeek, 1, 14), deloadEvery: int(r.deloadEvery, 2, 12), days, ex: ex.length ? ex : undefined };
}
