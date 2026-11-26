/** Cardio-Überblick im Fortschritt: Minuten pro Woche (8 Wochen) – nur sichtbar, wenn es Cardio gibt. */
import { useLiveQuery } from 'dexie-react-hooks';
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts';
import { all } from '../../local/db';
import { addWeeks, isoWeek, weekStart } from '../../domain/insights';
import { fmtNumber } from '../../domain/units';
import { cardioKind } from '../../model/types';

export function CardioCard() {
  const data = useLiveQuery(async () => {
    const entries = await all('cardio');
    if (!entries.length) return null;
    const cur = weekStart(Date.now());
    const weeks = Array.from({ length: 8 }, (_, i) => addWeeks(cur, i - 7));
    const minutes = new Map<number, number>();
    const kinds = new Map<string, number>();
    let km = 0;
    for (const e of entries) {
      const w = weekStart(new Date(`${e.date}T12:00:00`).getTime());
      minutes.set(w, (minutes.get(w) ?? 0) + e.durationMin);
      if (w >= weeks[0]) {
        kinds.set(e.kind, (kinds.get(e.kind) ?? 0) + e.durationMin);
        km += e.distanceKm ?? 0;
      }
    }
    const bars = weeks.map((w) => ({ w, label: `KW${isoWeek(w)}`, min: Math.round(minutes.get(w) ?? 0), current: w === cur }));
    const prev4 = bars.slice(3, 7).reduce((a, b) => a + b.min, 0) / 4;
    const top = [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { bars, thisWeek: bars[7].min, prev4, top, km };
  }, []);
  if (!data) return null;

  return (
    <section className="mt-3 rounded-card bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">Cardio</h2>
          <p className="text-xs text-slate-500">Minuten pro Woche · zählt nicht zum Krafttraining-Ziel</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums">
            {data.thisWeek}
            <span className="ml-0.5 text-sm font-normal text-slate-500">min</span>
          </p>
          <p className="text-[11px] text-slate-500">diese Woche · Ø {fmtNumber(data.prev4, 0)} min</p>
        </div>
      </div>
      <div className="mt-3 h-24">
        <ResponsiveContainer>
          <BarChart data={data.bars} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#8e8e93' }} axisLine={false} tickLine={false} interval={1} />
            <Bar dataKey="min" radius={[4, 4, 4, 4]} isAnimationActive={false}>
              {data.bars.map((b) => (
                <Cell key={b.w} fill={b.current ? '#ffd60a' : '#636366'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {data.top.length > 0 && (
        <p className="mt-2 text-xs text-slate-400">
          8 Wochen: {data.top.map(([k, m]) => `${cardioKind(k).label} ${Math.round(m)} min`).join(' · ')}
          {data.km > 0 && ` · ${fmtNumber(data.km, 1)} km`}
        </p>
      )}
    </section>
  );
}
