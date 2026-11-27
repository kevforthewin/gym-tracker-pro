/** Fortschritt → Körper: Körpergewicht (Verlauf + Eintragen) und Cardio. */
import { useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { X } from 'lucide-react';
import { Card } from '../../components/ui';
import { remove, save } from '../../local/db';
import { isoOf } from '../../domain/dashboard';
import { fmtDate, fmtNumber, fmtShortDate, parseNum } from '../../domain/units';
import { CardioCard } from '../cardio/CardioCard';
import type { ProgressData } from './progressData';

const tsOf = (iso: string) => new Date(`${iso}T12:00:00`).getTime();

export function BodyTab({ data }: { data: ProgressData }) {
  return (
    <div className="space-y-4">
      <BodyweightCard data={data} />
      {data.cardio.length ? (
        <CardioCard />
      ) : (
        <Card>
          <h2 className="text-lg font-bold">Cardio</h2>
          <p className="mt-1 text-sm text-slate-500">Noch kein Cardio. Eintragen geht auf der Startseite mit „Cardio eintragen“ oder im Training.</p>
        </Card>
      )}
    </div>
  );
}

function BodyweightCard({ data }: { data: ProgressData }) {
  const entries = data.bodyweights;
  const [value, setValue] = useState('');
  const [all, setAll] = useState(false);
  const last = entries.at(-1);
  const ref = entries.find((e) => tsOf(e.date) >= Date.now() - 30 * 86400000);
  const delta = last && ref && last !== ref ? last.weightKg - ref.weightKg : undefined;
  const points = entries.map((e) => ({ date: tsOf(e.date), value: e.weightKg }));

  const add = async () => {
    const kg = parseNum(value);
    if (!kg || kg < 20 || kg > 400) return;
    const today = isoOf(Date.now());
    const existing = entries.find((e) => e.date === today);
    if (existing) await remove('bodyweights', existing.id);
    await save('bodyweights', { date: today, weightKg: kg });
    setValue('');
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">Körpergewicht</h2>
          <p className="text-xs text-slate-500">{last ? `zuletzt ${fmtDate(tsOf(last.date))}` : 'noch kein Eintrag'}</p>
        </div>
        {last && (
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">
              {fmtNumber(last.weightKg, 1)}
              <span className="ml-0.5 text-sm font-normal text-slate-500">kg</span>
            </p>
            {delta !== undefined && (
              <p className="text-[11px] text-slate-500">
                {delta >= 0 ? '+' : '−'}
                {fmtNumber(Math.abs(delta), 1)} kg in 30 Tagen
              </p>
            )}
          </div>
        )}
      </div>

      {points.length >= 2 && (
        <div className="mt-3 h-36">
          <ResponsiveContainer>
            <LineChart data={points} margin={{ top: 6, right: 6, bottom: 0, left: -12 }}>
              <XAxis
                dataKey="date"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={fmtShortDate}
                tick={{ fontSize: 10, fill: '#8e8e93' }}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10, fill: '#8e8e93' }} axisLine={false} tickLine={false} width={40} tickFormatter={(v: number) => fmtNumber(v, 0)} />
              <Tooltip
                labelFormatter={(d: number) => new Date(d).toLocaleDateString('de-DE')}
                formatter={(v: number) => [`${fmtNumber(v, 1)} kg`, 'Gewicht']}
                contentStyle={{ borderRadius: 12, fontSize: 13, color: '#f2f2f7', background: '#1c1c1e', border: 'none' }}
              />
              <Line type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} dot={points.length < 30 ? { r: 2.5, fill: '#fff' } : false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          className="input flex-1"
          inputMode="decimal"
          placeholder={last ? `heute, z. B. ${fmtNumber(last.weightKg, 1)}` : 'Gewicht heute (kg)'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          aria-label="Körpergewicht heute"
        />
        <button type="button" className="rounded-2xl bg-white px-4 font-semibold text-black disabled:opacity-40" disabled={!parseNum(value)} onClick={add}>
          Eintragen
        </button>
      </div>

      {entries.length > 0 && (
        <>
          <button type="button" className="mt-2 w-full py-1 text-xs text-slate-400" onClick={() => setAll(!all)}>
            {all ? 'Einträge ausblenden' : `Alle Einträge (${entries.length})`}
          </button>
          {all && (
            <ul className="divide-y divide-slate-800 text-sm">
              {[...entries].reverse().map((e) => (
                <li key={e.id} className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400">{fmtDate(tsOf(e.date))}</span>
                  <span className="flex items-center gap-3 tabular-nums">
                    {fmtNumber(e.weightKg, 1)} kg
                    <button type="button" aria-label="Eintrag löschen" className="text-slate-600" onClick={() => remove('bodyweights', e.id)}>
                      <X size={16} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}
