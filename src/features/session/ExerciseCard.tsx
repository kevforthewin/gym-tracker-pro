import { useState } from 'react';
import { loadStep } from '../../domain/loadStep';
import { ExerciseName, shortLine } from '../../components/ExerciseName';
import { applyDeload } from '../../domain/deload';
import { ArrowDown, ArrowRight, ArrowUp, Check, ChevronDown, Info, LineChart, MoreHorizontal, Sparkles, StickyNote, TrendingDown, TrendingUp, X } from 'lucide-react';
import { MuscleTile } from '../../components/MuscleIcon';
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

const HINT_STYLE = {
  first: 'bg-sky-500/15 text-sky-300',
  increase: 'bg-emerald-500/15 text-emerald-300',
  repeat: 'bg-slate-800 text-slate-200',
  deload: 'bg-amber-500/15 text-amber-300',
} as const;

interface Props {
  sessionId: string;
  gymId: string;
  exercise: Exercise;
  machine?: GymMachine;
  alternatives: GymMachine[];
  prescription: Prescription;
  /** Deload-Woche: Ziel leichter */
  deload?: boolean;
  sets: SetEntry[];
  onPickMachine: () => void;
  onMove?: (dir: 'up' | 'down') => void;
  onRemove?: () => void;
  /** „Heute nicht“: Übung für dieses Training ausblenden */
  onSkip?: () => void;
  /** Platz aus einer Vorlage: Übung kann gegen eine Alternative getauscht werden (solange noch kein Satz gespeichert ist) */
  slot?: { label: string; options: { exercise: Exercise; inGym: boolean }[]; onSwap: (exerciseId: string) => void };
}

const scoreOf = (type: Exercise['type'], s: WorkSet) =>
  type === 'time_distance' ? (s.distanceM ?? 0) || (s.durationSec ?? 0) : type === 'bodyweight' && !s.weightKg ? (s.reps ?? 0) : e1rm(s.weightKg ?? 0, s.reps ?? 0);

