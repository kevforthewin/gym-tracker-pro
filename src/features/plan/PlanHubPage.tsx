/**
 * Tab „Plan“: aktiver Trainingsplan mit seinen Tagen auf einen Blick, Pläne wechseln/anlegen,
 * Wochenziel und die eigenen Gyms.
 */
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, Minus, Plus } from 'lucide-react';
import { Button, Card, PageHeader } from '../../components/ui';
import { all, db, getMeta, setMeta } from '../../local/db';
import { activePlan, setActivePlan, suggestNextDay } from '../../local/plans';
import { myGyms } from '../../local/queries';
import { slotById } from '../../domain/slots';
import { splitSide } from '../../domain/exerciseDefaults';
import { canonMuscle } from '../../domain/planVolume';
import { TemplatePicker } from '../profile/TemplatePicker';
import { AddGymModal } from '../gyms/GymsPage';

export function PlanHubPage() {
  const data = useLiveQuery(async () => {
    const [plans, days, pdes, exercises, active, next, goal] = await Promise.all([
      all('plans'),
      all('planDays'),
      all('planDayExercises'),
      all('exercises'),
      activePlan(),
      suggestNextDay(),
      getMeta<number>('weeklyGoal'),
    ]);
    const ex = new Map(exercises.map((e) => [e.id, e]));
    const daysOf = (planId: string) =>
      days
        .filter((d) => d.planId === planId)
        .sort((a, b) => a.order - b.order)
        .map((d) => {
          const items = pdes.filter((p) => p.planDayId === d.id);
          // links/rechts als eine Übung zählen
          const names = new Set(items.map((p) => (p.slotId ? `slot:${p.slotId}` : splitSide(ex.get(p.exerciseId)?.name ?? p.exerciseId).base.toLowerCase())));
          const muscles = new Map<string, number>();
          for (const p of items) {
            const m = ex.get(p.exerciseId)?.muscleGroup;
            if (m && m !== 'Cardio') muscles.set(canonMuscle(m), (muscles.get(canonMuscle(m)) ?? 0) + p.sets);
          }
          const top = [...muscles].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m);
          return { day: d, count: names.size, top, slots: items.some((p) => slotById(p.slotId)) };
        });
    return {
      plans: plans.sort((a, b) => a.order - b.order),
      active,
      activeDays: active ? daysOf(active.id) : [],
      dayCount: new Map(plans.map((p) => [p.id, days.filter((d) => d.planId === p.id).length])),
      next,
      goal: goal ?? 3,
    };
  }, []);
  const [picker, setPicker] = useState(false);
  if (!data) return null;
  const { plans, active, activeDays, next, goal } = data;
  const others = plans.filter((p) => p.id !== active?.id);

  return (
    <>
      <PageHeader title="Plan" right={plans.length > 0 && <Button onClick={() => setPicker(true)}>+ Plan</Button>} />
      <div className="space-y-4">
        {!active ? (
          <Card className="text-center">
            <h2 className="text-lg font-bold">Noch kein Trainingsplan</h2>
            <p className="mx-auto mt-1 max-w-xs text-sm text-slate-400">
              Starte mit einer Vorlage wie Push/Pull/Legs oder Upper/Lower. Die Übungen werden automatisch an die Geräte in deinem Gym angepasst.
            </p>
            <Button className="mt-4 w-full" onClick={() => setPicker(true)}>
              Plan erstellen
            </Button>
          </Card>
        ) : (
          <Card>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Aktiver Plan</p>
                <h2 className="truncate text-xl font-bold">{active.name}</h2>
                <p className="text-sm text-slate-500">
                  {activeDays.length} {activeDays.length === 1 ? 'Trainingstag' : 'Trainingstage'}
                  {active.deloadEvery ? ` · Deload alle ${active.deloadEvery} Wochen` : ''}
                </p>
              </div>
              <Link to={`/plan/${active.id}`} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
                Bearbeiten
              </Link>
            </div>

            <ul className="mt-3 divide-y divide-slate-800">
              {activeDays.map(({ day, count, top }) => (
                <li key={day.id}>
                  <Link to={`/plan/${active.id}?day=${day.id}`} className="flex items-center gap-3 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 font-semibold">
                        {day.name}
                        {day.id === next && <span className="chip bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300">als Nächstes</span>}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {count} {count === 1 ? 'Übung' : 'Übungen'}
                        {top.length > 0 && ` · ${top.join(', ')}`}
                      </span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-slate-600" />
                  </Link>
                </li>
              ))}
              {activeDays.length === 0 && (
                <li className="py-3 text-sm text-slate-500">
                  Noch keine Trainingstage –{' '}
                  <Link to={`/plan/${active.id}`} className="font-semibold text-white underline underline-offset-2">
                    jetzt anlegen
                  </Link>
                </li>
              )}
            </ul>

            <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-3 text-sm">
              <span className="text-slate-300">Wochenziel</span>
              <span className="flex items-center gap-2">
                <button type="button" aria-label="Wochenziel verringern" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800" onClick={() => setMeta('weeklyGoal', Math.max(1, goal - 1))}>
                  <Minus size={15} />
                </button>
                <span className="whitespace-nowrap px-1 text-center font-semibold tabular-nums">{goal}× pro Woche</span>
                <button type="button" aria-label="Wochenziel erhöhen" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800" onClick={() => setMeta('weeklyGoal', Math.min(7, goal + 1))}>
                  <Plus size={15} />
                </button>
              </span>
            </div>
          </Card>
        )}

        {others.length > 0 && (
          <section>
            <h2 className="label">Weitere Pläne</h2>
            <ul className="divide-y divide-slate-800 rounded-card bg-slate-900">
              {others.map((p) => (
                <li key={p.id} className="flex items-center gap-2 px-4 py-2.5">
                  <Link to={`/plan/${p.id}`} className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{p.name}</span>
                    <span className="text-xs text-slate-500">{data.dayCount.get(p.id) ?? 0} Tage</span>
                  </Link>
                  <button type="button" className="chip bg-slate-800 px-3 py-1.5 text-sm text-slate-200" onClick={() => setActivePlan(p.id)}>
                    <Check size={14} /> Aktivieren
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <GymsSection />
      </div>
      <TemplatePicker open={picker} onClose={() => setPicker(false)} />
    </>
  );
}

function GymsSection() {
  const gyms = useLiveQuery(myGyms, []);
  const counts = useLiveQuery(async () => {
    const m = new Map<string, number>();
    for (const g of await db.gymMachines.toArray()) if (!g.deletedAt) m.set(g.gymId, (m.get(g.gymId) ?? 0) + 1);
    return m;
  }, []);
  const [adding, setAdding] = useState(false);
  return (
    <section>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="label mb-0">Deine Gyms</h2>
        <button type="button" className="text-sm font-semibold text-white" onClick={() => setAdding(true)}>
          + Gym
        </button>
      </div>
      {gyms && gyms.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-400">Füge die Studios hinzu, in denen du trainierst – inklusive Geräteliste anderer Nutzer.</p>
          <Button className="mt-3 w-full" onClick={() => setAdding(true)}>
            Gym hinzufügen
          </Button>
        </Card>
      ) : (
        <ul className="divide-y divide-slate-800 rounded-card bg-slate-900">
          {gyms?.map((g) => (
            <li key={g.id}>
              <Link to={`/gyms/${g.id}`} className="flex items-center gap-2 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{g.name}</span>
                  {[g.chain, g.district ?? g.city].some(Boolean) && (
                    <span className="block truncate text-xs text-slate-500">{[g.chain, g.district ?? g.city].filter(Boolean).join(' · ')}</span>
                  )}
                </span>
                <span className="shrink-0 text-sm text-slate-500">{counts?.get(g.id) ?? 0} Geräte</span>
                <ChevronRight size={18} className="shrink-0 text-slate-600" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <AddGymModal open={adding} onClose={() => setAdding(false)} />
    </section>
  );
}
