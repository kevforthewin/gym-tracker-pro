import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { EmptyState, IconButton, PageHeader } from '../../components/ui';
import { sessionStats, type SessionStat } from '../../local/sessionStats';
import { SPLIT_LABEL } from '../../domain/dashboard';
import { fmtNumber } from '../../domain/units';
import type { Split } from '../../model/types';

const SPLIT_DOT: Record<Split, string> = { push: '#3987e5', pull: '#d95926', legs: '#199e70', other: '#8e8e93' };
const MONTH = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
const DAY = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

function dayLabel(ts: number) {
  const d = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(ts).setHours(0, 0, 0, 0)) / 86400000);
  return d === 0 ? 'Heute' : d === 1 ? 'Gestern' : DAY.format(ts);
}

export function HistoryPage() {
  const stats = useLiveQuery(sessionStats, []);
  const now = new Date();
  const [month, setMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const from = new Date(month.y, month.m, 1).getTime();
  const to = new Date(month.y, month.m + 1, 1).getTime();
  const inMonth = (stats ?? []).filter((s) => s.startedAt >= from && s.startedAt < to);
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const trainedDays = new Set(inMonth.map((s) => new Date(s.startedAt).getDate()));
  const today = now.getFullYear() === month.y && now.getMonth() === month.m ? now.getDate() : 0;
  const shift = (d: number) => setMonth(({ y, m }) => ({ y: m + d < 0 ? y - 1 : m + d > 11 ? y + 1 : y, m: (m + d + 12) % 12 }));
  const isCurrent = month.y === now.getFullYear() && month.m === now.getMonth();

  const byDay = new Map<string, SessionStat[]>();
  for (const s of inMonth) {
    const k = new Date(s.startedAt).toDateString();
    byDay.set(k, [...(byDay.get(k) ?? []), s]);
  }

  return (
    <>
      <PageHeader title="Verlauf" />
      <div className="mb-3 flex items-center justify-between">
        <IconButton label="Vorheriger Monat" onClick={() => shift(-1)}>
          ‹
        </IconButton>
        <h2 className="text-lg font-bold">{MONTH.format(from)}</h2>
        <IconButton label="Nächster Monat" onClick={() => !isCurrent && shift(1)} className={isCurrent ? 'opacity-30' : ''}>
          ›
        </IconButton>
      </div>

      <section className="rounded-card bg-slate-900">
        <dl className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
          <Stat label="Trainings" value={String(inMonth.length)} />
          <Stat label="Sätze" value={String(inMonth.reduce((a, s) => a + s.sets, 0))} />
          <Stat
            label="Volumen"
            value={fmtNumber(inMonth.reduce((a, s) => a + s.volume, 0) / 1000, 1)}
            unit="t"
          />
        </dl>
        <div className="px-4 py-3">
          <div className="flex gap-[3px]">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <span
                key={d}
                title={`${d}.`}
                className={`h-7 flex-1 rounded-[3px] ${trainedDays.has(d) ? 'bg-slate-300' : d === today ? 'border border-dashed border-slate-500' : 'bg-slate-800'}`}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-500">
            {[1, 8, 15, 22, 29].filter((d) => d <= daysInMonth).map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </section>

      {stats && inMonth.length === 0 && (
        <div className="mt-5">
          <EmptyState title="Keine Trainings in diesem Monat." />
        </div>
      )}

      {[...byDay].map(([k, list]) => (
        <section key={k}>
          <h3 className="mb-2 mt-6 text-base font-semibold text-slate-300">{dayLabel(list[0].startedAt)}</h3>
          <div className="space-y-2">
            {list.map((s) => (
              <Link key={s.id} to={`/session/${s.id}${s.finished ? '/summary' : ''}`} className="block rounded-card bg-slate-900 p-4 active:bg-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-bold">{s.dayName}</p>
                    <p className="text-sm text-slate-500">
                      {s.gymName} · {new Date(s.startedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} · {s.sets} Sätze
                    </p>
                  </div>
                  <p className="text-right text-lg font-bold tabular-nums">
                    {s.volume.toLocaleString('de-DE')}
                    <span className="block text-xs font-normal text-slate-500">kg</span>
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {s.splits.map((sp) => (
                    <span key={sp} className="chip bg-slate-800 text-slate-300">
                      <span className="mr-1 h-2 w-2 rounded-full" style={{ background: SPLIT_DOT[sp] }} />
                      {SPLIT_LABEL[sp]}
                    </span>
                  ))}
                  {s.prs > 0 && <span className="chip border border-best/60 text-best">✦ {s.prs}</span>}
                  {!s.finished && <span className="chip bg-emerald-500/15 text-emerald-300">läuft</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="px-4 py-3">
      <dd className="text-2xl font-bold tabular-nums">
        {value}
        {unit && <span className="ml-0.5 text-sm font-normal text-slate-500">{unit}</span>}
      </dd>
      <dt className="text-xs text-slate-500">{label}</dt>
    </div>
  );
}
