import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, PageHeader } from '../../components/ui';
import { all, getMeta, save, setMeta } from '../../local/db';
import { myGyms } from '../../local/queries';
import { fmtDate } from '../../domain/units';
import { weekStart } from '../../domain/insights';
import { isoOf } from '../../domain/dashboard';
import { CardioSheet } from '../cardio/CardioSheet';
import { DemoBanner, Tour, useFirstRunTour } from '../../demo/Tour';
import { SyncBadge } from '../profile/SyncBadge';

export function HomePage() {
  const nav = useNavigate();
  const gyms = useLiveQuery(myGyms, []);
  const days = useLiveQuery(async () => {
    const [plans, days] = await Promise.all([all('plans'), all('planDays')]);
    const pm = new Map(plans.map((p) => [p.id, p]));
    return days
      .filter((d) => pm.has(d.planId))
      .sort((a, b) => pm.get(a.planId)!.order - pm.get(b.planId)!.order || a.order - b.order)
      .map((d) => ({ ...d, planName: pm.get(d.planId)!.name }));
  }, []);
  const sessions = useLiveQuery(async () => (await all('sessions')).sort((a, b) => b.startedAt - a.startedAt), []);
  const cardio = useLiveQuery(() => all('cardio'), []);
  const [cardioOpen, setCardioOpen] = useState(false);
  const names = useLiveQuery(async () => {
    const [g, d] = await Promise.all([all('gyms'), all('planDays')]);
    return { gym: new Map(g.map((x) => [x.id, x.name])), day: new Map(d.map((x) => [x.id, x.name])) };
  }, []);

  const firstRun = useFirstRunTour();
  const [tourDone, setTourDone] = useState(false);
  const [gymId, setGymId] = useState('');
  const [dayId, setDayId] = useState('');
  useEffect(() => {
    getMeta<{ gymId: string; dayId: string }>('lastStart').then((v) => {
      if (v) {
        setGymId(v.gymId);
        setDayId(v.dayId);
      }
    });
  }, []);

  const active = sessions?.find((s) => !s.finishedAt && Date.now() - s.startedAt < 6 * 3600_000);
  const validGym = gyms?.some((g) => g.id === gymId) ? gymId : (gyms?.[0]?.id ?? '');

  const start = async () => {
    const s = await save('sessions', { gymId: validGym, planDayId: dayId || undefined, startedAt: Date.now() });
    await setMeta('lastStart', { gymId: validGym, dayId });
    nav(`/session/${s.id}`);
  };

  if (firstRun && !tourDone && gyms?.length === 0) return <Tour onDone={() => setTourDone(true)} />;

  const ws = weekStart(Date.now());
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws);
    d.setDate(d.getDate() + i);
    const from = d.getTime();
    const to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    const iso = isoOf(from);
    return {
      d,
      trained: !!sessions?.some((x) => x.startedAt >= from && x.startedAt < to),
      cardio: !!cardio?.some((c) => c.date === iso),
      today: d.toDateString() === new Date().toDateString(),
    };
  });
  const weekStartIso = isoOf(ws);
  const thisWeek = sessions?.filter((x) => x.startedAt >= ws).length ?? 0;
  const cardioWeek = cardio?.filter((c) => c.date >= weekStartIso) ?? [];
  const cardioMin = Math.round(cardioWeek.reduce((a, c) => a + c.durationMin, 0));

  return (
    <>
      <PageHeader
        title="Training"
        subtitle={new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
        right={<SyncBadge />}
      />
      <DemoBanner />
      <section className="mb-4 rounded-card bg-slate-900 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Diese Woche</h2>
          <span className="text-sm text-slate-500">
            {thisWeek} {thisWeek === 1 ? 'Training' : 'Trainings'}
            {cardioWeek.length > 0 && ` · ${cardioMin} min Cardio`}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {week.map(({ d, trained, cardio: c, today }) => (
            <div key={d.toISOString()} className={`rounded-2xl py-1.5 ${today ? 'bg-white text-black' : ''}`}>
              <p className={`text-[10px] font-semibold uppercase ${today ? '' : 'text-slate-500'}`}>{d.toLocaleDateString('de-DE', { weekday: 'short' }).slice(0, 2)}</p>
              <p className="text-base font-bold tabular-nums">{d.getDate()}</p>
              <span
                className={`relative mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  trained
                    ? today
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                    : c
                      ? 'bg-best text-black'
                      : today
                        ? 'border-2 border-black/20'
                        : 'border-2 border-slate-800'
                }`}
              >
                {trained ? '🏋' : c ? '🏃' : ''}
                {trained && c && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-black bg-best" />}
              </span>
            </div>
          ))}
        </div>
      </section>
      {active && (
        <Link to={`/session/${active.id}`} className="mb-4 block rounded-card bg-emerald-500 p-4 font-semibold text-black">
          ▶ Laufendes Training fortsetzen · {names?.day.get(active.planDayId ?? '') ?? 'Freies Training'}
        </Link>
      )}

      {gyms && gyms.length === 0 ? (
        <EmptyState title="Willkommen!">
          <p className="mb-3 text-sm">Lege zuerst dein Gym an oder übernimm eins, das andere schon erfasst haben.</p>
          <Button onClick={() => nav('/gyms')}>Gym hinzufügen</Button>
        </EmptyState>
      ) : (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold">Training starten</h2>
          <label className="block">
            <span className="label">Gym</span>
            <select className="input" value={validGym} onChange={(e) => setGymId(e.target.value)}>
              {gyms?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">Training</span>
            <select className="input" value={dayId} onChange={(e) => setDayId(e.target.value)}>
              <option value="">Freies Training</option>
              {days?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                  {(days?.filter((x) => x.planId !== d.planId).length ?? 0) > 0 ? ` (${d.planName})` : ''}
                </option>
              ))}
            </select>
          </label>
          <Button className="w-full" disabled={!validGym} onClick={start}>
            Krafttraining starten
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => setCardioOpen(true)}>
            🏃 Cardio eintragen
          </Button>
          {!days?.length && (
            <p className="text-xs text-slate-500">
              Tipp: Unter <Link to="/profile" className="text-white underline">Profil → Pläne</Link> legst du Trainingstage an (z. B. Push/Pull/Legs).
            </p>
          )}
        </Card>
      )}

      {!!sessions?.length && (
        <section className="mt-6">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Zuletzt</h2>
            <Link to="/history" className="text-sm text-slate-400">
              Alle ›
            </Link>
          </div>
          <Card className="divide-y divide-slate-800 p-0">
            {sessions.slice(0, 3).map((s) => (
              <Link key={s.id} to={`/session/${s.id}${s.finishedAt ? '/summary' : ''}`} className="flex justify-between px-4 py-3">
                <span>
                  {names?.day.get(s.planDayId ?? '') ?? 'Freies Training'}
                  <span className="block text-xs text-slate-500">{names?.gym.get(s.gymId)}</span>
                </span>
                <span className="text-slate-500">{fmtDate(s.startedAt)}</span>
              </Link>
            ))}
          </Card>
        </section>
      )}
      <CardioSheet open={cardioOpen} onClose={() => setCardioOpen(false)} />
    </>
  );
}
