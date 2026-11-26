import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, EmptyState, Modal, PageHeader } from '../../components/ui';
import { alive, all, db, patch, remove } from '../../local/db';
import { lastMachineFor, prescriptionOf } from '../../local/queries';
import { resolveSlotInGym } from '../../local/plans';
import { slotById } from '../../domain/slots';
import { isCardioExercise, type CardioEntry, type Exercise, type GymMachine, type PlanDayExercise, type SetEntry } from '../../model/types';
import { CardioRow, CardioSheet } from '../cardio/CardioSheet';
import { AddMachineModal } from '../gyms/MachineForm';
import { ExerciseCard, PickMachineModal } from './ExerciseCard';

interface Unit {
  key: string;
  exercise: Exercise;
  pde?: PlanDayExercise;
}

const exOfKey = (k: string) => k.split(':')[1];

export function ActiveSessionPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const data = useLiveQuery(async () => {
    const session = await db.sessions.get(id);
    if (!alive(session)) return null;
    const [gym, day, pdes, sets, machines, exercises, cardio] = await Promise.all([
      db.gyms.get(session.gymId),
      session.planDayId ? db.planDays.get(session.planDayId) : undefined,
      session.planDayId ? db.planDayExercises.where('planDayId').equals(session.planDayId).toArray() : [],
      db.sets.where('sessionId').equals(id).toArray(),
      db.gymMachines.where('gymId').equals(session.gymId).toArray(),
      all('exercises'),
      all('cardio'),
    ]);
    return {
      session,
      gym,
      day,
      pdes: pdes.filter(alive).sort((a, b) => a.order - b.order),
      sets: sets.filter(alive).sort((a, b) => a.createdAt - b.createdAt),
      machines: machines.filter(alive),
      exercises: new Map(exercises.map((e) => [e.id, e])),
      cardio: cardio.filter((c) => c.sessionId === id).sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)),
    };
  }, [id]);

  const [picking, setPicking] = useState<Unit | null>(null);
  const [addingMachine, setAddingMachine] = useState<{ unit: Unit } | null>(null);
  const [addingExercise, setAddingExercise] = useState(false);
  const [cardioSheet, setCardioSheet] = useState<{ entry?: CardioEntry } | null>(null);

  const units: Unit[] = useMemo(() => {
    if (!data) return [];
    const { session, pdes, sets, exercises } = data;
    const planUnits = pdes
      .map((p) => ({ key: p.id, exercise: exercises.get((p.slotId && session.exerciseFor?.[p.id]) || p.exerciseId)!, pde: p }))
      .filter((u) => u.exercise);
    const extraKeys = (session.order ?? []).filter((k) => k.startsWith('ex:'));
    const extras = extraKeys.map((k) => ({ key: k, exercise: exercises.get(exOfKey(k))! })).filter((u) => u.exercise);
    // Sätze ohne passende Einheit (z. B. importiert) als eigene Einheiten zeigen
    const covered = new Set([...planUnits, ...extras].map((u) => u.exercise.id));
    const orphans = [...new Set(sets.filter((s) => !covered.has(s.exerciseId)).map((s) => s.exerciseId))]
      .map((ex) => ({ key: `ex:${ex}:imp`, exercise: exercises.get(ex)! }))
      .filter((u) => u.exercise);
    const list = [...planUnits, ...extras, ...orphans];
    const order = session.order ?? [];
    const rank = (k: string) => {
      const i = order.indexOf(k);
      return i === -1 ? 1000 : i;
    };
    return list.map((u, i) => ({ u, i })).sort((a, b) => rank(a.u.key) - rank(b.u.key) || a.i - b.i).map((x) => x.u);
  }, [data]);

  // Plätze aus Vorlagen auflösen (welche Übung in diesem Gym) und Geräte zuordnen
  // (zuletzt in diesem Gym genutztes Gerät der Übung)
  useEffect(() => {
    if (!data) return;
    const ef = data.session.exerciseFor ?? {};
    const mf = data.session.machineFor ?? {};
    const slotMissing = units.filter((u) => u.pde?.slotId && !(u.key in ef));
    const machineMissing = units.filter((u) => !(u.key in mf) && !(u.pde?.slotId && !(u.key in ef)));
    if (!slotMissing.length && !machineMissing.length) return;
    (async () => {
      const nextEf = { ...ef };
      for (const u of slotMissing) {
        const ex = await resolveSlotInGym(u.pde!.slotId!, data.session.gymId);
        if (ex) nextEf[u.key] = ex;
      }
      const nextMf = { ...mf };
      for (const u of machineMissing) {
        const m = await lastMachineFor(data.session.gymId, u.exercise.id);
        if (m) nextMf[u.key] = m;
        else if (u.exercise.freeWeight) nextMf[u.key] = '';
      }
      const changed = Object.keys(nextEf).length !== Object.keys(ef).length || Object.keys(nextMf).length !== Object.keys(mf).length;
      if (changed) await patch('sessions', data.session.id, { exerciseFor: nextEf, machineFor: nextMf });
    })();
  }, [data, units]);

  if (data === undefined) return null;
  if (data === null)
    return (
      <>
        <PageHeader title="Training" back={() => nav('/')} />
        <EmptyState title="Training nicht gefunden." />
      </>
    );

  const { session, gym, day, sets, machines } = data;
  const mf = session.machineFor ?? {};
  const machineOf = (u: Unit) => machines.find((m) => m.id === mf[u.key]);
  const setsOf = (u: Unit): SetEntry[] => {
    const sameEx = units.filter((x) => x.exercise.id === u.exercise.id);
    const mine = sets.filter((s) => s.exerciseId === u.exercise.id);
    if (sameEx.length <= 1) return mine;
    return mine.filter((s) => (s.machineId ?? '') === (mf[u.key] ?? ''));
  };

  const setOrder = (keys: string[]) => patch('sessions', session.id, { order: keys });
  const move = (u: Unit, dir: 'up' | 'down') => {
    const keys = units.map((x) => x.key);
    const i = keys.indexOf(u.key);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= keys.length) return;
    [keys[i], keys[j]] = [keys[j], keys[i]];
    setOrder(keys);
  };
  const swapExercise = async (u: Unit, exerciseId: string) => {
    const nextMf = { ...mf };
    delete nextMf[u.key];
    await patch('sessions', session.id, { exerciseFor: { ...(session.exerciseFor ?? {}), [u.key]: exerciseId }, machineFor: nextMf });
  };
  const pickMachine = async (u: Unit, machineId: string | undefined) => {
    await patch('sessions', session.id, { machineFor: { ...mf, [u.key]: machineId ?? '' } });
    setPicking(null);
  };
  const addExercise = async (exerciseId: string, machineId?: string) => {
    const key = `ex:${exerciseId}:${Math.random().toString(36).slice(2, 7)}`;
    await patch('sessions', session.id, {
      order: [...units.map((u) => u.key), key],
      machineFor: { ...mf, [key]: machineId ?? '' },
    });
    setAddingExercise(false);
  };
  const finish = async () => {
    await patch('sessions', session.id, { finishedAt: Date.now() });
    nav(`/session/${session.id}/summary`, { replace: true });
  };
  const discard = async () => {
    if (!confirm('Training verwerfen? Alle Sätze dieses Trainings werden gelöscht.')) return;
    for (const s of sets) await remove('sets', s.id);
    for (const c of data.cardio) await remove('cardio', c.id);
    await remove('sessions', session.id);
    nav('/', { replace: true });
  };

  const work = sets.filter((s) => !s.isWarmup);
  const doneSets = work.length;
  const plannedSets = Math.max(
    doneSets,
    units.reduce((n, u) => n + Math.max(prescriptionOf(u.pde).sets, setsOf(u).filter((s) => !s.isWarmup).length), 0),
  );
  const volume = Math.round(work.filter((s) => !s.excluded).reduce((a, s) => a + (s.weightKg ?? 0) * (s.reps ?? 0), 0));

  const machinesFor = (u?: Unit): GymMachine[] => (u ? machines.filter((m) => m.exerciseId === u.exercise.id) : []);

  return (
    <>
      <PageHeader
        title={day?.name ?? 'Freies Training'}
        back={() => nav('/')}
        right={
          <Button className="px-3" onClick={finish}>
            {session.finishedAt ? 'Fertig' : 'Beenden'}
          </Button>
        }
      />
      <ProgressBar gymName={gym?.name ?? ''} done={doneSets} planned={plannedSets} volume={volume} />

      <div className="space-y-3">
        {units.map((u) => (
          <ExerciseCard
            key={u.key}
            sessionId={session.id}
            gymId={session.gymId}
            exercise={u.exercise}
            machine={machineOf(u)}
            alternatives={machinesFor(u)}
            prescription={prescriptionOf(u.pde)}
            sets={setsOf(u)}
            onPickMachine={() => setPicking(u)}
            onMove={(d) => move(u, d)}
            onRemove={u.pde ? undefined : () => setOrder(units.filter((x) => x.key !== u.key).map((x) => x.key))}
            slot={
              u.pde?.slotId && setsOf(u).length === 0
                ? {
                    label: slotById(u.pde.slotId)?.label ?? '',
                    options: (slotById(u.pde.slotId)?.alternatives ?? [])
                      .map((id) => data.exercises.get(id))
                      .filter((e): e is Exercise => !!e)
                      .map((e) => ({ exercise: e, inGym: machines.some((m) => m.exerciseId === e.id) || !!e.freeWeight })),
                    onSwap: (id: string) => swapExercise(u, id),
                  }
                : undefined
            }
          />
        ))}
      </div>

      {data.cardio.length > 0 && (
        <div className="mt-3 space-y-2">
          {data.cardio.map((c) => (
            <CardioRow key={c.id} entry={c} onClick={() => setCardioSheet({ entry: c })} />
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => setAddingExercise(true)}>
          + Übung
        </Button>
        <Button variant="secondary" onClick={() => setCardioSheet({})}>
          + Cardio
        </Button>
      </div>
      <CardioSheet
        open={!!cardioSheet}
        onClose={() => setCardioSheet(null)}
        entry={cardioSheet?.entry}
        sessionId={session.id}
        gymId={session.gymId}
      />
      <button type="button" className="mt-6 w-full py-2 text-sm text-slate-500" onClick={discard}>
        Training verwerfen
      </button>

      <PickMachineModal
        open={!!picking}
        onClose={() => setPicking(null)}
        exercise={picking?.exercise}
        machines={machinesFor(picking ?? undefined)}
        onPick={(mid) => picking && pickMachine(picking, mid)}
        onAddNew={() => {
          setAddingMachine({ unit: picking! });
          setPicking(null);
        }}
      />
      {addingMachine && (
        <AddMachineModal
          gymId={session.gymId}
          open
          exerciseId={addingMachine.unit.exercise.id}
          onClose={() => setAddingMachine(null)}
          onCreated={(m) => pickMachine(addingMachine.unit, m.id)}
        />
      )}
      <AddExerciseModal open={addingExercise} onClose={() => setAddingExercise(false)} machines={machines} exercises={data.exercises} onAdd={addExercise} />
    </>
  );
}

/** Fortschritt im Training: Gym, Sätze als Ring, bisheriges Volumen – bewusst ohne Uhr. */
function ProgressBar({ gymName, done, planned, volume }: { gymName: string; done: number; planned: number; volume: number }) {
  const pct = planned ? Math.min(1, done / planned) : 0;
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-3 bg-black/90 px-4 py-2 backdrop-blur">
      <span className="chip max-w-[45%] truncate bg-slate-800 px-3 py-1.5 text-sm text-slate-200">📍 {gymName}</span>
      <span className="flex-1 text-right text-sm text-slate-400">
        <span className="font-bold tabular-nums text-white">{volume.toLocaleString('de-DE')}</span> kg
      </span>
      <span className="flex items-center gap-2">
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden>
          <circle cx="18" cy="18" r={r} fill="none" stroke="#3a3a3c" strokeWidth="4" />
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke={pct >= 1 ? '#34d399' : '#fff'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${pct * c} ${c}`}
            transform="rotate(-90 18 18)"
          />
        </svg>
        <span className="text-sm">
          <span className="font-bold tabular-nums">
            {done}/{planned}
          </span>{' '}
          <span className="text-slate-400">Sätze</span>
        </span>
      </span>
    </div>
  );
}

function AddExerciseModal({
  open,
  onClose,
  machines,
  exercises,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  machines: GymMachine[];
  exercises: Map<string, Exercise>;
  onAdd: (exerciseId: string, machineId?: string) => void;
}) {
  const [q, setQ] = useState('');
  const t = q.trim().toLowerCase();
  const ms = machines
    .filter((m) => !isCardioExercise(exercises.get(m.exerciseId) ?? {}))
    .filter((m) => !t || m.label.toLowerCase().includes(t) || exercises.get(m.exerciseId)?.name.toLowerCase().includes(t))
    .sort((a, b) => a.label.localeCompare(b.label, 'de'));
  const free = [...exercises.values()].filter((e) => e.freeWeight && (!t || e.name.toLowerCase().includes(t)));
  return (
    <Modal open={open} onClose={onClose} title="Übung hinzufügen">
      <input className="input mb-3" placeholder="Suchen" value={q} onChange={(e) => setQ(e.target.value)} />
      <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">Geräte in diesem Gym</h3>
      <ul className="mb-3 divide-y divide-slate-800">
        {ms.map((m) => (
          <li key={m.id}>
            <button type="button" className="w-full py-2 text-left text-sm" onClick={() => onAdd(m.exerciseId, m.id)}>
              {m.label} <span className="text-xs text-slate-500">· {exercises.get(m.exerciseId)?.name}</span>
            </button>
          </li>
        ))}
        {!ms.length && <li className="py-2 text-sm text-slate-500">Keine passenden Geräte – im Gym-Tab anlegen.</li>}
      </ul>
      <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">Freihantel & Körpergewicht</h3>
      <ul className="divide-y divide-slate-800">
        {free.map((e) => (
          <li key={e.id}>
            <button type="button" className="w-full py-2 text-left text-sm" onClick={() => onAdd(e.id)}>
              {e.name}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
