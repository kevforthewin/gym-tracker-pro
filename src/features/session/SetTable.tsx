/**
 * Satz-Tabelle nach gängigem Muster (Strong/Hevy):
 * - Spalten: Satz · Vorher · kg · Wdh. · ✓
 * - Ziel steht grau als Platzhalter in den Feldern; ✓ übernimmt es, Eintippen überschreibt.
 * - Erledigte Sätze grün hinterlegt, bleiben direkt bearbeitbar (Wert ändern → speichert beim Verlassen).
 * - Satznummer antippen → Aufwärmsatz, Wertung, Löschen.
 * - Der nächste offene Satz ist als großer Editor aufgeklappt: −/+ für Gewicht und Wdh. mit großen Tasten,
 *   darunter „Satz speichern“. Andere Sätze antippen → werden im Editor geöffnet.
 */
import { useEffect, useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { Modal } from '../../components/ui';
import { e1rm } from '../../domain/metrics';
import { stepDown, stepUp, type WorkSet } from '../../domain/progression';
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
  /** Im Editor geöffneter Satz; null = automatisch der nächste offene */
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const rows = Math.max(target.length, sets.length) + extraRows;
  const useEditor = !endurance && !disabled;
  const focused = !useEditor ? -1 : focusIdx ?? (sets.length < rows ? sets.length : -1);
  const step = machine?.weightStepKg || 2.5;
  const steps = machine?.weightSteps;
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
          const n = logged?.isWarmup ? 'W' : String((logged ? work.indexOf(logged) : work.length + (i - sets.length)) + 1);
          const onSave = async (v: Partial<SetEntry>) => {
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
          };
          if (i === focused)
            return (
              <SetEditor
                key={`e${logged?.id ?? i}`}
                n={n}
                prev={short(type, previous[i])}
                hint={hint}
                logged={logged}
                type={type}
                step={step}
                steps={steps}
                onNumber={logged ? () => setMenuFor(logged) : undefined}
                onSave={async (v) => {
                  await onSave(v);
                  setFocusIdx(null);
                }}
                onClose={() => setFocusIdx(-1)}
              />
            );
          return (
            <Row
              key={logged?.id ?? `p${i}`}
              n={n}
              prev={short(type, previous[i])}
              hint={hint}
              logged={logged}
              best={!!logged && best.has(logged.id)}
              type={type}
              onNumber={logged ? () => setMenuFor(logged) : undefined}
              onOpen={useEditor && (logged || i === sets.length) ? () => setFocusIdx(i) : undefined}
              onSave={async (v) => {
                await onSave(v);
                setFocusIdx(null);
              }}
            />
          );
        })}
      </div>
      <button
        type="button"
        className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-slate-400 active:bg-slate-800"
        onClick={() => {
          setExtraRows((n) => n + 1);
          setFocusIdx(null);
        }}
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
  onOpen,
  onSave,
}: {
  n: string;
  prev: string;
  hint: WorkSet;
  logged?: SetEntry;
  best: boolean;
  type: Exercise['type'];
  onNumber?: () => void;
  /** Kompakte Anzeige; Antippen öffnet den großen Editor */
  onOpen?: () => void;
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
      {onOpen || !endurance ? (
        <>
          <button type="button" onClick={onOpen} disabled={!onOpen} aria-label={`Gewicht Satz ${n}: ${a || ph[0] || '–'}`} className={`${inputCls} ${a ? 'text-white' : 'font-normal text-slate-600'}`}>
            {a || ph[0] || '–'}
          </button>
          <button type="button" onClick={onOpen} disabled={!onOpen} aria-label={`Wdh. Satz ${n}: ${b || ph[1] || '–'}`} className={`${inputCls} ${b ? 'text-white' : 'font-normal text-slate-600'}`}>
            {b || ph[1] || '–'}
          </button>
        </>
      ) : (
      <>
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
      </>
      )}
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

/** Großer Editor für einen Satz: ± mit großen Tasten, Wert antippen zum Eintippen. */
function SetEditor({
  n,
  prev,
  hint,
  logged,
  type,
  step,
  steps,
  onNumber,
  onSave,
  onClose,
}: {
  n: string;
  prev: string;
  hint: WorkSet;
  logged?: SetEntry;
  type: Exercise['type'];
  step: number;
  steps?: number[];
  onNumber?: () => void;
  onSave: (v: Partial<SetEntry>) => Promise<void>;
  onClose: () => void;
}) {
  const bw = type === 'bodyweight';
  const [w, setW] = useState<number | undefined>(logged?.weightKg ?? hint.weightKg ?? (bw ? 0 : undefined));
  const [r, setR] = useState<number | undefined>(logged?.reps ?? hint.reps);
  const ok = r !== undefined && r > 0 && (w !== undefined || bw);

  return (
    <div className={`rounded-2xl p-3 ring-1 ${logged ? 'bg-emerald-500/10 ring-emerald-500/30' : 'bg-slate-800/60 ring-white/10'}`}>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <button
          type="button"
          onClick={onNumber}
          disabled={!onNumber}
          aria-label={onNumber ? `Satz ${n} Optionen` : `Satz ${n}`}
          className="font-semibold text-slate-200"
        >
          Satz {n}
        </button>
        <span className="tabular-nums">Vorher {prev}</span>
      </div>
      <BigStepper
        label={bw ? 'Zusatzgewicht' : 'Gewicht'}
        unit="kg"
        value={w}
        decimal
        onChange={setW}
        onMinus={() => setW(stepDown(w ?? 0, step, steps))}
        onPlus={() => setW(stepUp(w ?? 0, step, steps))}
        stepLabel={steps?.length ? undefined : fmtNumber(step)}
      />
      <BigStepper
        label="Wiederholungen"
        unit="Wdh."
        value={r}
        onChange={(v) => setR(v === undefined ? undefined : Math.round(v))}
        onMinus={() => setR(Math.max(0, (r ?? 0) - 1))}
        onPlus={() => setR((r ?? 0) + 1)}
      />
      <div className="mt-3 flex gap-2">
        {logged && (
          <button type="button" className="h-12 flex-1 rounded-2xl bg-slate-700 font-semibold" onClick={onClose}>
            Abbrechen
          </button>
        )}
        <button
          type="button"
          disabled={!ok}
          className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-2xl bg-white font-bold text-black active:bg-emerald-400 disabled:opacity-40"
          onClick={() => ok && onSave({ weightKg: w ?? 0, reps: r, excluded: logged?.excluded ?? false })}
        >
          <Check size={20} strokeWidth={3} /> {logged ? 'Änderung speichern' : 'Satz speichern'}
        </button>
      </div>
    </div>
  );
}

function BigStepper({
  label,
  unit,
  value,
  decimal,
  onChange,
  onMinus,
  onPlus,
  stepLabel,
}: {
  label: string;
  unit: string;
  value: number | undefined;
  decimal?: boolean;
  onChange: (v: number | undefined) => void;
  onMinus: () => void;
  onPlus: () => void;
  stepLabel?: string;
}) {
  const [text, setText] = useState<string | null>(null);
  const shown = text ?? (value === undefined ? '' : fmtW(value));
  const btn = 'flex h-14 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-700 text-white active:bg-slate-500 select-none';
  return (
    <div className="mt-2 flex items-center gap-2">
      <button type="button" className={btn} onClick={onMinus} aria-label={`${label} verringern`}>
        <Minus size={24} strokeWidth={2.5} />
        {stepLabel && <span className="text-[10px] leading-none text-slate-400">{stepLabel}</span>}
      </button>
      <label className="flex min-w-0 flex-1 flex-col items-center">
        <span className="flex items-baseline gap-1">
          <input
            aria-label={label}
            inputMode={decimal ? 'decimal' : 'numeric'}
            className="w-24 bg-transparent text-center text-3xl font-bold tabular-nums outline-none"
            value={shown}
            placeholder="–"
            onFocus={(e) => {
              setText(shown);
              e.target.select();
            }}
            onChange={(e) => {
              setText(e.target.value);
              onChange(parseNum(e.target.value));
            }}
            onBlur={() => setText(null)}
          />
        </span>
        <span className="text-[11px] text-slate-500">{unit}</span>
      </label>
      <button type="button" className={btn} onClick={onPlus} aria-label={`${label} erhöhen`}>
        <Plus size={24} strokeWidth={2.5} />
        {stepLabel && <span className="text-[10px] leading-none text-slate-400">{stepLabel}</span>}
      </button>
    </div>
  );
}
