import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, Card, Modal, Stepper } from '../../components/ui';
import { all, db, patch, remove, save } from '../../local/db';
import { targetFor } from '../../local/queries';
import { LEVEL_LABEL } from '../../domain/history';
import type { Prescription, WorkSet } from '../../domain/progression';
import { fmtDate, fmtDuration, parseDuration, parseNum } from '../../domain/units';
import type { ExcludeReason, Exercise, GymMachine, SetEntry } from '../../model/types';
import { fmtSet } from './format';

const REASON_STYLE = {
  first: 'bg-sky-900/40 text-sky-200',
  increase: 'bg-emerald-900/40 text-emerald-200',
  repeat: 'bg-slate-700 text-slate-200',
  deload: 'bg-amber-900/40 text-amber-200',
} as const;
const REASON_LABEL = { first: 'Start', increase: 'Steigern', repeat: 'Halten', deload: 'Deload' } as const;
const EXCLUDE_LABEL: Record<ExcludeReason, string> = { unsauber: 'unsauber', ersatz: 'Ersatz', sonstiges: 'zählt nicht' };
type Rating = 'ok' | ExcludeReason;

interface Props {
  sessionId: string;
  gymId: string;
  exercise: Exercise;
  machine?: GymMachine;
  /** Geräte dieses Gyms für die Übung (zum Wechseln) */
  alternatives: GymMachine[];
  prescription: Prescription;
  sets: SetEntry[];
  onPickMachine: () => void;
  onMove?: (dir: 'up' | 'down') => void;
  onRemove?: () => void;
}

