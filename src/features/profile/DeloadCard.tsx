import { useLiveQuery } from 'dexie-react-hooks';
import { Card } from '../../components/ui';
import { patch } from '../../local/db';
import { deloadState, planStart, setDeloadThisWeek } from '../../local/plans';
import { nextDeloadWeek } from '../../domain/deload';
import { isoWeek } from '../../domain/insights';
import type { Plan } from '../../model/types';

const OPTIONS = [0, 4, 5, 6, 8];

/** Deload-Intervall des Plans + manueller Schalter für diese Woche */
export function DeloadCard({ plan }: { plan: Plan }) {
  const data = useLiveQuery(async () => {
    const [state, start] = await Promise.all([deloadState(), planStart(plan.id)]);
    return { state, next: nextDeloadWeek(plan.deloadEvery, start ?? Date.now()) };
  }, [plan.id, plan.deloadEvery]);
  if (!data) return null;
  const { state, next } = data;
  const isActivePlan = state.plan?.id === plan.id;

  return (
    <Card className="space-y-3">
      <div>
        <h2 className="text-lg font-bold">Deload-Wochen</h2>
        <p className="text-xs text-slate-500">
          Regelmäßig eine leichtere Woche: ein Drittel weniger Sätze, etwa 10 % weniger Gewicht. Diese Trainings zählen nicht für die Steigerung.
        </p>
      </div>
      <div className="flex gap-1.5">
        {OPTIONS.map((n) => {
          const on = (plan.deloadEvery ?? 0) === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => patch('plans', plan.id, { deloadEvery: n || undefined })}
              className={`flex-1 rounded-full py-2 text-sm font-semibold ${on ? 'bg-white text-black' : 'bg-slate-800 text-slate-300'}`}
            >
              {n ? `${n} W.` : 'Aus'}
            </button>
          );
        })}
      </div>
      {plan.deloadEvery ? (
        <p className="text-sm text-slate-400">
          Jede {plan.deloadEvery}. Woche ab dem ersten Training mit diesem Plan.
          {next && ` Nächste: KW ${isoWeek(next)}.`}
        </p>
      ) : null}
      {isActivePlan && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-800/60 px-3 py-2.5 text-sm">
          <span>
            Diese Woche: <span className="font-semibold">{state.active ? 'Deload' : 'normal'}</span>
            {state.manual && <span className="text-slate-500"> (manuell)</span>}
          </span>
          <button type="button" className="font-semibold text-white" onClick={() => setDeloadThisWeek(state.manual ? null : !state.active)}>
            {state.manual ? 'Zurücksetzen' : state.active ? 'Normal trainieren' : 'Als Deload'}
          </button>
        </div>
      )}
    </Card>
  );
}
