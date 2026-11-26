/**
 * Satz-Tabelle: jede Zeile ist mit dem Ziel vorbefüllt, ein Tipp auf ○ speichert den Satz.
 * Gespeicherte Sätze antippen → bearbeiten (Werte, Aufwärmen, Wertung, löschen).
 */
import { useEffect, useState } from 'react';
import { BestBadge } from '../../components/ui';
import { e1rm } from '../../domain/metrics';
import type { WorkSet } from '../../domain/progression';
import { fmtDuration, fmtNumber, parseDuration, parseNum } from '../../domain/units';
import type { ExcludeReason, Exercise, GymMachine, SetEntry } from '../../model/types';
import { patch, remove, save } from '../../local/db';

type Rating = 'ok' | ExcludeReason;
const EXCLUDE_LABEL: Record<ExcludeReason, string> = { unsauber: 'unsauber', ersatz: 'Ersatz', sonstiges: 'zählt nicht' };

interface Props {
  sessionId: string;
  exercise: Exercise;
  machine?: GymMachine;
  sets: SetEntry[];
  target: WorkSet[];
  /** Sätze des letzten vergleichbaren Trainings (Spalte „Letztes Mal“) */
  previous: WorkSet[];
  /** Bisheriger Bestwert (e1RM bzw. Wdh./Dauer) vor diesem Training */
  bestBefore: number;
  disabled?: boolean;
}

const score = (type: Exercise['type'], s: WorkSet) =>
  type === 'time_distance' ? (s.distanceM ?? 0) || (s.durationSec ?? 0) : type === 'bodyweight' && !s.weightKg ? (s.reps ?? 0) : e1rm(s.weightKg ?? 0, s.reps ?? 0);

const short = (type: Exercise['type'], s?: WorkSet) => {
  if (!s) return '—';
  if (type === 'time_distance') return [s.durationSec ? fmtDuration(s.durationSec) : '', s.distanceM ? `${fmtNumber(s.distanceM / 1000, 2)} km` : ''].filter(Boolean).join(' · ') || '—';
  if (type === 'bodyweight' && !s.weightKg) return `${s.reps ?? '?'} Wdh.`;
  return `${fmtNumber(s.weightKg ?? 0)} × ${s.reps ?? '?'}`;
};

