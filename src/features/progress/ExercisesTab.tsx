/** Fortschritt → Übungen: angeheftete Charts und alle trainierten Übungen mit Entwicklung. */
import { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { MuscleTile } from '../../components/MuscleIcon';
import { ExerciseName } from '../../components/ExerciseName';
import { SPLIT_LABEL, SPLITS } from '../../domain/dashboard';
import { e1rm } from '../../domain/metrics';
import { fmtNumber, fmtShortDate } from '../../domain/units';
import { ProgressCards } from './ProgressCards';
import type { ProgressData } from './progressData';

interface Row {
  id: string;
  name: string;
  muscle?: string;
  split: keyof typeof SPLIT_LABEL;
  sessions: number;
  last: number;
  lastTs: number;
  pct: number | null;
  unit: string;
}

export function ExercisesTab({ data, onOpen }: { data: ProgressData; onOpen: (exerciseId: string) => void }) {
  const [q, setQ] = useState('');
  const rows = useMemo(() => {
    const started = new Map(data.sessions.map((s) => [s.id, s.startedAt]));
    const exOfStation = new Map(data.stations.map((s) => [s.id, s.exerciseId]));
    const byEx = new Map<string, Map<string, { w?: number; r?: number }[]>>();
    for (const s of data.sets) {
      if (s.isWarmup || s.excluded) continue;
      const ex = exOfStation.get(s.stationId)!;
      const m = byEx.get(ex) ?? new Map();
      m.set(s.sessionId, [...(m.get(s.sessionId) ?? []), { w: s.weightKg, r: s.reps }]);
      byEx.set(ex, m);
    }
    const out: Row[] = [];
    for (const [id, bySess] of byEx) {
      const ex = data.exercises.get(id);
      if (!ex || ex.type === 'time_distance') continue;
      const bw = ex.type === 'bodyweight' && [...bySess.values()].flat().every((x) => !x.w);
      const pts = [...bySess]
        .map(([sid, l]) => ({ ts: started.get(sid) ?? 0, v: Math.max(...l.map((x) => (bw ? (x.r ?? 0) : e1rm(x.w ?? 0, x.r ?? 0)))) }))
        .filter((p) => p.v > 0)
        .sort((a, b) => a.ts - b.ts);
      if (!pts.length) continue;
      const first = pts[0].v;
      const last = pts.at(-1)!;
      out.push({
        id,
        name: ex.name,
        muscle: ex.muscleGroup,
        split: ex.split,
        sessions: pts.length,
        last: last.v,
        lastTs: last.ts,
        pct: pts.length > 1 && first > 0 ? (last.v - first) / first : null,
        unit: bw ? 'Wdh.' : 'kg',
      });
    }
    return out;
  }, [data]);

  const t = q.trim().toLowerCase();
  const filtered = rows.filter((r) => !t || r.name.toLowerCase().includes(t));

  return (
    <>
      <ProgressCards onOpen={onOpen} />

      <div className="mb-2 mt-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Alle Übungen</h2>
        <span className="text-xs text-slate-500">{rows.length}</span>
      </div>
      <input className="input mb-3" placeholder="Übung suchen" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="space-y-4">
        {SPLITS.map((sp) => {
          const list = filtered.filter((r) => r.split === sp).sort((a, b) => b.lastTs - a.lastTs);
          if (!list.length) return null;
          return (
            <section key={sp}>
              <h3 className="label">{SPLIT_LABEL[sp]}</h3>
              <ul className="divide-y divide-slate-800 rounded-card bg-slate-900">
                {list.map((r) => (
                  <li key={r.id}>
                    <button type="button" className="flex w-full items-center gap-3 px-3 py-2.5 text-left" onClick={() => onOpen(r.id)}>
                      <MuscleTile muscle={r.muscle} exerciseId={r.id} />
                      <span className="min-w-0 flex-1">
                        <ExerciseName name={r.name} className="text-sm font-semibold" />
                        <span className="block text-xs text-slate-500">
                          {r.sessions} {r.sessions === 1 ? 'Training' : 'Trainings'} · zuletzt {fmtShortDate(r.lastTs)}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-bold tabular-nums">
                          {fmtNumber(r.last, r.unit === 'kg' ? 1 : 0)} <span className="text-xs font-normal text-slate-500">{r.unit}</span>
                        </span>
                        {r.pct !== null && (
                          <span className={`block text-xs tabular-nums ${r.pct > 0.005 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {r.pct > 0.005 ? '+' : r.pct < -0.005 ? '−' : '±'}
                            {fmtNumber(Math.abs(r.pct * 100), 0)} %
                          </span>
                        )}
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-slate-600" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">Wert: bestes geschätztes Maximalgewicht (1RM) im letzten Training · Veränderung seit dem ersten Training.</p>
    </>
  );
}
