import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Button, Card, PageHeader } from '../../components/ui';
import { all, db, getMeta, save, setMeta } from '../../local/db';
import { importLegacy } from '../../import/applyImport';
import { cloudEnabled } from '../../sync/supabase';
import { runSync, signInWithEmail, signOut, useSyncStore, verifyEmailCode } from '../../sync/useSync';
import { PRIVATE_TABLES, SHARED_TABLES } from '../../model/types';

export function ProfilePage() {
  const plans = useLiveQuery(async () => (await all('plans')).sort((a, b) => a.order - b.order), []);
  const goal = useLiveQuery(async () => (await getMeta<number>('weeklyGoal')) ?? 3, []);
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const newPlan = async () => {
    const name = prompt('Name des Plans', 'Push / Pull / Legs');
    if (!name) return;
    const p = await save('plans', { name, order: plans?.length ?? 0 });
    if (/push/i.test(name) && /pull/i.test(name))
      for (const [i, d] of ['Push', 'Pull', 'Legs'].entries()) await save('planDays', { planId: p.id, name: d, order: i });
  };

  const onImport = async (f: File) => {
    try {
      const r = await importLegacy(JSON.parse(await f.text()));
      setMsg(`✓ ${r.sessions} Trainings mit ${r.sets} Sätzen übernommen (${r.mapped} Übungen dem Katalog zugeordnet, ${r.custom} eigene).`);
    } catch (e) {
      setMsg(`Fehler: ${(e as Error).message}`);
    }
  };

  const exportJson = async () => {
    const tables: Record<string, unknown[]> = {};
    for (const t of [...SHARED_TABLES, ...PRIVATE_TABLES]) tables[t] = await db.table(t).toArray();
    const blob = new Blob([JSON.stringify({ format: 'gym-tracker-pro', version: 1, exportedAt: Date.now(), tables })], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gym-tracker-pro-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <>
      <PageHeader title="Profil" />
      <div className="space-y-4">
        <Account />

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Pläne</h2>
            <Button variant="secondary" className="min-h-9 px-3 py-1 text-sm" onClick={newPlan}>
              + Plan
            </Button>
          </div>
          {plans?.length === 0 && <p className="text-sm text-slate-500">Noch kein Plan. Ohne Plan kannst du „Freies Training“ starten.</p>}
          <ul className="divide-y divide-slate-700">
            {plans?.map((p) => (
              <li key={p.id}>
                <Link to={`/profile/plan/${p.id}`} className="flex justify-between py-2.5">
                  {p.name} <span className="text-slate-500">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex items-center justify-between">
          <span className="font-semibold">Wochenziel</span>
          <span className="flex items-center gap-2">
            <Button variant="secondary" className="min-h-9 w-9 px-0" onClick={() => setMeta('weeklyGoal', Math.max(1, (goal ?? 3) - 1))}>
              −
            </Button>
            <span className="w-16 text-center tabular-nums">{goal}× / Woche</span>
            <Button variant="secondary" className="min-h-9 w-9 px-0" onClick={() => setMeta('weeklyGoal', Math.min(7, (goal ?? 3) + 1))}>
              +
            </Button>
          </span>
        </Card>

        <Card className="space-y-2">
          <h2 className="font-semibold">Daten</h2>
          <Button variant="secondary" className="w-full" onClick={() => file.current?.click()}>
            Backup der bisherigen App importieren
          </Button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="hidden"
            data-testid="legacy-input"
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
          />
          {msg && <p className="text-sm text-slate-300">{msg}</p>}
          <Button variant="secondary" className="w-full" onClick={exportJson}>
            Alle Daten exportieren (JSON)
          </Button>
        </Card>
      </div>
    </>
  );
}

function Account() {
  const { auth, state, error, lastSyncAt } = useSyncStore();
  const rejected = useLiveQuery(async () => (await getMeta<string[]>('syncRejected'))?.length ?? 0, []);
  const pending = useLiveQuery(() => db.outbox.count(), []);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  if (!cloudEnabled)
    return (
      <Card>
        <h2 className="font-semibold">Lokaler Modus</h2>
        <p className="mt-1 text-sm text-slate-500">
          Konten und Synchronisierung sind noch nicht eingerichtet. Deine Daten liegen nur auf diesem Gerät – exportiere sie regelmäßig.
        </p>
      </Card>
    );

  if (auth)
    return (
      <Card className="space-y-2">
        <h2 className="font-semibold">Konto</h2>
        <p className="text-sm">{auth.user.email}</p>
        <p className="text-xs text-slate-500">
          {state === 'syncing'
            ? 'Synchronisiere …'
            : state === 'offline'
              ? 'Offline – wird nachgeholt'
              : state === 'error'
                ? `Fehler: ${error}`
                : lastSyncAt
                  ? `Zuletzt synchronisiert ${new Date(lastSyncAt).toLocaleTimeString('de-DE')}`
                  : ''}
          {pending ? ` · ${pending} Änderungen ausstehend` : ''}
          {rejected ? ` · ${rejected} vom Server abgelehnt` : ''}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => runSync()}>
            Jetzt synchronisieren
          </Button>
          <Button variant="ghost" onClick={() => confirm('Abmelden? Lokale Daten werden von diesem Gerät entfernt (sie bleiben im Konto).') && signOut()}>
            Abmelden
          </Button>
        </div>
      </Card>
    );

  return (
    <Card className="space-y-2">
      <h2 className="font-semibold">Anmelden</h2>
      <p className="text-sm text-slate-500">Mit Konto werden deine Trainings auf allen Geräten synchronisiert. Bisher lokal erfasste Daten werden übernommen.</p>
      {!sent ? (
        <>
          <input className="input" type="email" autoComplete="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button
            className="w-full"
            disabled={!/\S+@\S+\.\S+/.test(email)}
            onClick={async () => {
              setErr('');
              try {
                await signInWithEmail(email.trim());
                setSent(true);
              } catch (e) {
                setErr((e as Error).message);
              }
            }}
          >
            Code per E-Mail senden
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm">Wir haben dir eine E-Mail geschickt. Gib den Code ein – oder tippe auf den Link in der Mail.</p>
          <input className="input text-center tracking-widest" inputMode="numeric" autoComplete="one-time-code" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button
            className="w-full"
            disabled={code.trim().length < 6}
            onClick={async () => {
              setErr('');
              try {
                await verifyEmailCode(email.trim(), code);
              } catch (e) {
                setErr((e as Error).message);
              }
            }}
          >
            Anmelden
          </Button>
          <button type="button" className="w-full text-sm text-slate-500" onClick={() => setSent(false)}>
            Andere E-Mail
          </button>
        </>
      )}
      {err && <p className="text-sm text-red-400">{err}</p>}
    </Card>
  );
}