export function SetTable({ sessionId, exercise, machine, sets, target, previous, bestBefore, disabled }: Props) {
  const type = exercise.type;
  const endurance = type === 'time_distance';
  const [extraRows, setExtraRows] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const rows = Math.max(target.length, sets.length) + extraRows;
  useEffect(() => {
    // zusätzliche Zeile verbraucht, sobald sie gespeichert wurde
    if (extraRows && sets.length >= Math.max(target.length, 0) + extraRows) setExtraRows(0);
  }, [sets.length, target.length, extraRows]);

  // Bestwerte innerhalb dieses Trainings markieren (laufender Höchstwert)
  let running = bestBefore;
  const best = new Set<string>();
  for (const s of sets) {
    if (s.isWarmup || s.excluded) continue;
    const v = score(type, s);
    if (bestBefore > 0 && v > running + 1e-9) best.add(s.id);
    running = Math.max(running, v);
  }

  const work = sets.filter((s) => !s.isWarmup);
  const lastLogged = work.at(-1);

  return (
    <div>
      <div className="grid grid-cols-[2rem_1fr_5rem_4rem_2.5rem] items-center gap-x-2 px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        <span>Satz</span>
        <span>Zuletzt</span>
        <span className="text-center">{endurance ? 'Dauer' : type === 'bodyweight' ? '+kg' : 'kg'}</span>
        <span className="text-center">{endurance ? 'km' : 'Wdh.'}</span>
        <span />
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: rows }, (_, i) => {
          const logged = sets[i];
          if (logged && editing !== logged.id)
            return (
              <LoggedRow
                key={logged.id}
                n={logged.isWarmup ? 'W' : String(work.indexOf(logged) + 1)}
                prev={short(type, previous[i])}
                set={logged}
                type={type}
                best={best.has(logged.id)}
                onEdit={() => setEditing(logged.id)}
              />
            );
          // Vorbelegung: Zielwerte; Gewicht vom letzten gespeicherten Satz übernehmen, falls abweichend
          const t = target[i] ?? target.at(-1) ?? lastLogged ?? {};
          const init: WorkSet = logged ?? {
            ...t,
            weightKg: lastLogged && i >= sets.length && lastLogged.weightKg !== undefined && i > 0 ? lastLogged.weightKg : t.weightKg,
            reps: i >= target.length && lastLogged?.reps ? lastLogged.reps : t.reps,
          };
          return (
            <PendingRow
              key={logged?.id ?? `p${i}`}
              n={String(i + 1)}
              prev={short(type, previous[i])}
              init={init}
              type={type}
              step={machine?.weightStepKg || (exercise.freeWeight ? 2 : 2.5)}
              editingSet={logged}
              disabled={disabled || (!logged && i > sets.length)}
              onSave={async (v, flags) => {
                if (logged) {
                  await patch('sets', logged.id, { ...v, ...flags });
                  setEditing(null);
                } else
                  await save('sets', {
                    sessionId,
                    machineId: machine?.id,
                    exerciseId: exercise.id,
                    setIndex: sets.length + 1,
                    isWarmup: false,
                    createdAt: Date.now(),
                    ...v,
                    ...flags,
                  });
              }}
              onCancel={logged ? () => setEditing(null) : undefined}
              onDelete={
                logged
                  ? async () => {
                      await remove('sets', logged.id);
                      setEditing(null);
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
      <button
        type="button"
        disabled={disabled}
        className="mt-3 w-full rounded-2xl border border-dashed border-slate-700 py-2.5 text-sm font-semibold text-slate-300 active:bg-slate-800 disabled:opacity-40"
        onClick={() => setExtraRows((n) => n + 1)}
      >
        + Satz
      </button>
    </div>
  );
}

function Circle({ children, filled }: { children: React.ReactNode; filled?: boolean }) {
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${filled ? 'bg-white text-black' : 'border-2 border-slate-600 text-slate-300'}`}
    >
      {children}
    </span>
  );
}

function LoggedRow({ n, prev, set, type, best, onEdit }: { n: string; prev: string; set: SetEntry; type: Exercise['type']; best: boolean; onEdit: () => void }) {
  const endurance = type === 'time_distance';
  return (
    <button
      type="button"
      onClick={onEdit}
      className={`grid w-full grid-cols-[2rem_1fr_5rem_4rem_2.5rem] items-center gap-x-2 rounded-2xl px-1 py-1.5 text-left ${set.excluded ? 'opacity-50' : ''}`}
    >
      <Circle filled={!set.isWarmup}>{n}</Circle>
      <span className="text-sm text-slate-500">
        {prev}
        {best && (
          <span className="block">
            <BestBadge label="Bestwert" />
          </span>
        )}
        {set.excluded && <span className="block text-[10px] text-amber-300">{EXCLUDE_LABEL[set.excludeReason ?? 'sonstiges']}</span>}
      </span>
      <span className={`text-center text-lg font-bold tabular-nums ${set.excluded ? 'line-through' : ''}`}>
        {endurance ? (set.durationSec ? fmtDuration(set.durationSec) : '—') : fmtNumber(set.weightKg ?? 0)}
      </span>
      <span className="text-center text-lg font-bold tabular-nums">{endurance ? (set.distanceM ? fmtNumber(set.distanceM / 1000, 2) : '—') : set.reps}</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">✓</span>
    </button>
  );
}

function PendingRow({
  n,
  prev,
  init,
  type,
  step,
  editingSet,
  disabled,
  onSave,
  onCancel,
  onDelete,
}: {
  n: string;
  prev: string;
  init: WorkSet;
  type: Exercise['type'];
  step: number;
  editingSet?: SetEntry;
  disabled?: boolean;
  onSave: (v: Partial<SetEntry>, flags: Partial<SetEntry>) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => void;
}) {
  const endurance = type === 'time_distance';
  const fmtW = (w?: number) => (w === undefined ? '' : String(w).replace('.', ','));
  const [a, setA] = useState(endurance ? (init.durationSec !== undefined ? fmtDuration(init.durationSec) : '') : fmtW(init.weightKg));
  const [b, setB] = useState(endurance ? (init.distanceM ? String(init.distanceM / 1000).replace('.', ',') : '') : init.reps !== undefined ? String(init.reps) : '');
  const [warmup, setWarmup] = useState(editingSet?.isWarmup ?? false);
  const [rating, setRating] = useState<Rating>(editingSet?.excluded ? (editingSet.excludeReason ?? 'sonstiges') : 'ok');
  const key = JSON.stringify(init);
  useEffect(() => {
    if (editingSet) return;
    setA(endurance ? (init.durationSec !== undefined ? fmtDuration(init.durationSec) : '') : fmtW(init.weightKg));
    setB(endurance ? (init.distanceM ? String(init.distanceM / 1000).replace('.', ',') : '') : init.reps !== undefined ? String(init.reps) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const values = (): Partial<SetEntry> | null => {
    if (endurance) {
      const durationSec = parseDuration(a);
      const km = parseNum(b);
      if (durationSec === undefined && km === undefined) return null;
      return { durationSec, distanceM: km !== undefined ? Math.round(km * 1000) : undefined };
    }
    const w = a.trim() === '' ? (type === 'bodyweight' ? 0 : undefined) : parseNum(a);
    const r = parseNum(b);
    if (!r || w === undefined) return null;
    return { weightKg: w, reps: Math.round(r) };
  };
  const v = values();
  const bump = (d: number) => {
    const cur = parseNum(a) ?? 0;
    setA(fmtW(Math.max(0, Math.round((cur + d) * 1000) / 1000)));
  };
  const flags = (): Partial<SetEntry> => ({
    isWarmup: warmup,
    ...(rating === 'ok' ? { excluded: false, excludeReason: undefined } : { excluded: true, excludeReason: rating }),
  });

  return (
    <div className={`rounded-2xl ${editingSet ? 'bg-slate-800/70 p-2' : ''} ${disabled ? 'opacity-40' : ''}`}>
      <div className="grid grid-cols-[2rem_1fr_5rem_4rem_2.5rem] items-center gap-x-2 px-1 py-1">
        <Circle>{n}</Circle>
        <span className="text-sm text-slate-500">{prev}</span>
        <input
          aria-label={endurance ? `Dauer Satz ${n}` : `Gewicht Satz ${n}`}
          inputMode={endurance ? 'numeric' : 'decimal'}
          disabled={disabled}
          className="h-10 w-full rounded-xl border border-dashed border-slate-600 bg-transparent text-center text-lg font-bold tabular-nums outline-none focus:border-white"
          value={a}
          onChange={(e) => setA(e.target.value)}
        />
        <input
          aria-label={endurance ? `Distanz Satz ${n}` : `Wdh. Satz ${n}`}
          inputMode="decimal"
          disabled={disabled}
          className="h-10 w-full rounded-xl border border-dashed border-slate-600 bg-transparent text-center text-lg font-bold tabular-nums outline-none focus:border-white"
          value={b}
          onChange={(e) => setB(e.target.value)}
        />
        <button
          type="button"
          aria-label={`Satz ${n} speichern`}
          disabled={!v || disabled}
          onClick={() => v && onSave(v, flags())}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-500 text-slate-400 active:bg-white active:text-black disabled:opacity-40"
        >
          {editingSet ? '✓' : ''}
        </button>
      </div>
      {!endurance && !disabled && (
        <div className="grid grid-cols-[2rem_1fr_5rem_4rem_2.5rem] gap-x-2 px-1">
          <span />
          <span />
          <span className="flex justify-between text-sm text-slate-500">
            <button type="button" aria-label={`Gewicht Satz ${n} verringern`} className="px-2" onClick={() => bump(-step)}>
              −
            </button>
            <button type="button" aria-label={`Gewicht Satz ${n} erhöhen`} className="px-2" onClick={() => bump(step)}>
              +
            </button>
          </span>
        </div>
      )}
      {editingSet && (
        <div className="mt-2 flex flex-wrap items-center gap-2 px-1 text-sm">
          <label className="flex items-center gap-1.5 text-slate-300">
            <input type="checkbox" checked={warmup} onChange={(e) => setWarmup(e.target.checked)} className="h-4 w-4" /> Aufwärmen
          </label>
          <select className="input w-auto px-2 py-1 text-sm" value={rating} onChange={(e) => setRating(e.target.value as Rating)} aria-label="Wertung">
            <option value="ok">✓ zählt</option>
            <option value="unsauber">unsauber</option>
            <option value="ersatz">Ersatz</option>
            <option value="sonstiges">zählt nicht</option>
          </select>
          <span className="flex-1" />
          <button type="button" className="text-red-400" onClick={onDelete}>
            Löschen
          </button>
          <button type="button" className="text-slate-400" onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}
