import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, EmptyState, PageHeader } from '../../components/ui';
import { all } from '../../local/db';
import { importSharedPlan } from '../../local/plans';
import { decodePlan, type SharedPlan } from '../../domain/planShare';
import { slotById } from '../../domain/slots';

/** Geöffneter Plan-Link: Vorschau und übernehmen */
export function PlanImportPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const exercises = useLiveQuery(async () => new Map((await all('exercises')).map((e) => [e.id, e.name])), []);
  const parsed = useMemo((): { plan?: SharedPlan; error?: string } => {
    try {
      return { plan: decodePlan(params.get('d') ?? '') };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [params]);

  if (parsed.error || !parsed.plan)
    return (
      <>
        <PageHeader title="Plan übernehmen" back={() => nav('/profile')} />
        <EmptyState title={parsed.error ?? 'Kein Plan im Link.'} />
      </>
    );
  const p = parsed.plan;
  const nameOf = (s: string | undefined, e: string) =>
    slotById(s)?.label ?? exercises?.get(e) ?? p.ex?.find((x) => x.id === e)?.name ?? 'Unbekannte Übung';

  return (
    <>
      <PageHeader title={p.name} subtitle="Geteilter Plan" back={() => nav('/profile')} />
      <div className="space-y-3">
        <p className="text-sm text-slate-400">
          {p.days.length} Trainingstage
          {p.perWeek ? ` · ${p.perWeek}× pro Woche` : ''}
          {p.deloadEvery ? ` · Deload alle ${p.deloadEvery} Wochen` : ''}
        </p>
        {p.days.map((d, i) => (
          <Card key={i}>
            <h2 className="mb-1 font-semibold">{d.n}</h2>
            <ul className="space-y-0.5 text-sm text-slate-300">
              {d.x.map((it, k) => (
                <li key={k} className="flex justify-between gap-2">
                  <span className="truncate">{nameOf(it.s, it.e)}</span>
                  <span className="shrink-0 tabular-nums text-slate-500">
                    {it.k} × {it.a}–{it.b}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
        <Button
          className="w-full"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const plan = await importSharedPlan(p);
            nav(`/profile/plan/${plan.id}`, { replace: true });
          }}
        >
          Plan übernehmen
        </Button>
        <p className="text-center text-xs text-slate-500">Wird als eigener Plan angelegt – du kannst ihn danach frei anpassen.</p>
      </div>
    </>
  );
}
