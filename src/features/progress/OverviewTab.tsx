/** Fortschritt → Überblick: Konsistenz, Kraft-Highlights, Fortschritt der letzten 4 Wochen. */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, EmptyState } from '../../components/ui';
import { ExerciseName } from '../../components/ExerciseName';
import { setMeta } from '../../local/db';
import { consistency, progressByExercise, progressRate, SPLIT_LABEL, strengthHighlights, type DayCell, type Highlight, type Split } from '../../domain/dashboard';
import { isoWeek } from '../../domain/insights';
import { fmtNumber } from '../../domain/units';
import { CARDIO_COLOR, SPLIT_COLOR, type ProgressData } from './progressData';

export function OverviewTab({ data, onOpen }: { data: ProgressData; onOpen: (exerciseId: string) => void }) {
  if (!data.sessions.length) return <EmptyState title="Noch keine Trainings – starte dein erstes auf „Training“." />;
  return (
    <div className="space-y-4">
      <ConsistencyCard data={data} />
      <HighlightsCard data={data} onOpen={onOpen} />
      <ProgressRateCard data={data} onOpen={onOpen} />
    </div>
  );
}

// ---------------------------------------------------------------------------

const WEEKS = 6;
const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const DATE_FMT = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

function cellStyle(c: DayCell): React.CSSProperties {
  const colors = c.splits.map((s) => SPLIT_COLOR[s]);
  if (colors.length === 1) return { background: colors[0] };
  if (colors.length > 1) return { background: `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)` };
  if (c.cardioMin > 0) return { background: CARDIO_COLOR };
  return {};
}

function ConsistencyCard({ data }: { data: ProgressData }) {
  const c = useMemo(() => consistency(data.sessions, data.cardio, data.goal, WEEKS), [data]);
  const [sel, setSel] = useState<DayCell | null>(null);
  const setGoal = (g: number) => setMeta('weeklyGoal', Math.min(7, Math.max(1, g)));
  const used = (Object.keys(SPLIT_COLOR) as Split[]).filter((s) => c.weeks.some((w) => w.days.some((d) => d.splits.includes(s))));
  const anyCardio = c.weeks.some((w) => w.days.some((d) => d.cardioMin > 0));
  const today = new Date().toDateString();
  const trend = c.avg4w - c.avg4wPrev;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Konsistenz</h2>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          Ziel
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800" aria-label="Ziel verringern" onClick={() => setGoal(c.goal - 1)}>
            <Minus size={14} />
          </button>
          <span className="w-3 text-center text-sm font-bold text-white">{c.goal}</span>
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800" aria-label="Ziel erhöhen" onClick={() => setGoal(c.goal + 1)}>
            <Plus size={14} />
          </button>
          / Woche
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 text-center">
        <Stat label="letzte 7 Tage" value={`${c.last7}/${c.goal}`} good={c.last7 >= c.goal} />
        <Stat
          label="Ø pro Woche (4 W.)"
          value={fmtNumber(c.avg4w, 1)}
          good={c.avg4w >= c.goal}
          extra={Math.abs(trend) >= 0.05 ? `${trend > 0 ? '+' : '−'}${fmtNumber(Math.abs(trend), 1)}` : undefined}
        />
        <Stat label={c.inGoalWeeks === 1 ? 'Woche im Ziel' : 'Wochen im Ziel'} value={c.inGoalWeeks ? String(c.inGoalWeeks) : '–'} good={c.inGoalWeeks > 0} />
      </dl>

      <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: '2.6rem repeat(7, minmax(0, 1fr)) 1.8rem' }}>
        <span />
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-center text-[10px] text-slate-500">
            {d}
          </span>
        ))}
        <span />
        {c.weeks.map((w) => (
          <Row key={w.start}>
            <span className={`flex items-center text-[10px] ${w.current ? 'font-semibold text-slate-200' : 'text-slate-500'}`}>KW {isoWeek(w.start)}</span>
            {w.days.map((cell) => {
              const trained = cell.splits.length > 0;
              const isSel = sel?.date === cell.date;
              const isToday = new Date(cell.ts).toDateString() === today;
              return (
                <button
                  key={cell.date}
                  type="button"
                  disabled={cell.future}
                  onClick={() => setSel(isSel ? null : cell)}
                  aria-label={`${DATE_FMT.format(cell.ts)}${trained ? `: ${cell.splits.map((s) => SPLIT_LABEL[s]).join(', ')}` : ''}${cell.cardioMin ? ', Cardio' : ''}`}
                  className={`relative h-8 rounded-lg text-[11px] tabular-nums ${
                    trained ? 'font-semibold text-white' : cell.cardioMin ? 'font-semibold text-black' : cell.future ? 'text-slate-700' : 'bg-slate-800/70 text-slate-500'
                  } ${isSel ? 'ring-2 ring-white' : isToday ? 'ring-1 ring-slate-400' : ''}`}
                  style={cellStyle(cell)}
                >
                  {new Date(cell.ts).getDate()}
                  {trained && cell.cardioMin > 0 && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full" style={{ background: CARDIO_COLOR }} />}
                </button>
              );
            })}
            <span className={`flex items-center justify-end text-xs tabular-nums ${w.goalMet ? 'font-bold text-emerald-400' : 'text-slate-500'}`}>{w.sessions || ''}</span>
          </Row>
        ))}
      </div>

      {sel && (
        <div className="mt-3 rounded-2xl bg-slate-800/60 px-3 py-2 text-sm">
          <p className="font-semibold">{DATE_FMT.format(sel.ts)}</p>
          {sel.sessionIds.length === 0 && !sel.cardioMin && <p className="text-slate-500">Kein Training</p>}
          {sel.sessionIds.map((id) => {
            const info = data.sessionInfo.get(id);
            return (
              <Link key={id} to={`/session/${id}/summary`} className="flex items-center justify-between py-0.5 text-slate-200">
                {info?.dayName} · {info?.gymName}
                <ChevronRight size={16} className="text-slate-500" />
              </Link>
            );
          })}
          {sel.cardioMin > 0 && <p className="text-slate-400">Cardio {fmtNumber(sel.cardioMin, 0)} min</p>}
        </div>
      )}

      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
        {used.map((s) => (
          <li key={s} className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SPLIT_COLOR[s] }} />
            {SPLIT_LABEL[s]}
          </li>
        ))}
        {anyCardio && (
          <li className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: CARDIO_COLOR }} />
            Cardio
          </li>
        )}
      </ul>
    </Card>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Stat({ label, value, good, extra }: { label: string; value: string; good?: boolean; extra?: string }) {
  return (
    <div>
      <dd className={`text-xl font-bold tabular-nums ${good ? 'text-emerald-400' : ''}`}>
        {value}
        {extra && <span className="ml-1 text-[11px] font-semibold text-slate-500">{extra}</span>}
      </dd>
      <dt className="text-[11px] text-slate-500">{label}</dt>
    </div>
  );
}

