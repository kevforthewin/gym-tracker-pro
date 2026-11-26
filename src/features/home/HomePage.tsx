import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, PageHeader } from '../../components/ui';
import { all, getMeta, save, setMeta } from '../../local/db';
import { myGyms } from '../../local/queries';
import { fmtDate } from '../../domain/units';
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
  const names = useLiveQuery(async () => {
    const [g, d] = await Promise.all([all('gyms'), all('planDays')]);
    return { gym: new Map(g.map((x) => [x.id, x.name])), day: new Map(d.map((x) => [x.id, x.name])) };
  }, []);

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
  const last7 = sessions?.filter((s) => s.startedAt > Date.now() - 7 * 86400_000).length ?? 0;

  const start = async () => {
    const s = await save('sessions', { gymId: validGym, planDayId: dayId || undefined, startedAt: Date.now() });
    await setMeta('lastStart', { gymId: validGym, dayId });
    nav(`/session/${s.id}`);
  };

  return (
    <>
      <PageHeader title="Training" right={<SyncBadge />} />
      {active && (
        <Link to={`/session/${active.id}`} className="mb-4 block rounded-xl bg-emerald-600 p-4 font-semibold text-white">
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
            Training starten
          </Button>
          {!days?.length && (
            <p className="text-xs text-slate-500">
              Tipp: Unter <Link to="/profile" className="text-emerald-400">Profil → Pläne</Link> legst du Trainingstage an (z. B. Push/Pull/Legs).
            </p>
          )}
        </Card>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <Card className="p-3">
          <p className="text-2xl font-bold tabular-nums">{last7}</p>
          <p className="text-xs text-slate-500">Trainings letzte 7 Tage</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold tabular-nums">{gyms?.length ?? 0}</p>
          <p className="text-xs text-slate-500">Gyms</p>
        </Card>
      </div>

      {!!sessions?.length && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-400">Letzte Trainings</h2>
          <Card className="divide-y divide-slate-700 p-0">
            {sessions.slice(0, 8).map((s) => (
              <Link key={s.id} to={`/session/${s.id}${s.finishedAt ? '/summary' : ''}`} className="flex justify-between px-4 py-2.5 text-sm">
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
    </>
  );
}
