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
  // Wochenanfang ohne Training: letzte Woche zeigen
  const [offset, setOffset] = useState(() => (!data.volume.get(thisWeek)?.size && data.volume.get(addWeeks(thisWeek, -1))?.size ? 1 : 0));
  const [selected, setSelected] = useState<string>();
  const week = addWeeks(thisWeek, -offset);
  const weeks = useMemo(() => Array.from({ length: WEEKS }, (_, i) => addWeeks(thisWeek, -(WEEKS - 1 - i))), [thisWeek]);

  if (!data.volume.size) return <EmptyState title="Noch keine Trainingsdaten." />;
  const row = data.volume.get(week) ?? new Map<string, number>();
  const val = (m: string, w = week) => Math.round((data.volume.get(w)?.get(m) ?? 0) * 2) / 2;
  const total = [...row.values()].reduce((a, b) => a + b, 0);
  const muscles = MUSCLE_ORDER.filter((m) => weeks.some((w) => val(m, w) > 0) || val(m) > 0);
  const pct = (x: number) => `${Math.min(100, (x / SCALE_MAX) * 100)}%`;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800" onClick={() => setOffset(offset + 1)} aria-label="Vorherige Woche">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <h2 className="font-bold">
              KW {isoWeek(week)} {offset === 0 && <span className="font-normal text-slate-500">· aktuell</span>}
            </h2>
            <p className="text-xs text-slate-500">
              {fmtShortDate(week)} – {fmtShortDate(addWeeks(week, 1) - 86400000)} · {fmtNumber(total, 1)} Sätze
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 disabled:opacity-30"
            disabled={offset === 0}
            onClick={() => setOffset(offset - 1)}
            aria-label="Nächste Woche"
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
                  {fmtNumber(val(selected), 1)} Sätze
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
                const v = val(selected, w);
                return (
                  <div key={w} className="flex h-full flex-1 flex-col justify-end text-center">
                    <div
                      className="rounded-t"
                      style={{ height: `${Math.min(100, (v / SCALE_MAX) * 100)}%`, minHeight: v ? 3 : 0, background: COLOR[toneOf(selected, v)], opacity: w === week ? 1 : 0.55 }}
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
          Arbeitssätze ohne Aufwärmen. Mittrainierte Muskeln zählen halb, links/rechts je Seite halb. Grauer Bereich: Empfehlung.
        </p>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-bold">Verlauf · {WEEKS} Wochen</h2>
        <div className="grid items-center gap-1 text-xs" style={{ gridTemplateColumns: `6.5rem repeat(${WEEKS}, minmax(0, 1fr))` }}>
          <span />
          {weeks.map((w) => (
            <span key={w} className={`text-center text-[10px] ${w === week ? 'font-semibold text-white' : 'text-slate-500'}`}>
              KW{isoWeek(w)}
            </span>
          ))}
          {muscles.map((m) => (
            <Fragment key={m}>
              <span className="truncate text-slate-300">{m}</span>
              {weeks.map((w) => {
                const v = val(m, w);
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
