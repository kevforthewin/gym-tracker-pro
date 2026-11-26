import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProgressCards } from './ProgressCards';
import { useLiveQuery } from 'dexie-react-hooks';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, PageHeader } from '../../components/ui';
import { all, db } from '../../local/db';
import { exerciseHistSets, machineViews } from '../../local/queries';
import { consistency, SPLIT_LABEL } from '../../domain/dashboard';
import { e1rm } from '../../domain/metrics';
import { fmtNumber, fmtShortDate } from '../../domain/units';
import type { Exercise } from '../../model/types';

/** Kategorische Farben (für dunklen Hintergrund geprüft) */
const COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#9085e9', '#0ca30c'];

export default function ProgressPage() {
  const [params, setParams] = useSearchParams();
  const exId = params.get('ex');
  const ex = useLiveQuery(async () => (exId ? await db.exercises.get(exId) : undefined), [exId]);

  if (exId && ex)
    return (
      <>
        <PageHeader title={ex.name} subtitle={SPLIT_LABEL[ex.split]} back={() => setParams({})} />
        <ExerciseProgress exercise={ex} />
      </>
    );

  return (
    <>
      <PageHeader title="Fortschritt" />
      <ConsistencyStrip />
      <ProgressCards onOpen={(id) => setParams({ ex: id })} />
    </>
  );
}

function ConsistencyStrip() {
  const c = useLiveQuery(async () => {
    const [sessions, goal] = await Promise.all([all('sessions'), db.meta.get('weeklyGoal')]);
    return consistency(
      sessions.map((s) => ({ id: s.id, gymId: s.gymId, split: 'other' as const, startedAt: s.startedAt })),
      [],
      (goal?.value as number) ?? 3,
      4,
    );
  }, []);
  if (!c) return null;
  return (
    <dl className="flex justify-between rounded-card bg-slate-900 px-4 py-3 text-center">
      <Stat label="letzte 7 Tage" value={`${c.last7}/${c.goal}`} good={c.last7 >= c.goal} />
      <Stat label="Ø/Woche (4 W.)" value={fmtNumber(c.avg4w, 1)} good={c.avg4w >= c.goal} />
      <Stat label={c.inGoalWeeks === 1 ? 'Woche im Ziel' : 'Wochen im Ziel'} value={c.inGoalWeeks ? String(c.inGoalWeeks) : '–'} good={c.inGoalWeeks > 0} />
    </dl>
  );
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div>
      <dd className={`text-base font-bold tabular-nums ${good ? 'text-emerald-400' : ''}`}>{value}</dd>
      <dt className="text-[10px] text-slate-500">{label}</dt>
    </div>
  );
}

interface Series {
  key: string;
  label: string;
  sub: string;
  modelId?: string;
  points: { date: number; value: number }[];
}

