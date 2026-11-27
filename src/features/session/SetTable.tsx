/**
 * Satz-Tabelle nach gängigem Muster (Strong/Hevy):
 * - Spalten: Satz · Vorher · kg · Wdh. · ✓
 * - Ziel steht grau als Platzhalter in den Feldern; ✓ übernimmt es, Eintippen überschreibt.
 * - Erledigte Sätze grün hinterlegt, bleiben direkt bearbeitbar (Wert ändern → speichert beim Verlassen).
 * - Satznummer antippen → Aufwärmsatz, Wertung, Löschen.
 */
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '../../components/ui';
import { e1rm } from '../../domain/metrics';
import type { WorkSet } from '../../domain/progression';
import { fmtDuration, fmtNumber, parseDuration, parseNum } from '../../domain/units';
import type { ExcludeReason, Exercise, GymMachine, SetEntry } from '../../model/types';
import { patch, remove, save } from '../../local/db';

const EXCLUDE_LABEL: Record<ExcludeReason, string> = { unsauber: 'unsauber', ersatz: 'Ersatz', sonstiges: 'zählt nicht' };

interface Props {
  sessionId: string;
  exercise: Exercise;
  machine?: GymMachine;
  sets: SetEntry[];
  target: WorkSet[];
  /** Sätze des letzten vergleichbaren Trainings (Spalte „Vorher“) */
  previous: WorkSet[];
  /** Bisheriger Bestwert vor diesem Training */
  bestBefore: number;
  disabled?: boolean;
}

const score = (type: Exercise['type'], s: WorkSet) =>
  type === 'time_distance' ? (s.distanceM ?? 0) || (s.durationSec ?? 0) : type === 'bodyweight' && !s.weightKg ? (s.reps ?? 0) : e1rm(s.weightKg ?? 0, s.reps ?? 0);

const short = (type: Exercise['type'], s?: WorkSet) => {
  if (!s) return '–';
  if (type === 'time_distance') return [s.durationSec ? fmtDuration(s.durationSec) : '', s.distanceM ? `${fmtNumber(s.distanceM / 1000, 2)} km` : ''].filter(Boolean).join(' · ') || '–';
  if (type === 'bodyweight' && !s.weightKg) return `${s.reps ?? '–'} Wdh.`;
  return `${fmtNumber(s.weightKg ?? 0)} × ${s.reps ?? '–'}`;
};

const GRID = 'grid grid-cols-[2.25rem_1fr_4.75rem_3.75rem_2.75rem] items-center gap-x-2';