export function ExerciseCard({ sessionId, exercise, machine, alternatives, prescription, sets, onPickMachine, onMove, onRemove }: Props) {
  const needsMachine = !machine && !exercise.freeWeight && alternatives.length > 0;
  const info = useLiveQuery(
    () => targetFor({ exercise, machine, prescription, excludeSessionId: sessionId }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercise.id, machine?.id, machine?.weightStepKg, JSON.stringify(prescription), sessionId, sets.length],
  );
  const note = useLiveQuery(async () => (machine ? (await all('machineNotes')).find((n) => n.machineId === machine.id)?.note : undefined), [machine?.id]);
  const modelLine = useLiveQuery(async () => {
    const m = machine?.modelId ? await db.equipmentModels.get(machine.modelId) : undefined;
    const mf = m ? await db.manufacturers.get(m.manufacturerId) : undefined;
    return m ? [mf?.name, m.line].filter(Boolean).join(' ') : undefined;
  }, [machine?.modelId]);
  const machineText = machine
    ? machine.label.trim().toLowerCase() === exercise.name.trim().toLowerCase()
      ? (modelLine ?? 'Gerät im Gym')
      : machine.label + (modelLine ? ` (${modelLine})` : '')
    : exercise.freeWeight
      ? 'Freihantel'
      : 'kein Gerät gewählt';
  const target = info?.target;
  const workSets = sets.filter((s) => !s.isWarmup);
  const isEndurance = exercise.type === 'time_distance';
  const done = !!target && workSets.length >= target.sets.length;
  const [open, setOpen] = useState(true);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (done) setOpen(false);
  }, [done]);

  const [editing, setEditing] = useState<SetEntry | null>(null);
  const [weight, setWeight] = useState<number | undefined>();
  const [reps, setReps] = useState<number | undefined>();
  const [duration, setDuration] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [warmup, setWarmup] = useState(false);
  const [rating, setRating] = useState<Rating>('ok');

  const nextTarget: WorkSet | undefined = target?.sets[workSets.length] ?? target?.sets.at(-1);
  const lastLogged = workSets.at(-1);
  const extra = done;
  const targetKey = target ? JSON.stringify(target.sets) : '';

  useEffect(() => {
    if (editing || !target) return;
    setWeight(lastLogged?.weightKg ?? nextTarget?.weightKg);
    setReps(extra && lastLogged?.reps ? lastLogged.reps : nextTarget?.reps);
    setDuration(nextTarget?.durationSec !== undefined ? fmtDuration(nextTarget.durationSec) : '');
    setDistanceKm(nextTarget?.distanceM ? String(nextTarget.distanceM / 1000) : '');
    setWarmup(false);
    setRating('ok');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workSets.length, targetKey, editing]);

  const values = (): Partial<SetEntry> | null => {
    if (isEndurance) {
      const durationSec = parseDuration(duration);
      const km = parseNum(distanceKm);
      if (durationSec === undefined && km === undefined) return null;
      return { durationSec, distanceM: km !== undefined ? Math.round(km * 1000) : undefined };
    }
    if (!reps) return null;
    if (exercise.type === 'weight_reps' && weight === undefined) return null;
    return { weightKg: weight ?? 0, reps };
  };
  const v = values();

  const saveSet = async () => {
    if (!v) return;
    const flags = rating === 'ok' ? { excluded: false, excludeReason: undefined } : { excluded: true, excludeReason: rating };
    if (editing) {
      await patch('sets', editing.id, { ...v, isWarmup: warmup, ...flags });
      setEditing(null);
    } else {
      await save('sets', {
        sessionId,
        machineId: machine?.id,
        exerciseId: exercise.id,
        setIndex: sets.length + 1,
        isWarmup: warmup,
        createdAt: Date.now(),
        ...v,
        ...flags,
      });
    }
  };

  const startEdit = (s: SetEntry) => {
    setEditing(s);
    setOpen(true);
    setWeight(s.weightKg);
    setReps(s.reps);
    setDuration(s.durationSec !== undefined ? fmtDuration(s.durationSec) : '');
    setDistanceKm(s.distanceM ? String(s.distanceM / 1000) : '');
    setWarmup(s.isWarmup);
    setRating(s.excluded ? (s.excludeReason ?? 'sonstiges') : 'ok');
  };

  const used = info?.used;
  const lastSession = used?.sessions.at(-1);
  const levelText = used
    ? used.level === 'model'
      ? `${LEVEL_LABEL.model} in anderem Gym`
      : LEVEL_LABEL[used.level]
    : info?.levels.exercise.sessions.length
      ? 'kein vergleichbares Gerät – Startwert wählen'
      : 'erstes Mal';
  const orientation = !used ? info?.levels.exercise.sessions.at(-1) : undefined;

  return (
    <Card className={done ? 'opacity-90' : ''}>
      <div className="flex items-start gap-2">
        <button type="button" className="flex flex-1 items-start justify-between text-left" onClick={() => setOpen((o) => !o)}>
          <div>
            <h3 className="text-lg font-bold">
              {done && <span className="text-emerald-400">✓ </span>}
              {exercise.name}
            </h3>
            <p className="text-xs text-slate-500">
              {machineText}
              {!isEndurance && ` · ${prescription.sets} × ${prescription.repMin}–${prescription.repMax}`}
            </p>
          </div>
          <span className="text-sm text-slate-500">
            {workSets.length}/{target?.sets.length ?? prescription.sets}
          </span>
        </button>
        <button type="button" className="-mr-2 -mt-1 rounded p-2 text-lg text-slate-500" aria-label="Optionen" onClick={() => setMenu(true)}>
          ⋯
        </button>
      </div>

      {needsMachine && (
        <Button variant="secondary" className="mt-3 w-full" onClick={onPickMachine}>
          Gerät in diesem Gym wählen
        </Button>
      )}

      {!open && done && (
        <button
          type="button"
          className="mt-2 w-full rounded-lg border border-dashed border-slate-600 py-2 text-sm font-semibold text-emerald-400"
          onClick={() => setOpen(true)}
        >
          + Weiterer Satz
        </button>
      )}

      {open && target && (
        <div className="mt-3 space-y-3">
          <div className="rounded-lg bg-slate-900/50 p-3">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className={`chip ${REASON_STYLE[target.reason]}`}>{REASON_LABEL[target.reason]}</span>
              <span className="text-sm font-semibold">Ziel: {target.sets.map((s) => fmtSet(exercise.type, s)).join(', ')}</span>
            </div>
            <p className="text-xs text-slate-500">{target.message}</p>
            <p className="mt-1 text-xs text-slate-500">
              <span className="chip mr-1 bg-violet-900/40 text-violet-200">{levelText}</span>
              {lastSession && `Letztes Mal ${fmtDate(lastSession.date)}: ${lastSession.sets.map((s) => fmtSet(exercise.type, s)).join(', ')}`}
            </p>
            {orientation && (
              <p className="mt-1 text-xs text-slate-500">
                Zur Orientierung (anderes Gerät, {fmtDate(orientation.date)}): {orientation.sets.map((s) => fmtSet(exercise.type, s)).join(', ')}
              </p>
            )}
            {note && <p className="mt-1 text-xs italic text-slate-400">📝 {note}</p>}
          </div>

          {sets.length > 0 && (
            <ol className="space-y-1">
              {sets.map((s) => {
                const idx = workSets.indexOf(s);
                const t = idx >= 0 ? target.sets[idx] : undefined;
                const hit = !s.excluded && t && !isEndurance && (s.reps ?? 0) >= (t.reps ?? 0) && (s.weightKg ?? 0) >= (t.weightKg ?? 0);
                return (
                  <li
                    key={s.id}
                    className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm ${editing?.id === s.id ? 'ring-2 ring-emerald-500' : ''} ${
                      s.excluded ? 'bg-slate-800/60 text-slate-500' : 'bg-slate-700/50'
                    }`}
                  >
                    <button type="button" className="flex-1 text-left" onClick={() => startEdit(s)}>
                      <span className="mr-2 text-slate-400">{s.isWarmup ? 'W' : idx + 1}.</span>
                      <span className={s.excluded ? 'line-through' : ''}>{fmtSet(exercise.type, s)}</span>
                      {hit && <span className="ml-2 text-emerald-400">✓</span>}
                      {s.excluded && <span className="chip ml-2 bg-amber-900/40 text-amber-200">{EXCLUDE_LABEL[s.excludeReason ?? 'sonstiges']}</span>}
                    </button>
                    <button type="button" className="px-2 text-slate-400" aria-label="Satz löschen" onClick={() => remove('sets', s.id)}>
                      ✕
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="flex gap-2">
            {isEndurance ? (
              <>
                <label className="flex-1">
                  <span className="label">Dauer (mm:ss)</span>
                  <input className="input text-center" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="20:00" />
                </label>
                <label className="flex-1">
                  <span className="label">Distanz (km)</span>
                  <input className="input text-center" inputMode="decimal" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} placeholder="optional" />
                </label>
              </>
            ) : (
              <>
                <Stepper
                  label={exercise.type === 'bodyweight' ? 'Zusatz' : 'Gewicht'}
                  suffix="kg"
                  value={weight}
                  onChange={setWeight}
                  step={machine?.weightStepKg || (exercise.freeWeight ? 2 : 2.5)}
                  steps={machine?.weightSteps}
                />
                <Stepper label="Wdh." value={reps} onChange={(n) => setReps(n === undefined ? undefined : Math.round(n))} step={1} />
              </>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={warmup} onChange={(e) => setWarmup(e.target.checked)} className="h-5 w-5" />
              Aufwärmen
            </label>
            <select
              className={`input w-auto px-2 py-1.5 text-sm ${rating !== 'ok' ? 'border-amber-500 text-amber-300' : ''}`}
              value={rating}
              onChange={(e) => setRating(e.target.value as Rating)}
              aria-label="Wertung"
            >
              <option value="ok">✓ zählt</option>
              <option value="unsauber">unsauber</option>
              <option value="ersatz">Ersatz</option>
              <option value="sonstiges">zählt nicht</option>
            </select>
          </div>
          <div className="flex gap-2">
            {editing && (
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Abbrechen
              </Button>
            )}
            <Button className="flex-1" disabled={!v || needsMachine} onClick={saveSet}>
              {editing ? 'Satz aktualisieren' : extra ? `${workSets.length + 1}. Satz speichern (zusätzlich)` : 'Satz speichern'}
            </Button>
          </div>
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
    </Card>
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
      <ul className="divide-y divide-slate-700">
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
