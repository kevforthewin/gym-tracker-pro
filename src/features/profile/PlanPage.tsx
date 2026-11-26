import { useState } from 'react';
import { ArrowUp, X } from 'lucide-react';
import { MuscleTile } from '../../components/MuscleIcon';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Modal, PageHeader } from '../../components/ui';
import { alive, all, db, patch, remove, save } from '../../local/db';
import { SPLIT_LABEL } from '../../domain/dashboard';
import { slotById } from '../../domain/slots';
import { isCardioExercise, type PlanDay, type PlanDayExercise, type Split } from '../../model/types';

export function PlanPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const plan = useLiveQuery(() => db.plans.get(id), [id]);
  const days = useLiveQuery(async () => (await db.planDays.where('planId').equals(id).toArray()).filter(alive).sort((a, b) => a.order - b.order), [id]);
  const pdes = useLiveQuery(async () => (await all('planDayExercises')).sort((a, b) => a.order - b.order), []);
  const exercises = useLiveQuery(async () => new Map((await all('exercises')).map((e) => [e.id, e])), []);
  const [adding, setAdding] = useState<PlanDay | null>(null);

  if (!alive(plan)) return null;

  const addDay = async () => {
    const name = prompt('Name des Trainingstags', 'Push');
    if (name) await save('planDays', { planId: id, name, order: days?.length ?? 0 });
  };
  const deletePlan = async () => {
    if (!confirm(`Plan „${plan.name}“ löschen? Bisherige Trainings bleiben erhalten.`)) return;
    await remove('plans', id);
    nav('/profile');
  };

  return (
    <>
      <PageHeader title={plan.name} back={() => nav('/profile')} right={<Button onClick={addDay}>+ Tag</Button>} />
      <div className="space-y-4">
        {days?.map((d) => {
          const list = pdes?.filter((p) => p.planDayId === d.id) ?? [];
          return (
            <Card key={d.id}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{d.name}</h2>
                <button
                  type="button"
                  className="text-sm text-slate-500"
                  onClick={async () => {
                    const name = prompt('Name', d.name);
                    if (name === '') {
                      if (confirm('Tag löschen?')) await remove('planDays', d.id);
                    } else if (name) await patch('planDays', d.id, { name });
                  }}
                >
                  Umbenennen
                </button>
              </div>
              <ul className="divide-y divide-slate-800">
                {list.map((p, i) => (
                  <PdeRow
                    key={p.id}
                    pde={p}
                    name={slotById(p.slotId)?.label ?? exercises?.get(p.exerciseId)?.name ?? '?'}
                    hint={
                      p.slotId
                        ? (slotById(p.slotId)?.alternatives ?? [])
                            .map((a) => exercises?.get(a)?.name)
                            .filter(Boolean)
                            .join(' / ')
                        : undefined
                    }
                    prev={list[i - 1]}
                    muscle={exercises?.get(p.exerciseId)?.muscleGroup}
                  />
                ))}
              </ul>
              <Button variant="secondary" className="mt-2 w-full" onClick={() => setAdding(d)}>
                + Übung
              </Button>
            </Card>
          );
        })}
      </div>
      <button type="button" className="mt-8 w-full py-2 text-sm text-red-400" onClick={deletePlan}>
        Plan löschen
      </button>
      {adding && <AddPdeModal day={adding} count={pdes?.filter((p) => p.planDayId === adding.id).length ?? 0} onClose={() => setAdding(null)} />}
    </>
  );
}

function PdeRow({ pde, name, hint, prev, muscle }: { pde: PlanDayExercise; name: string; hint?: string; prev?: PlanDayExercise; muscle?: string }) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState({ sets: pde.sets, repMin: pde.repMin, repMax: pde.repMax });
  return (
    <li className="py-2">
      <div className="flex items-center gap-2">
        <MuscleTile muscle={muscle} exerciseId={pde.exerciseId} />
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setEdit((e) => !e)}>
          {name}
          <span className="block text-xs text-slate-500">
            {pde.sets} × {pde.repMin}–{pde.repMax}
            {hint && ` · ${hint}`}
          </span>
        </button>
        {prev && (
          <button
            type="button"
            aria-label="Nach oben"
            className="px-2 text-slate-500"
            onClick={async () => {
              await patch('planDayExercises', pde.id, { order: prev.order });
              await patch('planDayExercises', prev.id, { order: pde.order === prev.order ? pde.order + 1 : pde.order });
            }}
          >
            <ArrowUp size={16} />
          </button>
        )}
        <button type="button" aria-label="Entfernen" className="px-2 text-slate-500" onClick={() => remove('planDayExercises', pde.id)}>
          <X size={16} />
        </button>
      </div>
      {edit && (
        <div className="mt-2 flex items-end gap-2">
          {(['sets', 'repMin', 'repMax'] as const).map((k) => (
            <label key={k} className="flex-1">
              <span className="label text-xs">{k === 'sets' ? 'Sätze' : k === 'repMin' ? 'Wdh. min' : 'Wdh. max'}</span>
              <input className="input text-center" inputMode="numeric" value={v[k]} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) || 0 })} />
            </label>
          ))}
          <Button
            onClick={async () => {
              await patch('planDayExercises', pde.id, v);
              setEdit(false);
            }}
          >
            OK
          </Button>
        </div>
      )}
    </li>
  );
}

function AddPdeModal({ day, count, onClose }: { day: PlanDay; count: number; onClose: () => void }) {
  const [q, setQ] = useState('');
  const exercises = useLiveQuery(() => all('exercises'), []);
  const t = q.trim().toLowerCase();
  const list = (exercises ?? []).filter((e) => !isCardioExercise(e) && (!t || e.name.toLowerCase().includes(t) || e.muscleGroup?.toLowerCase().includes(t)));
  const add = async (exerciseId: string, endurance: boolean) => {
    await save('planDayExercises', { planDayId: day.id, exerciseId, order: count, sets: endurance ? 1 : 3, repMin: 8, repMax: 12 });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={`Übung zu ${day.name}`}>
      <input className="input mb-3" placeholder="Suchen" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      {(['push', 'pull', 'legs', 'other'] as Split[]).map((s) => {
        const items = list.filter((e) => e.split === s).sort((a, b) => a.name.localeCompare(b.name, 'de'));
        if (!items.length) return null;
        return (
          <section key={s} className="mb-3">
            <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">{SPLIT_LABEL[s]}</h3>
            <ul className="divide-y divide-slate-800">
              {items.map((e) => (
                <li key={e.id}>
                  <button type="button" className="w-full py-2 text-left text-sm" onClick={() => add(e.id, e.type === 'time_distance')}>
                    {e.name} <span className="text-xs text-slate-500">· {e.muscleGroup}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </Modal>
  );
}
