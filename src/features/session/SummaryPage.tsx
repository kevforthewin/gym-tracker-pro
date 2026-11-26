import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, EmptyState, PageHeader } from '../../components/ui';
import { alive, db } from '../../local/db';
import { allHistMachines, counted, exerciseHistSets } from '../../local/queries';
import { bestLevel, historyLevels } from '../../domain/history';
import { summarizeSession, type ExerciseSummary } from '../../domain/summary';
import { fmtDate, fmtNumber } from '../../domain/units';
import type { SetEntry } from '../../model/types';

const toWork = ({ weightKg, reps, durationSec, distanceM }: SetEntry) => ({ weightKg, reps, durationSec, distanceM });

export function SummaryPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const data = useLiveQuery(async () => {
    const session = await db.sessions.get(id);
    if (!alive(session)) return null;
    const [sets, gym, day, machines] = await Promise.all([
      db.sets.where('sessionId').equals(id).toArray(),
      db.gyms.get(session.gymId),
      session.planDayId ? db.planDays.get(session.planDayId) : undefined,
      allHistMachines(),
    ]);
    const groups = new Map<string, SetEntry[]>();
    for (const s of sets.filter(counted).sort((a, b) => a.createdAt - b.createdAt)) {
      const k = `${s.exerciseId}|${s.machineId ?? ''}`;
      groups.set(k, [...(groups.get(k) ?? []), s]);
    }
    const items = await Promise.all(
      [...groups.values()].map(async (list) => {
        const first = list[0];
        const exercise = await db.exercises.get(first.exerciseId);
        const machine = first.machineId ? await db.gymMachines.get(first.machineId) : undefined;
        const hist = await exerciseHistSets(first.exerciseId);
        const free = !!exercise?.freeWeight || !machine;
        const levels = historyLevels({ machine, exerciseId: first.exerciseId, freeWeight: free }, hist.filter((h) => h.date < session.startedAt), machines, id);
        const used = bestLevel(levels, free);
        return {
          stationId: `${first.exerciseId}|${first.machineId ?? ''}`,
          label:
            machine && machine.label.trim().toLowerCase() !== exercise?.name.trim().toLowerCase()
              ? `${exercise?.name} · ${machine.label}`
              : (exercise?.name ?? '?'),
          type: exercise?.type ?? 'weight_reps',
          sets: list.sort((a, b) => a.setIndex - b.setIndex).map(toWork),
          history: used?.sessions.map((s) => s.sets) ?? [],
        } as const;
      }),
    );
    return { session, gymName: gym?.name ?? '', dayName: day?.name ?? 'Freies Training', summary: summarizeSession(items) };
  }, [id]);

  if (data === undefined) return null;
  if (data === null)
    return (
      <>
        <PageHeader title="Zusammenfassung" back={() => nav('/')} />
        <EmptyState title="Training nicht gefunden." />
      </>
    );
  const s = data.summary;
  return (
    <>
      <PageHeader title={s.prs.length ? 'Starkes Training 🏆' : 'Geschafft 💪'} back={() => nav('/')} />
      <p className="-mt-2 mb-4 text-sm text-slate-500">
        {data.dayName} · {data.gymName} · {fmtDate(data.session.startedAt)}
      </p>
      <div className="space-y-4">
        <dl className="grid grid-cols-3 gap-2 text-center">
          <Tile label="Übungen" value={String(s.exercises)} />
          <Tile label="Sätze" value={String(s.workSets)} />
          <Tile label="Volumen" value={s.volumeKg >= 10000 ? `${fmtNumber(s.volumeKg / 1000, 1)} t` : `${fmtNumber(s.volumeKg, 0)} kg`} />
        </dl>
        <Group title="🏆 Neue Bestwerte" items={s.prs} accent="text-amber-300" />
        <Group title="▲ Gesteigert" items={s.up} accent="text-emerald-400" />
        <Group title="▶ Wie letztes Mal" items={s.same} accent="text-slate-500" />
        <Group title="▼ Weniger als letztes Mal" items={s.down} accent="text-red-400" />
        <Group title="✨ Zum ersten Mal" items={s.first} accent="text-sky-300" />
        <p className="text-[11px] text-slate-500">Verglichen mit demselben Gerät – oder dem gleichen Gerätemodell in einem anderen Gym. Freihantel: über alle Gyms.</p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => nav(`/session/${data.session.id}`)}>
            Training ansehen
          </Button>
          <Button className="flex-1" onClick={() => nav('/', { replace: true })}>
            Fertig
          </Button>
        </div>
      </div>
    </>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 py-2">
      <dd className="text-lg font-bold tabular-nums">{value}</dd>
      <dt className="text-[11px] text-slate-500">{label}</dt>
    </div>
  );
}

function Group({ title, items, accent }: { title: string; items: ExerciseSummary[]; accent: string }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="mb-1.5 text-sm font-semibold">
        {title} <span className="font-normal text-slate-500">· {items.length}</span>
      </h2>
      <Card className="divide-y divide-slate-800 p-0">
        {items.map((it) => (
          <div key={it.stationId} className="flex items-baseline justify-between gap-2 px-4 py-2 text-sm">
            <span>{it.label}</span>
            <span className="shrink-0 text-right">
              <span className="tabular-nums">{it.best}</span>
              <span className={`ml-2 text-xs ${accent}`}>{it.detail}</span>
            </span>
          </div>
        ))}
      </Card>
    </section>
  );
}