export function ExerciseCard({ sessionId, exercise, machine, alternatives, prescription, sets, onPickMachine, onMove, onRemove, slot, deload, onSkip }: Props) {
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
    return m ? `${[mf?.name, shortLine(m.line)].filter(Boolean).join(' ')} · ${m.name}` : undefined;
  }, [machine?.modelId]);
  const [menu, setMenu] = useState(false);

  const target = info && (deload ? applyDeload(info.target, (w) => loadStep(exercise, w, machine?.weightStepKg || 2.5), machine?.weightSteps) : info.target);
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

  const [details, setDetails] = useState(false);
  const firstTarget = target?.sets[0];
  const hint = !target
    ? ''
    : target.reason === 'increase'
      ? firstTarget?.weightKg !== undefined && previous[0]?.weightKg !== undefined && firstTarget.weightKg > (previous[0].weightKg ?? 0)
        ? `Mehr Gewicht: ${fmtSet(exercise.type, { weightKg: firstTarget.weightKg })}`
        : 'Steigern'
      : target.reason === 'repeat'
        ? 'Gleiches Gewicht, 1 Wdh. mehr'
        : target.reason === 'deload'
          ? 'Deload: leichter trainieren'
          : orientation
            ? 'Neues Gerät – Startgewicht wählen'
            : 'Erstes Mal – Startgewicht wählen';
  const HintIcon = !target ? Info : target.reason === 'increase' ? TrendingUp : target.reason === 'repeat' ? ArrowRight : target.reason === 'deload' ? TrendingDown : Sparkles;
  // Gerätezeile ohne Doppelungen: heißt das Gerät wie die Übung, reicht das Modell
  const sameName = !!machine && machine.label.trim().toLowerCase() === exercise.name.trim().toLowerCase();
  const machineText = machine
    ? sameName
      ? (modelLine ?? 'Gerät im Gym')
      : machine.label
    : exercise.freeWeight
      ? 'Freihantel'
      : needsMachine
        ? 'Gerät wählen'
        : 'Ohne Gerät';
  const subText = machine ? (sameName ? undefined : modelLine) : exercise.freeWeight ? 'alle Gyms' : undefined;

  return (
    <section className="rounded-card bg-slate-900 p-4">
      {/* Kopf: Muskel-Icon, Übung, Gerät (antippen = wechseln), Aktionen */}
      <div className="flex items-start gap-3">
        <MuscleTile muscle={exercise.muscleGroup} exerciseId={exercise.id} />
        <div className="min-w-0 flex-1">
          {slot && <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{slot.label}</p>}
          <h3 className="text-lg font-bold leading-snug">
            {done && <Check size={18} className="mr-1 inline text-emerald-400" strokeWidth={3} />}
            <ExerciseName name={exercise.name} className="inline" />
          </h3>
          <button type="button" onClick={onPickMachine} className="mt-0.5 flex max-w-full items-start gap-0.5 text-left text-sm leading-snug text-slate-400">
            <span className={`line-clamp-2 ${needsMachine ? 'font-semibold text-amber-300' : ''}`}>
              {machineText}
              {subText && <span className="text-slate-500"> · {subText}</span>}
            </span>
            <ChevronDown size={14} className="mt-0.5 shrink-0" />
          </button>
        </div>
        <div className="-mr-1 flex shrink-0">
          <IconButton label="Optionen" className="h-9 w-9 bg-transparent" onClick={() => setMenu(true)}>
            <MoreHorizontal size={18} strokeWidth={2} />
          </IconButton>
          {onSkip && sets.length === 0 && (
            <IconButton label="Heute nicht" className="h-9 w-9 bg-transparent" onClick={onSkip}>
              <X size={18} strokeWidth={2} />
            </IconButton>
          )}
        </div>
      </div>

      {/* Eine kurze Hinweiszeile – Details beim Antippen */}
      {target && (
        <button type="button" onClick={() => setDetails(!details)} className="mt-3 flex w-full items-center gap-2 text-left text-sm">
          <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${HINT_STYLE[target.reason]}`}>
            <HintIcon size={14} strokeWidth={2.2} /> {hint}
          </span>
          {note && <StickyNote size={14} className="shrink-0 text-slate-500" aria-label="Notiz vorhanden" />}
          <Info size={14} className="ml-auto shrink-0 text-slate-600" />
        </button>
      )}
      {target && details && (
        <div className="mt-2 space-y-1 rounded-2xl bg-black/40 px-3 py-2 text-xs text-slate-400">
          <p>
            <span className="text-slate-300">Ziel:</span> {target.sets.map((x) => fmtSet(exercise.type, x)).join(' · ')}
          </p>
          <p>{target.message}</p>
          <p>Vergleich: {levelText}</p>
          {orientation && (
            <p>
              Orientierung (anderes Gerät, {fmtDate(orientation.date)}): {orientation.sets.map((x) => fmtSet(exercise.type, x)).join(', ')}
            </p>
          )}
          {note && (
            <p className="flex items-center gap-1 italic">
              <StickyNote size={12} /> {note}
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
          {slot && (
            <section className="mb-2">
              <h3 className="label">Übung für „{slot.label}“</h3>
              <ul className="divide-y divide-slate-800 rounded-2xl bg-slate-800/50">
                {slot.options.map((o) => (
                  <li key={o.exercise.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                      onClick={() => {
                        slot.onSwap(o.exercise.id);
                        setMenu(false);
                      }}
                    >
                      <span>
                        {o.exercise.id === exercise.id && '✓ '}
                        {o.exercise.name}
                      </span>
                      <span className="text-xs text-slate-500">{o.inGym ? (o.exercise.freeWeight ? 'Freihantel' : 'im Gym') : 'kein Gerät erfasst'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
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
          <Button variant="secondary" className="w-full" onClick={() => nav(`/progress?ex=${exercise.id}`)}>
            <LineChart size={18} /> Fortschritt ansehen
          </Button>
          {onMove && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => onMove('up')}>
                <ArrowUp size={16} /> Nach oben
              </Button>
              <Button variant="secondary" onClick={() => onMove('down')}>
                <ArrowDown size={16} /> Nach unten
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
