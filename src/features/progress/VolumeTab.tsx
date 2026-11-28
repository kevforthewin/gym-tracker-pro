/**
 * Fortschritt → Volumen: tatsächlich trainierte Arbeitssätze pro Muskel und Woche.
 * Körperkarte für die gewählte Woche, darunter Balken und der Verlauf der letzten 6 Wochen.
 */
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BodyMap } from '../../components/MuscleIcon';
import { Card, EmptyState } from '../../components/ui';
import { addWeeks, isoWeek, weekStart } from '../../domain/insights';
import { MUSCLE_ORDER, rangeOf } from '../../domain/planVolume';
import { fmtNumber, fmtShortDate } from '../../domain/units';
import { COLOR, LABEL } from '../profile/PlanVolumeCard';
import type { ProgressData } from './progressData';

const WEEKS = 6;
const SCALE_MAX = 24;

const toneOf = (muscle: string, v: number) => {
  const { min, max } = rangeOf(muscle);
  return v === 0 ? 'none' : v < min ? 'low' : v > max ? 'high' : 'ok';
};

export function VolumeTab({ data }: { data: ProgressData }) {
  const thisWeek = weekStart(Date.now());
  /** Zeitraum: 1–4 Kalenderwochen. Werte = Ø Sätze pro Woche, damit sie mit der Empfehlung (pro Woche) vergleichbar bleiben. */
  const [span, setSpan] = useState<number>(() => {
    try {
      return Number(sessionStorage.getItem('volumeSpan')) || 1;
    } catch {
      return 1;
    }
  });
  // Ende des Zeitraums (Wochen vor der aktuellen). Mehrere Wochen: nur abgeschlossene – die laufende Woche würde den Schnitt drücken.
  const minEnd = span > 1 ? 1 : 0;
  const [endOffset, setEndOffset] = useState(() => (!data.volume.get(thisWeek)?.size && data.volume.get(addWeeks(thisWeek, -1))?.size ? 1 : 0));
  const end = Math.max(endOffset, minEnd);
  const [selected, setSelected] = useState<string>();
  const endWeek = addWeeks(thisWeek, -end);
  const range = useMemo(() => Array.from({ length: span }, (_, i) => addWeeks(endWeek, -(span - 1 - i))), [endWeek, span]);
  const weeks = useMemo(() => Array.from({ length: Math.max(WEEKS, span) }, (_, i) => addWeeks(endWeek, -(Math.max(WEEKS, span) - 1 - i))), [endWeek, span]);
  const chooseSpan = (n: number) => {
    setSpan(n);
    try {
      sessionStorage.setItem('volumeSpan', String(n));
    } catch {
      /* egal */
    }
  };

  if (!data.volume.size) return <EmptyState title="Noch keine Trainingsdaten." />;
  const round = (x: number) => Math.round(x * 2) / 2;
  const valWeek = (m: string, w: number) => round(data.volume.get(w)?.get(m) ?? 0);
  /** Ø Sätze pro Woche im Zeitraum */
  const val = (m: string) => round(range.reduce((a, w) => a + (data.volume.get(w)?.get(m) ?? 0), 0) / span);
  const total = range.reduce((a, w) => a + [...(data.volume.get(w)?.values() ?? [])].reduce((x, y) => x + y, 0), 0);
  const trainedWeeks = range.filter((w) => data.volume.get(w)?.size).length;
  const muscles = MUSCLE_ORDER.filter((m) => weeks.some((w) => valWeek(m, w) > 0));
  const inRange = (w: number) => range.includes(w);
  const pct = (x: number) => `${Math.min(100, (x / SCALE_MAX) * 100)}%`;

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex gap-1 rounded-full bg-slate-800/70 p-1" role="group" aria-label="Zeitraum">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={span === n}
              onClick={() => chooseSpan(n)}
              className={`flex-1 rounded-full py-1.5 text-sm font-semibold ${span === n ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
            >
              {n === 1 ? '1 Woche' : `${n} Wo.`}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800" onClick={() => setEndOffset(end + span)} aria-label="Früherer Zeitraum">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <h2 className="font-bold">
              {span === 1 ? `KW ${isoWeek(endWeek)}` : `KW ${isoWeek(range[0])}–${isoWeek(endWeek)}`}{' '}
              {end === minEnd && <span className="font-normal text-slate-500">· {span === 1 ? 'aktuell' : 'zuletzt'}</span>}
            </h2>
            <p className="text-xs text-slate-500">
              {fmtShortDate(range[0])} – {fmtShortDate(addWeeks(endWeek, 1) - 86400000)} ·{' '}
              {span === 1 ? `${fmtNumber(total, 1)} Sätze` : `Ø ${fmtNumber(total / span, 1)} Sätze pro Woche`}
            </p>
            {span > 1 && trainedWeeks < span && (
              <p className="text-[11px] text-amber-300/80">
                {trainedWeeks === 0 ? 'kein Training im Zeitraum' : `nur ${trainedWeeks} von ${span} Wochen mit Training`}
              </p>
            )}
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 disabled:opacity-30"
            disabled={end <= minEnd}
            onClick={() => setEndOffset(Math.max(minEnd, end - span))}
            aria-label="Späterer Zeitraum"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-4">
          <BodyMap colorOf={(m) => COLOR[toneOf(m, val(m))]} selected={selected} onSelect={(m) => setSelected(m === selected ? undefined : m)} />
        </div>
        <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          {(['none', 'low', 'ok', 'high'] as const).map((k) => (
            <li key={k} className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLOR[k] }} />
              {LABEL[k]}
            </li>
          ))}
        </ul>

        {selected && (
          <div className="mt-3 rounded-2xl bg-slate-800/60 px-3 py-2">
            <div className="flex items-baseline justify-between">
              <h3 className="font-bold">{selected}</h3>
              <span className="text-sm">
                <span className="font-semibold tabular-nums" style={{ color: COLOR[toneOf(selected, val(selected))] }}>
                  {fmtNumber(val(selected), 1)} Sätze{span > 1 && ' Ø/Woche'}
                </span>
                <span className="text-slate-400">
                  {' '}
                  · empfohlen {rangeOf(selected).min}–{rangeOf(selected).max}
                </span>
              </span>
            </div>
            {/* Mini-Verlauf 6 Wochen */}
            <div className="mt-2 flex h-14 items-end gap-1.5">
              {weeks.map((w) => {
                const v = valWeek(selected, w);
                return (
                  <div key={w} className="flex h-full flex-1 flex-col justify-end text-center">
                    <div
                      className="rounded-t"
                      style={{ height: `${Math.min(100, (v / SCALE_MAX) * 100)}%`, minHeight: v ? 3 : 0, background: COLOR[toneOf(selected, v)], opacity: inRange(w) ? 1 : 0.4 }}
                    />
                    <span className="mt-0.5 text-[9px] text-slate-500">KW{isoWeek(w)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <ul className="mt-4 space-y-1.5">
          {muscles.map((m) => {
            const v = val(m);
            const { min, max } = rangeOf(m);
            return (
              <li key={m}>
                <button type="button" onClick={() => setSelected(m)} className="grid w-full grid-cols-[7.5rem_1fr_2.5rem] items-center gap-2 text-left text-sm">
                  <span className={`truncate ${m === selected ? 'font-semibold text-white' : 'text-slate-300'}`}>{m}</span>
                  <span className="relative h-2.5 rounded-full bg-slate-800">
                    <span className="absolute inset-y-0 rounded-full bg-slate-700" style={{ left: pct(min), width: `calc(${pct(max)} - ${pct(min)})` }} />
                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: pct(v), background: COLOR[toneOf(m, v)] }} />
                  </span>
                  <span className="text-right tabular-nums">{v ? fmtNumber(v, 1) : '–'}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11px] text-slate-500">
          {span > 1 ? `Durchschnitt pro Woche über ${span} abgeschlossene Wochen – Wochen ohne Training zählen mit. ` : ''}Arbeitssätze ohne Aufwärmen. Mittrainierte Muskeln zählen halb, links/rechts je Seite halb. Grauer Bereich: Empfehlung.
        </p>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-bold">Verlauf · {weeks.length} Wochen</h2>
        <div className="grid items-center gap-1 text-xs" style={{ gridTemplateColumns: `6.5rem repeat(${weeks.length}, minmax(0, 1fr))` }}>
          <span />
          {weeks.map((w) => (
            <span key={w} className={`rounded text-center text-[10px] ${inRange(w) ? 'bg-slate-700/70 font-semibold text-white' : 'text-slate-500'}`}>
              KW{isoWeek(w)}
            </span>
          ))}
          {muscles.map((m) => (
            <Fragment key={m}>
              <span className="truncate text-slate-300">{m}</span>
              {weeks.map((w) => {
                const v = valWeek(m, w);
                const t = toneOf(m, v);
                return (
                  <span
                    key={w}
                    className="rounded-md py-1 text-center tabular-nums"
                    style={{ background: v ? `${COLOR[t]}${t === 'ok' ? '55' : '33'}` : 'rgba(255,255,255,0.03)', color: v ? '#fff' : '#48484a' }}
                  >
                    {v ? fmtNumber(v, 0) : '·'}
                  </span>
                );
              })}
            </Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Fragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
