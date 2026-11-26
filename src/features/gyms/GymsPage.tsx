import { useState } from 'react';
import { USC_PLANS, USC_SNAPSHOT } from '../../catalog/uscKoeln';
import { UscPlans } from './UscPlans';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, Field, Modal, PageHeader } from '../../components/ui';
import { getMeta, save, setMeta } from '../../local/db';
import { addMyGym, myGyms, searchGyms } from '../../local/queries';
import { db } from '../../local/db';

export function GymsPage() {
  const gyms = useLiveQuery(myGyms, []);
  const counts = useLiveQuery(async () => {
    const m = new Map<string, number>();
    for (const g of await db.gymMachines.toArray()) if (!g.deletedAt) m.set(g.gymId, (m.get(g.gymId) ?? 0) + 1);
    return m;
  }, []);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <PageHeader title="Meine Gyms" right={<Button onClick={() => setAdding(true)}>+ Gym</Button>} />
      {gyms && gyms.length === 0 && (
        <EmptyState title="Noch kein Gym.">
          <p className="mb-3 text-sm">Füge die Studios hinzu, in denen du trainierst – bestehende Gyms anderer Nutzer kannst du übernehmen, inklusive Geräteliste.</p>
          <Button onClick={() => setAdding(true)}>Gym hinzufügen</Button>
        </EmptyState>
      )}
      <div className="space-y-2">
        {gyms?.map((g) => (
          <Link key={g.id} to={`/gyms/${g.id}`} className="block">
            <Card className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{g.name}</p>
                <p className="text-xs text-slate-500">{[g.chain, g.city].filter(Boolean).join(' · ') || '—'}</p>
              </div>
              <span className="text-sm text-slate-500">{counts?.get(g.id) ?? 0} Geräte ›</span>
            </Card>
          </Link>
        ))}
      </div>
      <AddGymModal open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

function AddGymModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', chain: '', city: '', address: '' });
  const mine = useLiveQuery(async () => new Set((await db.userGyms.toArray()).filter((l) => !l.deletedAt).map((l) => l.gymId)), []);
  const uscPlan = useLiveQuery(async () => (await getMeta<string>('uscPlan')) ?? '', []);
  const results = useLiveQuery(() => searchGyms(q, uscPlan || undefined), [q, uscPlan]);

  const take = async (id: string) => {
    await addMyGym(id);
    onClose();
    nav(`/gyms/${id}`);
  };
  const create = async () => {
    const g = await save('gyms', {
      name: form.name.trim(),
      chain: form.chain.trim() || undefined,
      city: form.city.trim() || undefined,
      address: form.address.trim() || undefined,
    });
    await take(g.id);
    setForm({ name: '', chain: '', city: '', address: '' });
    setCreating(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Gym hinzufügen">
      {!creating ? (
        <div className="space-y-3">
          <input className="input" placeholder="Suchen: Name, Kette, Stadtteil – z. B. „fitness first nippes“" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          <div>
            <span className="label">Mein Urban-Sports-Club-Paket</span>
            <div className="flex gap-1.5">
              {['', ...USC_PLANS].map((p) => (
                <button
                  key={p || 'all'}
                  type="button"
                  onClick={() => setMeta('uscPlan', p)}
                  className={`flex-1 rounded-full py-1.5 text-xs font-semibold ${uscPlan === p ? 'bg-white text-black' : 'bg-slate-800 text-slate-300'}`}
                >
                  {p || 'Alle'}
                </button>
              ))}
            </div>
          </div>
          <ul className="divide-y divide-slate-800">
            {results?.map((g) => (
              <li key={g.id}>
                <button type="button" className="flex w-full items-center justify-between gap-3 py-2.5 text-left" disabled={mine?.has(g.id)} onClick={() => take(g.id)}>
                  <span className="min-w-0">
                    <span className="block truncate">{g.name}</span>
                    <span className="block truncate text-xs text-slate-500">{[g.district ?? g.city, g.address].filter(Boolean).join(' · ')}</span>
                    {g.uscPlans && <UscPlans plans={g.uscPlans} className="mt-1" />}
                  </span>
                  <span className="shrink-0 text-sm text-emerald-400">{mine?.has(g.id) ? '✓ dabei' : 'Übernehmen'}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-500">
            Urban-Sports-Club-Pakete laut öffentlicher Partnerliste (Köln, Stand {USC_SNAPSHOT}). Maßgeblich ist die USC-App.
          </p>
          {results?.length === 0 && <p className="text-sm text-slate-500">Nichts gefunden.</p>}
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setForm((f) => ({ ...f, name: q }));
              setCreating(true);
            }}
          >
            Neues Gym anlegen
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="Name">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z. B. McFit Berlin-Mitte" />
          </Field>
          <Field label="Kette (optional)">
            <input className="input" value={form.chain} onChange={(e) => setForm({ ...form, chain: e.target.value })} placeholder="z. B. McFit" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Stadt">
              <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label="Straße (optional)">
              <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
          </div>
          <p className="text-xs text-slate-500">Gyms sind für alle Nutzer sichtbar, damit andere deine Geräteliste übernehmen können. Deine Trainings bleiben privat.</p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setCreating(false)}>
              Zurück
            </Button>
            <Button className="flex-1" disabled={!form.name.trim()} onClick={create}>
              Anlegen
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
