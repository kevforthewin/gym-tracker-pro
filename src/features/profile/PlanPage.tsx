import { useState } from 'react';
import { ArrowUp, Check, Plus, Share2, X } from 'lucide-react';
import { MuscleTile } from '../../components/MuscleIcon';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, IconButton, Modal, PageHeader } from '../../components/ui';
import { encodePlan } from '../../domain/planShare';
import { exportPlan } from '../../local/plans';
import { alive, all, db, patch, remove, save } from '../../local/db';
import { SPLIT_LABEL } from '../../domain/dashboard';
import { repsFor, slotById, SLOTS } from '../../domain/slots';
import { PlanVolumeCard } from './PlanVolumeCard';
import { DeloadCard } from './DeloadCard';
import { isCardioExercise, type PlanDay, type PlanDayExercise, type Split } from '../../model/types';

export function PlanPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const plan = useLiveQuery(() => db.plans.get(id), [id]);
  const days = useLiveQuery(async () => (await db.planDays.where('planId').equals(id).toArray()).filter(alive).sort((a, b) => a.order - b.order), [id]);
  const pdes = useLiveQuery(async () => (await all('planDayExercises')).sort((a, b) => a.order - b.order), []);
  const exercises = useLiveQuery(async () => new Map((await all('exercises')).map((e) => [e.id, e])), []);
  const [adding, setAdding] = useState<PlanDay | null>(null);
  const [shareMsg, setShareMsg] = useState('');

  if (!alive(plan)) return null;

  const addDay = async () => {
    const name = prompt('Name des Trainingstags', 'Push');
    if (name) await save('planDays', { planId: id, name, order: days?.length ?? 0 });
  };
  const share = async () => {
    const url = `${location.origin}${location.pathname}#/plan-import?d=${encodePlan(await exportPlan(id))}`;
    try {
      if (navigator.share) await navigator.share({ title: `Trainingsplan: ${plan.name}`, url });
      else {
        await navigator.clipboard.writeText(url);
        setShareMsg('Link kopiert – schick ihn an wen du willst.');
      }
    } catch {
      /* Teilen abgebrochen */
    }
  };
  const deletePlan = async () => {
    if (!confirm(`Plan „${plan.name}“ löschen? Bisherige Trainings bleiben erhalten.`)) return;
    await remove('plans', id);
    nav('/profile');
  };

  return (
    <>
      <PageHeader
        title={plan.name}
        back={() => nav('/profile')}
        right={
          <>
            <IconButton label="Plan teilen" onClick={share}>
              <Share2 size={18} />
            </IconButton>
            <Button onClick={addDay}>+ Tag</Button>
          </>
        }
      />
      {shareMsg && <p className="-mt-3 mb-3 text-sm text-emerald-400">{shareMsg}</p>}
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
      {days && pdes && exercises && (
        <div className="mt-4">
          <PlanVolumeCard days={days} pdes={pdes} exercises={exercises} />
        </div>
      )}
      <div className="mt-4">
        <DeloadCard plan={plan} />
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
  const [added, setAdded] = useState<string[]>([]);
  const exercises = useLiveQuery(() => all('exercises'), []);
  const t = q.trim().toLowerCase();
  const list = (exercises ?? []).filter((e) => !isCardioExercise(e) && (!t || e.name.toLowerCase().includes(t) || e.muscleGroup?.toLowerCase().includes(t)));
  const slots = SLOTS.filter((sl) => !t || sl.label.toLowerCase().includes(t));
  // Bereich des Tages zuerst (z. B. „Push A“ → Push-Übungen oben)
  const dayName = day.name.toLowerCase();
  const first: Split | undefined = /push|brust|schulter/.test(dayName) ? 'push' : /pull|rücken|ruecken/.test(dayName) ? 'pull' : /leg|bein|lower/.test(dayName) ? 'legs' : undefined;
  const order: Split[] = first ? [first, ...(['push', 'pull', 'legs', 'other'] as Split[]).filter((x) => x !== first)] : ['push', 'pull', 'legs', 'other'];

  const addExercise = async (exerciseId: string, endurance: boolean, label: string) => {
    await save('planDayExercises', { planDayId: day.id, exerciseId, order: count + added.length, sets: endurance ? 1 : 3, repMin: 8, repMax: 12 });
    setAdded((a) => [...a, label]);
  };
  const addSlot = async (slotId: string) => {
    const sl = slotById(slotId)!;
    await save('planDayExercises', { planDayId: day.id, exerciseId: sl.alternatives[0], slotId, order: count + added.length, ...repsFor(sl) });
    setAdded((a) => [...a, sl.label]);
  };
  const isAdded = (label: string) => added.includes(label);

  return (
    <Modal open onClose={onClose} title={`Übungen zu ${day.name}`}>
      <p className="mb-2 text-xs text-slate-500">Antippen fügt sofort hinzu – wähle beliebig viele nacheinander.</p>
      <input className="input mb-3" placeholder="Suchen" value={q} onChange={(e) => setQ(e.target.value)} />
      {slots.length > 0 && (
        <section className="mb-4">
          <h3 className="label">Bewegungen (passen sich dem Gym an)</h3>
          <div className="flex flex-wrap gap-1.5">
            {slots.map((sl) => (
              <button
                key={sl.id}
                type="button"
                onClick={() => addSlot(sl.id)}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${isAdded(sl.label) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-200'}`}
              >
                {isAdded(sl.label) ? <Check size={14} /> : <Plus size={14} />}
                {sl.label}
              </button>
            ))}
          </div>
        </section>
      )}
      {order.map((s) => {
        const items = list.filter((e) => e.split === s).sort((a, b) => a.name.localeCompare(b.name, 'de'));
        if (!items.length) return null;
        return (
          <section key={s} className="mb-3">
            <h3 className="label">{s === 'other' ? 'Rumpf & Sonstiges' : SPLIT_LABEL[s]}</h3>
            <ul className="divide-y divide-slate-800">
              {items.map((e) => (
                <li key={e.id}>
                  <button type="button" className="flex w-full items-center gap-3 py-2 text-left text-sm" onClick={() => addExercise(e.id, e.type === 'time_distance', e.name)}>
                    <MuscleTile muscle={e.muscleGroup} exerciseId={e.id} />
                    <span className="min-w-0 flex-1">
                      {e.name}
                      <span className="block text-xs text-slate-500">{e.muscleGroup}</span>
                    </span>
                    {isAdded(e.name) && <Check size={18} className="text-emerald-400" />}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {added.length > 0 && (
        <div className="sticky bottom-0 -mx-5 mt-3 flex items-center gap-3 border-t border-slate-800 bg-slate-900 px-5 pb-1 pt-3">
          <span className="min-w-0 flex-1 text-sm">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <Check size={16} /> {added.length} hinzugefügt
            </span>
            <span className="block truncate text-xs text-slate-500">Zuletzt: {added[added.length - 1]}</span>
          </span>
          <Button onClick={onClose}>Fertig</Button>
        </div>
      )}
    </Modal>
  );
}
