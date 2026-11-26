import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { Link2 } from 'lucide-react';
import { Button, Modal } from '../../components/ui';
import { mergeGymInto, mergeSuggestions } from '../../local/mergeGym';
import { searchGyms } from '../../local/queries';
import type { Gym } from '../../model/types';
import { UscPlans } from './UscPlans';

/** Hinweis + Dialog: eigenes Gym mit einem Katalog-Gym zusammenführen */
export function MergeGym({ gym }: { gym: Gym }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<Gym | null>(null);
  const [busy, setBusy] = useState(false);
  const suggestions = useLiveQuery(() => mergeSuggestions(gym), [gym.id]);
  const results = useLiveQuery(async () => (q.trim() ? (await searchGyms(q)).filter((g) => !g.createdBy && g.id !== gym.id) : []), [q, gym.id]);
  const list = q.trim() ? results : suggestions;

  const merge = async () => {
    if (!pick) return;
    setBusy(true);
    await mergeGymInto(gym.id, pick.id);
    setOpen(false);
    nav(`/gyms/${pick.id}`, { replace: true });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center gap-3 rounded-card bg-slate-900 px-4 py-3 text-left active:bg-slate-800"
      >
        <Link2 size={20} className="shrink-0 text-slate-400" />
        <span className="flex-1 text-sm">
          <span className="block font-semibold">Mit Katalog-Gym zusammenführen</span>
          <span className="block text-slate-500">
            {suggestions?.length ? `Passt vielleicht: ${suggestions[0].name}` : 'Dein Gym ist im Katalog? Dann Geräte und Trainings dorthin übernehmen.'}
          </span>
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Zusammenführen">
        {!pick ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Wähle das passende Gym aus dem Katalog. Deine Geräte, Trainings und Cardio-Einträge von „{gym.name}“ ziehen dorthin um.
            </p>
            <input className="input" placeholder="Im Katalog suchen" value={q} onChange={(e) => setQ(e.target.value)} />
            {!q.trim() && !!suggestions?.length && <h3 className="label">Vorschläge</h3>}
            <ul className="divide-y divide-slate-800">
              {list?.map((g) => (
                <li key={g.id}>
                  <button type="button" className="w-full py-2.5 text-left" onClick={() => setPick(g)}>
                    <span className="block">{g.name}</span>
                    <span className="block text-xs text-slate-500">{[g.district ?? g.city, g.address].filter(Boolean).join(' · ')}</span>
                    {g.uscPlans && <UscPlans plans={g.uscPlans} className="mt-1" />}
                  </button>
                </li>
              ))}
            </ul>
            {list?.length === 0 && <p className="text-sm text-slate-500">{q.trim() ? 'Nichts gefunden.' : 'Keine Vorschläge – such oben nach dem Namen.'}</p>}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <p>
              „<span className="font-semibold">{gym.name}</span>“ wird mit „<span className="font-semibold">{pick.name}</span>“ zusammengeführt.
            </p>
            <ul className="list-inside list-disc text-slate-400">
              <li>Geräte, Trainings und Cardio-Einträge ziehen um – deine Historie bleibt vollständig.</li>
              <li>Deine Geräte sind danach im Katalog-Gym auch für andere Mitglieder sichtbar.</li>
              <li>„{gym.name}“ wird entfernt.</li>
            </ul>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setPick(null)}>
                Zurück
              </Button>
              <Button className="flex-1" disabled={busy} onClick={merge}>
                Zusammenführen
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
