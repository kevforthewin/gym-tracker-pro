import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { getMeta, setMeta } from '../local/db';
import { hasDemo, loadDemo, removeDemo } from './demoData';

const SLIDES = [
  {
    icon: '📍',
    title: 'Jedes Gym, jedes Gerät',
    text: 'Du trainierst in mehreren Studios? Hier hat jedes Gerät seine eigene Historie – eine Brustpresse in Gym A ist nicht dieselbe wie in Gym B.',
  },
  {
    icon: '🔗',
    title: 'Gleiches Modell erkannt',
    text: 'Ordne Geräte einem Herstellermodell zu. Steht dieselbe „Hoist ROC-IT Brustpresse“ in zwei Gyms, nutzt die App deine Werte aus dem anderen Gym als Ziel.',
  },
  {
    icon: '✓',
    title: 'Ein Tipp pro Satz',
    text: 'Jeder Satz ist mit deinem Ziel vorbefüllt. Geschafft? Haken antippen. Mehr geschafft? Zahl ändern, dann Haken. Neue Bestwerte siehst du sofort.',
  },
  {
    icon: '📈',
    title: 'Fortschritt auf einen Blick',
    text: 'Verlauf nach Monat, Bestwerte je Gerät und Charts, die zeigen, wie viel stärker du seit dem ersten Training bist.',
  },
];

/** Rundgang beim ersten Start (oder aus dem Profil). */
export function Tour({ onDone }: { onDone: () => void }) {
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  const finish = async (demo: boolean) => {
    await setMeta('tourSeen', true);
    if (demo) await loadDemo();
    onDone();
    nav(demo ? '/' : '/gyms');
  };
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black px-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-[max(env(safe-area-inset-top),1.5rem)]">
      <div className="flex justify-end">
        <button type="button" className="text-sm text-slate-500" onClick={() => finish(false)}>
          Überspringen
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-900 text-5xl">{s.icon}</div>
        <h1 className="text-3xl font-bold tracking-tight">{s.title}</h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-400">{s.text}</p>
      </div>
      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, k) => (
          <span key={k} className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-white' : 'w-2 bg-slate-700'}`} />
        ))}
      </div>
      {last ? (
        <div className="space-y-2">
          <Button className="w-full" onClick={() => finish(true)}>
            Mit Beispieldaten ausprobieren
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => finish(false)}>
            Eigenes Gym anlegen
          </Button>
        </div>
      ) : (
        <Button className="w-full" onClick={() => setI(i + 1)}>
          Weiter
        </Button>
      )}
    </div>
  );
}

/** Rundgang automatisch beim ersten Start zeigen */
export function useFirstRunTour() {
  return useLiveQuery(async () => !(await getMeta<boolean>('tourSeen')), []);
}

/** Hinweis, solange Beispieldaten geladen sind */
export function DemoBanner() {
  const demo = useLiveQuery(hasDemo, []);
  if (!demo) return null;
  return (
    <div className="mb-4 flex items-center gap-3 rounded-card bg-best/10 px-4 py-3 text-sm">
      <span className="flex-1 text-best">Du siehst Beispieldaten. Probier alles aus – es wird nichts gespeichert, was andere sehen.</span>
      <button type="button" className="shrink-0 font-semibold text-white" onClick={() => confirm('Beispieldaten entfernen?') && removeDemo()}>
        Entfernen
      </button>
    </div>
  );
}
