import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, Modal } from '../../components/ui';
import { all, db } from '../../local/db';
import { targetFor } from '../../local/queries';
import { LEVEL_LABEL } from '../../domain/history';
import { e1rm } from '../../domain/metrics';
import type { Prescription, WorkSet } from '../../domain/progression';
import { fmtDate } from '../../domain/units';
import type { Exercise, GymMachine, SetEntry } from '../../model/types';
import { fmtSet } from './format';
import { SetTable } from './SetTable';

const REASON_STYLE = {
  first: 'bg-sky-500/15 text-sky-300',
  increase: 'bg-emerald-500/15 text-emerald-300',
  repeat: 'bg-slate-700 text-slate-200',
  deload: 'bg-amber-500/15 text-amber-300',
} as const;
const REASON_LABEL = { first: 'Start', increase: 'Steigern', repeat: 'Halten', deload: 'Deload' } as const;

interface Props {
  sessionId: string;
  gymId: string;
  exercise: Exercise;
  machine?: GymMachine;
  alternatives: GymMachine[];
  prescription: Prescription;
  sets: SetEntry[];
  onPickMachine: () => void;
  onMove?: (dir: 'up' | 'down') => void;
  onRemove?: () => void;
}

const scoreOf = (type: Exercise['type'], s: WorkSet) =>
  type === 'time_distance' ? (s.distanceM ?? 0) || (s.durationSec ?? 0) : type === 'bodyweight' && !s.weightKg ? (s.reps ?? 0) : e1rm(s.weightKg ?? 0, s.reps ?? 0);

export function ExerciseCard({ sessionId, exercise, machine, alternatives, prescription, sets, onPickMachine, onMove, onRemove }: Props) {
  const nav = useNavigate();
  const needsMachine = !machine && !exercise.freeWeight && alternatives.length > 0;
  const info = useLiveQuery(
    () => targetFor({ exercise, machine, prescription, excludeSessionId: sessionId }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercise.id, machine?.id, machine?.weightStepKg, JSON.stringify(prescription), sessionId],
  );
  const note = useLiveQuery(async () => (machine ? (await all('machineNotes')).find((n) => n.machineId === machine.id)?.note : undefined), [machine?.id]);
  const modelLine = useLiveQuery(async () => {
    const m = machine?.modelId ? await db.equipmentModels.get(machine.modelId) : undefined;
    const mf = m ? await db.manufacturers.get(m.manufacturerId) : undefined;
    return m ? [mf?.name, m.line, m.name].filter(Boolean).join(' ') : undefined;
  }, [machine?.modelId]);
  const [menu, setMenu] = useState(false);

  const target = info?.target;
  const used = info?.used;
  const previous = used?.sessions.at(-1)?.sets ?? [];
  const bestBefore = Math.max(0, ...(used?.sessions.flatMap((s) => s.sets.map((x) => scoreOf(exercise.type, x))) ?? []));
  const workSets = sets.filter((s) => !s.isWarmup);
  const done = !!target && workSets.length >= target.sets.length;
  const levelText = used
    ? used.level === 'model'
      ? `${LEVEL_LABEL.model} · anderes Gym`
      : used.level === 'free'
        ? LEVEL_LABEL.free
        : `${LEVEL_LABEL.machine} · ${fmtDate(used.sessions.at(-1)!.date)}`
    : info?.levels.exercise.sessions.length
      ? 'Neues Gerät – Startgewicht wählen'
      : 'Erstes Mal';
  const orientation = !used ? info?.levels.exercise.sessions.at(-1) : undefined;

  return (
    <section className="rounded-card bg-slate-900 p-4">
      <div className="flex items-start gap-2">
        <h3 className="flex-1 pt-1 text-xl font-bold leading-tight">
          {done && <span className="text-emerald-400">✓ </span>}
          {exercise.name}
        </h3>
        <IconButton label="Fortschritt" onClick={() => nav(`/progress?ex=${exercise.id}`)}>
          📈
        </IconButton>
        <IconButton label="Optionen" onClick={() => setMenu(true)}>
          ⋯
        </IconButton>
      </div>

      {/* Geräte-Kachel */}
      <button type="button" onClick={onPickMachine} className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-black px-3 py-2.5 text-left active:bg-slate-950">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg" aria-hidden>
          {machine ? '⚙️' : exercise.freeWeight ? '🏋️' : '❔'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">
            {machine ? machine.label : exercise.freeWeight ? 'Freihantel' : needsMachine ? 'Gerät wählen' : 'Kein Gerät'}
          </span>
          <span className="block truncate text-xs text-slate-500">
            {machine ? (modelLine ?? 'ohne Herstellermodell') : exercise.freeWeight ? 'Historie über alle Gyms' : 'Tippen, um ein Gerät zuzuordnen'}
          </span>
          {note && <span className="block truncate text-xs italic text-slate-400">📝 {note}</span>}
        </span>
        <span className="text-slate-500">›</span>
      </button>

      {target && (
        <div className="mt-3 text-xs text-slate-500">
          <span className={`chip mr-1.5 ${REASON_STYLE[target.reason]}`}>{REASON_LABEL[target.reason]}</span>
          <span className="text-slate-300">Ziel {target.sets.map((s) => fmtSet(exercise.type, s)).join(' · ')}</span>
          <p className="mt-1">
            {levelText} · {target.message}
          </p>
          {orientation && (
            <p className="mt-1">
              Orientierung (anderes Gerät, {fmtDate(orientation.date)}): {orientation.sets.map((s) => fmtSet(exercise.type, s)).join(', ')}
            </p>
          )}
        </div>
      )}

      {target && (
        <div className="mt-3">
          <SetTable
            sessionId={sessionId}
            exercise={exercise}
            machine={machine}
            sets={sets}
            target={target.sets}
            previous={previous}
            bestBefore={bestBefore}
            disabled={needsMachine}
          />
        </div>
      )}

      <Modal open={menu} onClose={() => setMenu(false)} title={exercise.name}>
        <div className="space-y-2">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setMenu(false);
              onPickMachine();
            }}
          >
            Gerät wechseln
          </Button>
          {onMove && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => onMove('up')}>
                ↑ Nach oben
              </Button>
              <Button variant="secondary" onClick={() => onMove('down')}>
                ↓ Nach unten
              </Button>
            </div>
          )}
          {onRemove && sets.length === 0 && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setMenu(false);
                onRemove();
              }}
            >
              Aus diesem Training entfernen
            </Button>
          )}
        </div>
      </Modal>
    </section>
  );
}