// ---------------------------------------------------------------------------

const W = 140;
const H = 44;
const PAD = 4;

function Sparkline({ h, color }: { h: Highlight; color: (gymId: string) => string }) {
  const pts = h.series.flatMap((s) => s.points);
  const t0 = Math.min(...pts.map((p) => p.ts));
  const t1 = Math.max(...pts.map((p) => p.ts));
  let v0 = Math.min(...pts.map((p) => p.v));
  let v1 = Math.max(...pts.map((p) => p.v));
  if (v1 - v0 < 1) (v0 -= 1), (v1 += 1);
  const x = (t: number) => PAD + ((t - t0) / Math.max(1, t1 - t0)) * (W - 2 * PAD);
  const y = (v: number) => H - PAD - ((v - v0) / (v1 - v0)) * (H - 2 * PAD);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-11 w-full" preserveAspectRatio="none" aria-hidden>
      {h.series.map((s) => {
        const d = s.points.map((p, i) => `${i ? 'L' : 'M'}${x(p.ts).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
        const last = s.points[s.points.length - 1];
        return (
          <g key={s.stationId}>
            <path d={d} fill="none" stroke={color(s.gymId)} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <circle cx={x(last.ts)} cy={y(last.v)} r={3} fill={color(s.gymId)} vectorEffect="non-scaling-stroke" />
          </g>
        );
      })}
    </svg>
  );
}

const pctText = (p: number) => `${p > 0.005 ? '+' : p < -0.005 ? '−' : '±'}${fmtNumber(Math.abs(p * 100), 0)} %`;

function HighlightsCard({ data, onOpen }: { data: ProgressData; onOpen: (exerciseId: string) => void }) {
  const items = useMemo(() => strengthHighlights(data.sessions, data.sets, data.stations, data.exercises, () => true), [data]);
  const shown = [...new Set(items.flatMap((h) => h.series.map((s) => s.gymId)))];
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">Kraft-Highlights</h2>
        <span className="text-xs text-slate-500">12 Wochen</span>
      </div>
      {shown.length > 1 && (
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
          {shown.map((g) => (
            <li key={g} className="flex items-center gap-1">
              <span className="h-0.5 w-3 rounded" style={{ background: data.gymColor(g) }} />
              {data.gymLabel(g)}
            </li>
          ))}
        </ul>
      )}
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Ab zwei Trainings pro Übung in den letzten 12 Wochen siehst du hier deine Entwicklung.</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {items.map((h) => {
            const main = [...h.series].sort((a, b) => b.points.at(-1)!.ts - a.points.at(-1)!.ts)[0];
            return (
              <button key={h.exerciseId} type="button" onClick={() => onOpen(h.exerciseId)} className="rounded-2xl bg-slate-800/60 p-3 text-left active:bg-slate-800">
                <ExerciseName name={h.name} className="h-10 text-sm font-semibold leading-5" />
                <Sparkline h={h} color={data.gymColor} />
                <p className="mt-1 flex items-baseline justify-between text-xs">
                  <span className="font-bold tabular-nums text-white">
                    {fmtNumber(main.last, h.unit === 'kg' ? 1 : 0)} {h.unit}
                  </span>
                  <span className={`tabular-nums ${main.pct > 0.005 ? 'text-emerald-400' : 'text-slate-500'}`}>{pctText(main.pct)}</span>
                </p>
              </button>
            );
          })}
        </div>
      )}
      <p className="mt-2 text-[11px] text-slate-500">Deine meisttrainierten Übungen · geschätztes Maximalgewicht (1RM) pro Training.</p>
    </Card>
  );
}

// ---------------------------------------------------------------------------

type Bucket = 'up' | 'flat' | 'down';

function ProgressRateCard({ data, onOpen }: { data: ProgressData; onOpen: (exerciseId: string) => void }) {
  const r = useMemo(
    () => progressByExercise(progressRate(data.sessions, data.sets, data.stations, data.exercises, () => true), data.stations, data.exercises),
    [data],
  );
  const [open, setOpen] = useState<Bucket | null>(null);
  const total = r.up.length + r.flat.length + r.down.length;
  const tiles = [
    { key: 'up' as const, label: 'stärker', Icon: TrendingUp, color: '#30d158', list: r.up },
    { key: 'flat' as const, label: 'gehalten', Icon: ArrowRight, color: '#8e8e93', list: r.flat },
    { key: 'down' as const, label: 'schwächer', Icon: TrendingDown, color: '#ff9f0a', list: r.down },
  ];
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">Fortschritt</h2>
        <span className="text-xs text-slate-500">letzte 4 Wochen vs. davor</span>
      </div>
      {total === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Es braucht Trainings in beiden Zeiträumen.</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {tiles.map((t) => (
              <button
                key={t.key}
                type="button"
                disabled={!t.list.length}
                onClick={() => setOpen(open === t.key ? null : t.key)}
                className={`rounded-2xl px-1 py-2.5 text-center disabled:opacity-40 ${open === t.key ? 'bg-slate-700' : 'bg-slate-800/60'}`}
              >
                <span className="flex items-center justify-center gap-1 text-2xl font-bold tabular-nums">
                  <t.Icon size={16} style={{ color: t.color }} />
                  {t.list.length}
                </span>
                <span className="text-[11px] text-slate-400">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
            {tiles
              .filter((t) => t.list.length)
              .map((t) => (
                <div key={t.key} style={{ width: `${(t.list.length / total) * 100}%`, background: t.color }} />
              ))}
          </div>
          {open && (
            <ul className="mt-3 divide-y divide-slate-800">
              {tiles
                .find((t) => t.key === open)!
                .list.map((ex) => (
                  <li key={ex.exerciseId}>
                    <button type="button" className="flex w-full items-center gap-2 py-2 text-left text-sm" onClick={() => onOpen(ex.exerciseId)}>
                      <ExerciseName name={ex.name} className="min-w-0 flex-1" />
                      <span className="shrink-0 font-semibold tabular-nums">{pctText(ex.pct)}</span>
                      <ChevronRight size={16} className="shrink-0 text-slate-600" />
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}
