import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card } from '../../components/ui';
import { getMeta } from '../../local/db';
import { MINOR_RANGE, planVolume, VOLUME_RANGE, type MuscleVolume } from '../../domain/planVolume';
import { fmtNumber } from '../../domain/units';
import type { Exercise, PlanDay, PlanDayExercise } from '../../model/types';

const SCALE_MAX = 24;
const COLOR = { low: '#ff9f0a', ok: '#30d158', high: '#ff453a' } as const;
const LABEL = { low: 'zu wenig', ok: 'gut', high: 'sehr viel' } as const;

/** Sätze pro Muskel und Woche für diesen Plan – mit Empfehlungsbereich 10–20 */
export function PlanVolumeCard({ days, pdes, exercises }: { days: PlanDay[]; pdes: PlanDayExercise[]; exercises: Map<string, Exercise> }) {
  const perWeek = useLiveQuery(async () => (await getMeta<number>('weeklyGoal')) ?? 3, []);
  const [all, setAll] = useState(false);
  if (!perWeek || !days.length) return null;
  const volume = planVolume({
    perWeek,
    days: days.map((d) => ({
      items: pdes
        .filter((p) => p.planDayId === d.id)
        .map((p) => ({ exerciseId: p.exerciseId, muscle: exercises.get(p.exerciseId)?.muscleGroup, sets: p.sets })),
    })),
  });
  const low = volume.filter((v) => v.status === 'low' && v.sets > 0);
  const missing = volume.filter((v) => v.sets === 0 && !v.minor);
  const shown = all ? volume : volume.filter((v) => v.sets > 0);

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">Wochenvolumen</h2>
        <span className="text-xs text-slate-500">bei {perWeek}× pro Woche</span>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">
        Arbeitssätze pro Muskel und Woche. Empfohlen: {VOLUME_RANGE.min}–{VOLUME_RANGE.max}, kleine Muskeln (Bauch, Waden …) {MINOR_RANGE.min}–
        {MINOR_RANGE.max}. Mittrainierte Muskeln zählen halb.
      </p>
      <ul className="mt-3 space-y-1.5">
        {shown.map((v) => (
          <Row key={v.muscle} v={v} />
        ))}
      </ul>
      {(low.length > 0 || missing.length > 0) && (
        <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {low.length > 0 && <>Wenig Volumen: {low.map((v) => v.muscle).join(', ')}. </>}
          {missing.length > 0 && <>Nicht trainiert: {missing.map((v) => v.muscle).join(', ')}.</>}
        </p>
      )}
      <button type="button" className="mt-2 w-full py-1 text-xs text-slate-400" onClick={() => setAll(!all)}>
        {all ? 'Nur trainierte Muskeln' : 'Alle Muskeln zeigen'}
      </button>
    </Card>
  );
}

function Row({ v }: { v: MuscleVolume }) {
  const pct = (x: number) => `${Math.min(100, (x / SCALE_MAX) * 100)}%`;
  return (
    <li className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-2 text-sm">
      <span className="truncate text-slate-300">{v.muscle}</span>
      <span className="relative h-2.5 rounded-full bg-slate-800">
        {/* Empfehlungsbereich */}
        <span
          className="absolute inset-y-0 rounded-full bg-slate-700"
          style={{ left: pct(v.min), width: `calc(${pct(v.max)} - ${pct(v.min)})` }}
        />
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: pct(v.sets), background: COLOR[v.status] }} />
      </span>
      <span className="text-right tabular-nums" title={LABEL[v.status]}>
        {fmtNumber(v.sets, 1)}
      </span>
    </li>
  );
}
