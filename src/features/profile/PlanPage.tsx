import { useEffect, useState } from 'react';
import { compareExercises } from '../../domain/exerciseOrder';
import { splitSide } from '../../domain/exerciseDefaults';
import { ArrowDown, ArrowDownUp, ArrowUp, Check, Eye, EyeOff, MoreHorizontal, Pencil, Plus, Share2, X } from 'lucide-react';
import { MuscleTile } from '../../components/MuscleIcon';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { myGyms } from '../../local/queries';
import { ExerciseName } from '../../components/ExerciseName';
import { Button, Card, IconButton, Modal, PageHeader } from '../../components/ui';
import { encodePlan } from '../../domain/planShare';
import { activePlan, exportPlan, setActivePlan } from '../../local/plans';
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
  const isActive = useLiveQuery(async () => (await activePlan())?.id === id, [id]);
  /** Dialoge: neuer Tag, Tag bearbeiten, Plan umbenennen */
  const [dayDialog, setDayDialog] = useState<{ day?: PlanDay } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [params, setParams] = useSearchParams();
  const gymId = params.get('gym') ?? '';
  const gyms = useLiveQuery(myGyms, []);
  const gymMachines = useLiveQuery(async () => (gymId ? (await db.gymMachines.where('gymId').equals(gymId).toArray()).filter(alive) : []), [gymId]);
  const gymName = new Map(gyms?.map((g) => [g.id, g.name]));
  const setGym = (g: string) => {
    const next = new URLSearchParams(params);
    if (g) next.set('gym', g);
    else next.delete('gym');
    next.delete('day');
    setParams(next, { replace: true });
  };
  // aus dem Training kommend: zum Tag scrollen
  const focusDay = params.get('day');
  useEffect(() => {
    if (focusDay && days?.length) document.getElementById(`day-${focusDay}`)?.scrollIntoView({ block: 'start' });
  }, [focusDay, days?.length]);

  if (!alive(plan)) return null;

  const addDay = () => setDayDialog({});
  /** Tag nach Muskelgruppe und Bewegungsmuster ordnen (große Muskeln und Grundübungen zuerst) */
  const sortDay = async (list: PlanDayExercise[]) => {
    const ex = (p: PlanDayExercise) => exercises?.get(p.exerciseId) ?? { id: p.exerciseId, name: '' };
    const sorted = [...list].sort((a, b) => compareExercises(ex(a), ex(b)) || a.order - b.order);
    for (const [k, p] of sorted.entries()) if (p.order !== k) await patch('planDayExercises', p.id, { order: k });
  };
  const moveDay = async (d: PlanDay, dir: -1 | 1) => {
    const list = days ?? [];
    const i = list.findIndex((x) => x.id === d.id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const reordered = [...list];
    [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
    for (const [k, x] of reordered.entries()) if (x.order !== k) await patch('planDays', x.id, { order: k });
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
    nav('/plan');
  };

  return (
    <>
      <PageHeader
        title={plan.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {isActive ? (
              <span className="font-semibold text-emerald-400">Aktiver Plan</span>
            ) : (
              <button type="button" className="chip bg-white px-3 py-1 text-sm text-black" onClick={() => setActivePlan(id)}>
                <Check size={14} /> Als aktiven Plan nutzen
              </button>
            )}
            <button type="button" className="flex items-center gap-1 text-slate-400" onClick={() => setRenaming(true)}>
              <Pencil size={13} /> Name ändern
            </button>
          </span>
        }
        back={() => nav('/plan')}
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
      {gyms && gyms.length > 1 && (
        <div className="mb-3">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {[{ id: '', name: 'Alle Gyms' }, ...gyms].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGym(g.id)}
                className={`chip shrink-0 px-3 py-1.5 text-sm ${gymId === g.id ? 'bg-white text-black' : 'bg-slate-800 text-slate-300'}`}
              >
                {g.name}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {gymId
              ? `So sieht dein Plan in ${gymName.get(gymId) ?? 'diesem Gym'} aus. Mit dem Auge blendest du Übungen nur hier aus.`
              : 'Wähle ein Gym, um Übungen nur dort auszublenden.'}
          </p>
        </div>
      )}
      <div className="space-y-4">
        {days?.map((d) => {
          const list = pdes?.filter((p) => p.planDayId === d.id) ?? [];
          // Links/Rechts derselben Übung als eine Zeile
          const partnerOf = new Map<string, { other: PlanDayExercise; second: boolean }>();
          for (const p of list) {
            if (partnerOf.has(p.id) || p.slotId) continue;
            const a = splitSide(exercises?.get(p.exerciseId)?.name ?? '');
            if (!a.side) continue;
            const q = list.find((x) => {
              const b = splitSide(exercises?.get(x.exerciseId)?.name ?? '');
              return x.id !== p.id && !partnerOf.has(x.id) && b.side && b.side !== a.side && b.base.toLowerCase() === a.base.toLowerCase();
            });
            if (q) {
              partnerOf.set(p.id, { other: q, second: false });
              partnerOf.set(q.id, { other: p, second: true });
            }
          }
          const missing = gymId
            ? list.filter(
                (p) =>
                  !p.skipGyms?.includes(gymId) &&
                  !p.slotId &&
                  !exercises?.get(p.exerciseId)?.freeWeight &&
                  !gymMachines?.some((m) => m.exerciseId === p.exerciseId),
              )
            : [];
          return (
            <Card key={d.id} id={`day-${d.id}`} className="scroll-mt-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-bold">{d.name}</h2>
                <span className="flex">
                  {list.length > 1 && (
                    <IconButton label={`${d.name} nach Muskel und Bewegung sortieren`} className="h-9 w-9 bg-transparent" onClick={() => sortDay(list)}>
                      <ArrowDownUp size={17} />
                    </IconButton>
                  )}
                  <IconButton label={`Tag ${d.name} bearbeiten`} className="h-9 w-9 bg-transparent" onClick={() => setDayDialog({ day: d })}>
                    <MoreHorizontal size={18} />
                  </IconButton>
                </span>
              </div>
              {missing.length > 0 && (
                <button
                  type="button"
                  className="mb-2 w-full rounded-xl bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-200"
                  onClick={async () => {
                    for (const p of missing) await patch('planDayExercises', p.id, { skipGyms: [...(p.skipGyms ?? []), gymId] });
                  }}
                >
                  {missing.length} Übung{missing.length === 1 ? '' : 'en'} ohne Gerät in {gymName.get(gymId)} –{' '}
                  <span className="font-semibold underline underline-offset-2">alle hier ausblenden</span>
                </button>
              )}
              <ul className="divide-y divide-slate-800">
                {list.map((p, i) => {
                  if (partnerOf.has(p.id) && partnerOf.get(p.id)!.second) return null;
                  const partner = partnerOf.get(p.id)?.other;
                  const nm = slotById(p.slotId)?.label ?? exercises?.get(p.exerciseId)?.name ?? '?';
                  return (
                  <PdeRow
                    key={p.id}
                    pde={p}
                    partner={partner}
                    name={partner ? `${splitSide(nm).base} (links + rechts)` : nm}
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
                    gym={gymId ? { id: gymId, name: gymName.get(gymId) ?? 'diesem Gym' } : undefined}
                    noMachine={
                      !!gymId && !p.slotId && !exercises?.get(p.exerciseId)?.freeWeight && !gymMachines?.some((m) => m.exerciseId === p.exerciseId)
                    }
                    skippedIn={(p.skipGyms ?? []).map((g) => gymName.get(g)).filter((n): n is string => !!n)}
                  />
                  );
                })}
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
      {dayDialog && (
        <DayDialog
          day={dayDialog.day}
          index={dayDialog.day ? (days?.findIndex((x) => x.id === dayDialog.day!.id) ?? 0) : -1}
          count={days?.length ?? 0}
          onClose={() => setDayDialog(null)}
          onSave={async (name) => {
            if (dayDialog.day) await patch('planDays', dayDialog.day.id, { name });
            else {
              const d = await save('planDays', { planId: id, name, order: days?.length ?? 0 });
              setAdding(d);
            }
            setDayDialog(null);
          }}
          onMove={(dir) => dayDialog.day && moveDay(dayDialog.day, dir)}
          onDelete={async () => {
            if (!dayDialog.day || !confirm(`Tag „${dayDialog.day.name}“ löschen? Bisherige Trainings bleiben erhalten.`)) return;
            await remove('planDays', dayDialog.day.id);
            setDayDialog(null);
          }}
        />
      )}
      {renaming && (
        <NameDialog
          title="Plan umbenennen"
          initial={plan.name}
          onClose={() => setRenaming(false)}
          onSave={async (name) => {
            await patch('plans', id, { name });
            setRenaming(false);
          }}
        />
      )}
      {adding && <AddPdeModal day={adding} count={pdes?.filter((p) => p.planDayId === adding.id).length ?? 0} onClose={() => setAdding(null)} />}
    </>
  );
}

function PdeRow({
  pde,
  partner,
  name,
  hint,
  prev,
  muscle,
  gym,
  noMachine,
  skippedIn,
}: {
  pde: PlanDayExercise;
  /** Gegenstück (links/rechts) – Änderungen gelten für beide */
  partner?: PlanDayExercise;
  name: string;
  hint?: string;
  prev?: PlanDayExercise;
  muscle?: string;
  /** gewähltes Gym (Filter) */
  gym?: { id: string; name: string };
  noMachine?: boolean;
  skippedIn: string[];
}) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState({ sets: pde.sets, repMin: pde.repMin, repMax: pde.repMax });
  const off = !!gym && !!pde.skipGyms?.includes(gym.id);
  const both = partner ? [pde, partner] : [pde];
  const toggleGym = () =>
    gym &&
    both.forEach((x) =>
      patch('planDayExercises', x.id, {
        skipGyms: off ? (x.skipGyms ?? []).filter((g) => g !== gym.id) : [...(x.skipGyms ?? []).filter((g) => g !== gym.id), gym.id],
      }),
    );
  return (
    <li className="py-2">
      <div className="flex items-center gap-2">
        <MuscleTile muscle={muscle} exerciseId={pde.exerciseId} className={off ? 'opacity-40' : ''} />
        <button type="button" className={`min-w-0 flex-1 text-left ${off ? 'opacity-50' : ''}`} onClick={() => setEdit((e) => !e)}>
          <ExerciseName name={name} className={off ? 'line-through' : ''} />
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
            <span className="chip gap-1 bg-slate-800 px-2 py-0.5 tabular-nums text-slate-300">
              {pde.sets} × {pde.repMin}–{pde.repMax} <Pencil size={11} />
            </span>
            {hint && <span className="truncate">{hint}</span>}
          </span>
          {off ? (
            <span className="block text-xs text-slate-400">in {gym!.name} ausgeblendet</span>
          ) : noMachine ? (
            <span className="block text-xs text-amber-300">kein Gerät in {gym!.name} erfasst</span>
          ) : (
            !gym && skippedIn.length > 0 && <span className="block text-xs text-slate-500">nicht in: {skippedIn.join(', ')}</span>
          )}
        </button>
        {gym && (
          <button
            type="button"
            aria-label={off ? `In ${gym.name} wieder zeigen` : `In ${gym.name} ausblenden`}
            className={`px-2 ${off ? 'text-slate-500' : 'text-white'}`}
            onClick={toggleGym}
          >
            {off ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
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
        <button type="button" aria-label="Entfernen" className="px-2 text-slate-500" onClick={() => both.forEach((x) => remove('planDayExercises', x.id))}>
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
              for (const x of both) await patch('planDayExercises', x.id, v);
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
        const items = list.filter((e) => e.split === s).sort(compareExercises);
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

const DAY_NAMES = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Ganzkörper'];

/** Trainingstag anlegen oder bearbeiten (Name, Reihenfolge, löschen) */
function DayDialog({
  day,
  index,
  count,
  onClose,
  onSave,
  onMove,
  onDelete,
}: {
  day?: PlanDay;
  index: number;
  count: number;
  onClose: () => void;
  onSave: (name: string) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(day?.name ?? '');
  return (
    <Modal open onClose={onClose} title={day ? 'Trainingstag' : 'Neuer Trainingstag'}>
      <label className="block">
        <span className="label">Name</span>
        <input className="input" value={name} autoFocus={!day} placeholder="z. B. Push" onChange={(e) => setName(e.target.value)} />
      </label>
      {!day && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DAY_NAMES.map((n) => (
            <button key={n} type="button" className={`chip px-3 py-1 text-sm ${name === n ? 'bg-white text-black' : 'bg-slate-800 text-slate-300'}`} onClick={() => setName(n)}>
              {n}
            </button>
          ))}
        </div>
      )}
      <Button className="mt-4 w-full" disabled={!name.trim()} onClick={() => onSave(name.trim())}>
        {day ? 'Speichern' : 'Anlegen und Übungen wählen'}
      </Button>
      {day && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" disabled={index <= 0} onClick={() => onMove(-1)}>
              <ArrowUp size={16} /> Nach oben
            </Button>
            <Button variant="secondary" disabled={index >= count - 1} onClick={() => onMove(1)}>
              <ArrowDown size={16} /> Nach unten
            </Button>
          </div>
          <Button variant="ghost" className="w-full text-red-400" onClick={onDelete}>
            Tag löschen
          </Button>
        </div>
      )}
    </Modal>
  );
}

function NameDialog({ title, initial, onClose, onSave }: { title: string; initial: string; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(initial);
  return (
    <Modal open onClose={onClose} title={title}>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      <Button className="mt-4 w-full" disabled={!name.trim()} onClick={() => onSave(name.trim())}>
        Speichern
      </Button>
    </Modal>
  );
}