export function SetTable({ sessionId, exercise, machine, sets, target, previous, bestBefore, disabled }: Props) {
  const type = exercise.type;
  const endurance = type === 'time_distance';
  const [extraRows, setExtraRows] = useState(0);
  const [menuFor, setMenuFor] = useState<SetEntry | null>(null);
  const rows = Math.max(target.length, sets.length) + extraRows;
  useEffect(() => {
    if (extraRows && sets.length >= target.length + extraRows) setExtraRows(0);
  }, [sets.length, target.length, extraRows]);

  // Bestwerte innerhalb dieses Trainings (laufender Höchstwert)
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
    <div className={disabled ? 'pointer-events-none opacity-40' : ''}>
      <div className={`${GRID} px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500`}>
        <span className="text-center">Satz</span>
        <span>Vorher</span>
        <span className="text-center">{endurance ? 'Dauer' : type === 'bodyweight' ? '+kg' : 'kg'}</span>
        <span className="text-center">{endurance ? 'km' : 'Wdh.'}</span>
        <span />
      </div>
      <div className="space-y-1">
        {Array.from({ length: rows }, (_, i) => {
          const logged = sets[i];
          // Platzhalter: Ziel dieses Satzes; nach einem abweichenden Gewicht das zuletzt genutzte Gewicht
          const t = target[i] ?? target.at(-1) ?? lastLogged ?? {};
          const hint: WorkSet = {
            ...t,
            weightKg: lastLogged?.weightKg !== undefined && i >= sets.length && i > 0 ? lastLogged.weightKg : t.weightKg,
            reps: i >= target.length && lastLogged?.reps ? lastLogged.reps : t.reps,
          };
          return (
            <Row
              key={logged?.id ?? `p${i}`}
              n={logged?.isWarmup ? 'W' : String((logged ? work.indexOf(logged) : work.length + (i - sets.length)) + 1)}
              prev={short(type, previous[i])}
              hint={hint}
              logged={logged}
              best={!!logged && best.has(logged.id)}
              type={type}
              onNumber={logged ? () => setMenuFor(logged) : undefined}
              onSave={async (v) => {
                if (logged) await patch('sets', logged.id, v);
                else
                  await save('sets', {
                    sessionId,
                    machineId: machine?.id,
                    exerciseId: exercise.id,
                    setIndex: sets.length + 1,
                    isWarmup: false,
                    createdAt: Date.now(),
                    ...v,
                  });
              }}
            />
          );
        })}
      </div>
      <button
        type="button"
        className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-slate-400 active:bg-slate-800"
        onClick={() => setExtraRows((n) => n + 1)}
      >
        + Satz hinzufügen
      </button>

      <Modal open={!!menuFor} onClose={() => setMenuFor(null)} title="Satz">
        {menuFor && (
          <div className="space-y-2 text-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl bg-slate-800 px-4 py-3"
              onClick={async () => {
                await patch('sets', menuFor.id, { isWarmup: !menuFor.isWarmup });
                setMenuFor(null);
              }}
            >
              Aufwärmsatz {menuFor.isWarmup && <Check size={18} />}
            </button>
            <p className="label pt-2">Wertung</p>
            <div className="grid grid-cols-2 gap-2">
              {(['ok', 'unsauber', 'ersatz', 'sonstiges'] as const).map((r) => {
                const active = r === 'ok' ? !menuFor.excluded : menuFor.excludeReason === r && menuFor.excluded;
                return (
                  <button
                    key={r}
                    type="button"
                    className={`rounded-2xl px-3 py-2.5 ${active ? 'bg-white text-black' : 'bg-slate-800'}`}
                    onClick={async () => {
                      await patch('sets', menuFor.id, r === 'ok' ? { excluded: false, excludeReason: undefined } : { excluded: true, excludeReason: r });
                      setMenuFor(null);
                    }}
                  >
                    {r === 'ok' ? 'zählt' : EXCLUDE_LABEL[r]}
                  </button>
                );
              })}
            </div>
            <p className="pt-1 text-xs text-slate-500">Nicht gewertete Sätze bleiben gespeichert, zählen aber nicht für Ziel und Bestwerte.</p>
            <button
              type="button"
              className="w-full rounded-2xl bg-red-500/15 px-4 py-3 font-semibold text-red-400"
              onClick={async () => {
                await remove('sets', menuFor.id);
                setMenuFor(null);
              }}
            >
              Satz löschen
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

const fmtW = (w?: number) => (w === undefined ? '' : String(w).replace('.', ','));

function Row({
  n,
  prev,
  hint,
  logged,
  best,
  type,
  onNumber,
  onSave,
}: {
  n: string;
  prev: string;
  hint: WorkSet;
  logged?: SetEntry;
  best: boolean;
  type: Exercise['type'];
  onNumber?: () => void;
  onSave: (v: Partial<SetEntry>) => Promise<void>;
}) {
  const endurance = type === 'time_distance';
  const fromSet = (s?: WorkSet) =>
    endurance
      ? [s?.durationSec !== undefined ? fmtDuration(s.durationSec) : '', s?.distanceM ? fmtW(s.distanceM / 1000) : '']
      : [s?.weightKg !== undefined && (s.weightKg || type !== 'bodyweight') ? fmtW(s.weightKg) : '', s?.reps !== undefined ? String(s.reps) : ''];
  const [a, setA] = useState(logged ? fromSet(logged)[0] : '');
  const [b, setB] = useState(logged ? fromSet(logged)[1] : '');
  const ph = fromSet(hint);
  useEffect(() => {
    if (logged) {
      const [x, y] = fromSet(logged);
      setA(x);
      setB(y);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logged?.weightKg, logged?.reps, logged?.durationSec, logged?.distanceM]);

  /** Werte aus Eingabe, sonst aus dem Platzhalter (= Ziel) */
  const values = (): Partial<SetEntry> | null => {
    const av = a.trim() || ph[0];
    const bv = b.trim() || ph[1];
    if (endurance) {
      const durationSec = parseDuration(av);
      const km = parseNum(bv);
      if (durationSec === undefined && km === undefined) return null;
      return { durationSec, distanceM: km !== undefined ? Math.round(km * 1000) : undefined };
    }
    const w = av === '' ? (type === 'bodyweight' ? 0 : undefined) : parseNum(av);
    const r = parseNum(bv);
    if (!r || w === undefined) return null;
    return { weightKg: w, reps: Math.round(r) };
  };
  const v = values();
  const doneRow = !!logged;

  // bestehenden Satz beim Verlassen eines Feldes aktualisieren
  const commitEdit = () => {
    if (!logged || !v) return;
    const changed = endurance ? v.durationSec !== logged.durationSec || v.distanceM !== logged.distanceM : v.weightKg !== logged.weightKg || v.reps !== logged.reps;
    if (changed) onSave(v);
  };

  const inputCls = `h-10 w-full rounded-lg text-center text-base font-semibold tabular-nums outline-none placeholder:font-normal placeholder:text-slate-600 focus:ring-2 focus:ring-white/60 ${
    doneRow ? 'bg-transparent' : 'bg-slate-800'
  } ${logged?.excluded ? 'line-through' : ''}`;

  return (
    <div className={`${GRID} rounded-xl px-1 py-1 ${doneRow ? (logged?.excluded ? 'bg-slate-800/40' : 'bg-emerald-500/10') : ''}`}>
      <button
        type="button"
        onClick={onNumber}
        disabled={!onNumber}
        aria-label={onNumber ? `Satz ${n} Optionen` : `Satz ${n}`}
        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          n === 'W' ? 'bg-amber-500/20 text-amber-300' : doneRow ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
        }`}
      >
        {n}
      </button>
      <span className="truncate text-sm tabular-nums text-slate-500">
        {prev}
        {logged?.excluded && <span className="ml-1 text-[10px] text-amber-300">{EXCLUDE_LABEL[logged.excludeReason ?? 'sonstiges']}</span>}
      </span>
      <input
        aria-label={endurance ? `Dauer Satz ${n}` : `Gewicht Satz ${n}`}
        inputMode={endurance ? 'numeric' : 'decimal'}
        enterKeyHint="next"
        className={inputCls}
        placeholder={ph[0] || (endurance ? 'mm:ss' : '–')}
        value={a}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setA(e.target.value)}
        onBlur={commitEdit}
      />
      <input
        aria-label={endurance ? `Distanz Satz ${n}` : `Wdh. Satz ${n}`}
        inputMode="decimal"
        enterKeyHint="done"
        className={inputCls}
        placeholder={ph[1] || '–'}
        value={b}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setB(e.target.value)}
        onBlur={commitEdit}
      />
      <span className="relative mx-auto">
      {best && (
        <span className="absolute -right-1.5 -top-1.5 z-10 rounded-full bg-best px-1 text-[9px] font-black leading-4 text-black" aria-label="Neuer Bestwert">
          PR
        </span>
      )}
      <button
        type="button"
        aria-label={doneRow ? `Satz ${n} erledigt` : `Satz ${n} speichern`}
        disabled={!doneRow && !v}
        onClick={() => !doneRow && v && onSave({ ...v, excluded: false })}
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
          doneRow ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400 active:bg-emerald-500 active:text-black disabled:opacity-40'
        }`}
      >
        <Check size={18} strokeWidth={3} />
      </button>
      </span>
    </div>
  );
}