function ExerciseProgress({ exercise }: { exercise: Exercise }) {
  const data = useLiveQuery(async () => {
    const sets = await exerciseHistSets(exercise.id);
    const machineIds = [...new Set(sets.map((s) => s.machineId).filter(Boolean))] as string[];
    const machines = await machineViews((await db.gymMachines.bulkGet(machineIds)).filter((m) => !!m));
    const gyms = new Map((await all('gyms')).map((g) => [g.id, g.name]));
    const score = (list: typeof sets) =>
      exercise.type === 'time_distance'
        ? Math.max(...list.map((s) => (s.distanceM ? s.distanceM / 1000 : (s.durationSec ?? 0) / 60)))
        : exercise.type === 'bodyweight' && list.every((s) => !s.weightKg)
          ? Math.max(...list.map((s) => s.reps ?? 0))
          : Math.max(...list.map((s) => e1rm(s.weightKg ?? 0, s.reps ?? 0)));
    const bySeries = new Map<string, typeof sets>();
    for (const s of sets) {
      const k = exercise.freeWeight ? 'free' : (s.machineId ?? 'free');
      bySeries.set(k, [...(bySeries.get(k) ?? []), s]);
    }
    const series: Series[] = [...bySeries].map(([k, list]) => {
      const m = machines.find((x) => x.id === k);
      const bySession = new Map<string, typeof sets>();
      for (const s of list) bySession.set(s.sessionId, [...(bySession.get(s.sessionId) ?? []), s]);
      return {
        key: k,
        label: m ? `${gyms.get(m.gymId) ?? ''} · ${m.label}` : 'Freihantel · alle Gyms',
        sub: m?.modelTitle ?? (m ? 'ohne Modell' : ''),
        modelId: m?.modelId,
        points: [...bySession.values()].map((l) => ({ date: Math.min(...l.map((s) => s.date)), value: score(l) })).sort((a, b) => a.date - b.date),
      };
    });
    return series.sort((a, b) => (b.points.at(-1)?.date ?? 0) - (a.points.at(-1)?.date ?? 0));
  }, [exercise.id]);

  const [focus, setFocus] = useState<string>('all');
  const unit = exercise.type === 'time_distance' ? '' : exercise.type === 'bodyweight' ? 'Wdh.' : 'kg';
  const metric =
    exercise.type === 'time_distance' ? 'Bestwert (km bzw. min)' : exercise.type === 'bodyweight' ? 'Max. Wiederholungen' : 'Geschätztes 1RM (kg)';

  const visible = useMemo(() => {
    if (!data) return [];
    if (focus === 'all') return data;
    const f = data.find((s) => s.key === focus);
    return data.filter((s) => s.key === focus || (f?.modelId && s.modelId === f.modelId));
  }, [data, focus]);

  if (!data) return null;
  const color = (k: string) => COLORS[data.findIndex((s) => s.key === k) % COLORS.length];

  return (
    <Card>
      <h2 className="mb-1 text-sm font-semibold">{metric}</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <LineChart margin={{ top: 10, right: 12, bottom: 0, left: -8 }}>
            <CartesianGrid stroke="currentColor" strokeOpacity={0.1} vertical={false} />
            <XAxis
              dataKey="date"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              allowDuplicatedCategory={false}
              tickFormatter={fmtShortDate}
              tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
              stroke="currentColor"
              strokeOpacity={0.2}
              minTickGap={24}
            />
            <YAxis
              tickFormatter={(v: number) => fmtNumber(v, 0)}
              tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
              stroke="currentColor"
              strokeOpacity={0.2}
              width={44}
              domain={['auto', 'auto']}
            />
            <Tooltip
              labelFormatter={(d: number) => new Date(d).toLocaleDateString('de-DE')}
              formatter={(v: number, name: string) => [`${fmtNumber(v, 1)} ${unit}`, name]}
              contentStyle={{ borderRadius: 8, fontSize: 13, color: '#f1f5f9', background: '#0f172a', border: '1px solid #334155' }}
            />
            {visible.map((s) => (
              <Line
                key={s.key}
                data={s.points}
                dataKey="value"
                name={s.label}
                stroke={color(s.key)}
                strokeWidth={2}
                strokeDasharray={focus !== 'all' && s.key !== focus ? '5 4' : undefined}
                dot={{ r: 3, fill: color(s.key), strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {data.length > 1 && (
          <li>
            <button type="button" className={`w-full rounded-md px-2 py-1.5 text-left ${focus === 'all' ? 'bg-slate-700' : ''}`} onClick={() => setFocus('all')}>
              Alle Geräte
            </button>
          </li>
        )}
        {data.map((s) => (
          <li key={s.key}>
            <button
              type="button"
              className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left ${focus === s.key ? 'bg-slate-700' : ''}`}
              onClick={() => setFocus(s.key)}
            >
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color(s.key) }} />
              <span className="flex-1">
                {s.label}
                {s.sub && <span className="block text-xs text-slate-500">{s.sub}</span>}
              </span>
              <span className="tabular-nums text-slate-400">
                {fmtNumber(s.points.at(-1)?.value ?? 0, 1)} {unit}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {focus !== 'all' && visible.length > 1 && <p className="mt-2 text-xs text-slate-500">Gestrichelt: gleiches Gerätemodell in anderen Gyms.</p>}
    </Card>
  );
}