/** Gerät für eine Übung im Gym auswählen (oder neu anlegen) */
export function PickMachineModal({
  open,
  onClose,
  exercise,
  machines,
  onPick,
  onAddNew,
}: {
  open: boolean;
  onClose: () => void;
  exercise?: Exercise;
  machines: GymMachine[];
  onPick: (id: string | undefined) => void;
  onAddNew: () => void;
}) {
  const ids = machines.map((m) => m.id).join();
  const lastUse = useLiveQuery(async () => {
    const m = new Map<string, number>();
    for (const s of await db.sets.where('exerciseId').equals(exercise?.id ?? '').toArray())
      if (s.machineId) m.set(s.machineId, Math.max(m.get(s.machineId) ?? 0, s.createdAt));
    return m;
  }, [exercise?.id, ids]);
  if (!exercise) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Gerät für ${exercise.name}`}>
      <ul className="divide-y divide-slate-800">
        {machines.map((m) => (
          <li key={m.id}>
            <button type="button" className="w-full py-2.5 text-left" onClick={() => onPick(m.id)}>
              {m.label}
              {lastUse?.get(m.id) && <span className="block text-xs text-slate-500">zuletzt {fmtDate(lastUse.get(m.id)!)}</span>}
            </button>
          </li>
        ))}
        {exercise.freeWeight && (
          <li>
            <button type="button" className="w-full py-2.5 text-left" onClick={() => onPick(undefined)}>
              Freihantel (ohne Gerät)
            </button>
          </li>
        )}
      </ul>
      <Button variant="secondary" className="mt-3 w-full" onClick={onAddNew}>
        + Neues Gerät in diesem Gym
      </Button>
    </Modal>
  );
}
