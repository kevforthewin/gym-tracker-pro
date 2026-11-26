/**
 * Körperschema mit hervorgehobener Muskelgruppe (eigene Zeichnung, kein Emoji).
 * Je nach Muskel wird die Vorder- oder Rückansicht gezeigt.
 */
import { HeartPulse } from 'lucide-react';

type Region =
  | 'pecs'
  | 'delts'
  | 'abs'
  | 'obliques'
  | 'upperArm'
  | 'forearm'
  | 'quads'
  | 'adductors'
  | 'abductors'
  | 'shins'
  | 'traps'
  | 'lats'
  | 'lowerBack'
  | 'glutes'
  | 'hamstrings'
  | 'calves';

const MUSCLES: Record<string, { view: 'front' | 'back'; regions: Region[] }> = {
  Brust: { view: 'front', regions: ['pecs'] },
  Schultern: { view: 'front', regions: ['delts'] },
  Bizeps: { view: 'front', regions: ['upperArm'] },
  Bauch: { view: 'front', regions: ['abs', 'obliques'] },
  Beine: { view: 'front', regions: ['quads'] },
  Quadrizeps: { view: 'front', regions: ['quads'] },
  Adduktoren: { view: 'front', regions: ['adductors'] },
  Abduktoren: { view: 'front', regions: ['abductors'] },
  Trizeps: { view: 'back', regions: ['upperArm'] },
  Rücken: { view: 'back', regions: ['lats'] },
  'Hintere Schulter': { view: 'back', regions: ['delts'] },
  Rotatorenmanschette: { view: 'back', regions: ['delts'] },
  'Unterer Rücken': { view: 'back', regions: ['lowerBack'] },
  Nacken: { view: 'back', regions: ['traps'] },
  Beinbeuger: { view: 'back', regions: ['hamstrings'] },
  Gesäß: { view: 'back', regions: ['glutes'] },
  Waden: { view: 'back', regions: ['calves'] },
};

const BASE = '#4a4a4f';
const BODY = '#2a2a2d';
const HIGHLIGHT = '#ff7a45';

/** Spiegelt eine linke Form auf die rechte Seite (Mittelachse x = 20) */
function Pair({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <g transform="translate(40 0) scale(-1 1)">{children}</g>
    </>
  );
}

function Front({ on }: { on: (r: Region) => string }) {
  return (
    <>
      <Pair>
        <ellipse cx="11.6" cy="16.6" rx="3.3" ry="3.1" fill={on('delts')} />
        <path d="M19.5 14.2H15c-1.7 0-2.3 1.6-1.9 4 .5 2.9 3 4.1 6.4 3.5z" fill={on('pecs')} />
        <rect x="8.1" y="19.8" width="3.9" height="9" rx="1.95" fill={on('upperArm')} />
        <rect x="6.9" y="29.6" width="3.5" height="8.8" rx="1.75" fill={on('forearm')} />
        <path d="M16 23.2l-2.3.4c-.5 3.6-.3 7 .8 10.1l1.5.4z" fill={on('obliques')} />
        <ellipse cx="13.7" cy="38.6" rx="1.7" ry="3" fill={on('abductors')} />
        <rect x="14" y="38.3" width="5.6" height="15" rx="2.8" fill={on('quads')} />
        <rect x="17.4" y="39.2" width="2.2" height="8.6" rx="1.1" fill={on('adductors')} />
        <rect x="14.7" y="54.6" width="4.1" height="8.6" rx="2" fill={on('shins')} />
      </Pair>
      <rect x="16.6" y="23" width="6.8" height="11.3" rx="2.2" fill={on('abs')} />
      <path d="M16.2 34.6h7.6l1 3.4h-9.6z" fill={BASE} />
    </>
  );
}

function Back({ on }: { on: (r: Region) => string }) {
  return (
    <>
      <path d="M20 10.6l6.2 4-6.2 5.4-6.2-5.4z" fill={on('traps')} />
      <Pair>
        <ellipse cx="11.6" cy="16.6" rx="3.3" ry="3.1" fill={on('delts')} />
        <path d="M19.4 20.6l-5.3-4.4c-1.4 3.4-1 8.6 1.6 12.6l3.7 1.8z" fill={on('lats')} />
        <rect x="8.1" y="19.8" width="3.9" height="9" rx="1.95" fill={on('upperArm')} />
        <rect x="6.9" y="29.6" width="3.5" height="8.8" rx="1.75" fill={on('forearm')} />
        <ellipse cx="17" cy="39" rx="3.5" ry="3.3" fill={on('glutes')} />
        <rect x="14" y="42.6" width="5.6" height="11" rx="2.8" fill={on('hamstrings')} />
        <ellipse cx="16.6" cy="58" rx="2.3" ry="4.4" fill={on('calves')} />
      </Pair>
      <rect x="16.8" y="29.6" width="6.4" height="5.6" rx="1.6" fill={on('lowerBack')} />
    </>
  );
}

/** Muskel-Icon; `muscle` ist die Muskelgruppe der Übung (z. B. „Brust“). */
export function MuscleIcon({ muscle, size = 36, className = '' }: { muscle?: string; size?: number; className?: string }) {
  if (muscle === 'Cardio')
    return (
      <span className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <HeartPulse size={size * 0.6} strokeWidth={1.8} className="text-best" />
      </span>
    );
  const m = (muscle && MUSCLES[muscle]) || { view: 'front' as const, regions: [] as Region[] };
  const on = (r: Region) => (m.regions.includes(r) ? HIGHLIGHT : BASE);
  return (
    <svg viewBox="0 0 40 64" width={(size * 40) / 64} height={size} className={className} aria-label={muscle ?? 'Übung'} role="img">
      {/* Silhouette */}
      <ellipse cx="20" cy="5.8" rx="3.9" ry="4.6" fill={BASE} />
      <rect x="18" y="9.5" width="4" height="4" rx="1.2" fill={BODY} />
      <path
        d="M13 12.6h14c3 0 4.6 2 4.4 5l-1.9 9.4c-.7 3.9-1.9 7-2.9 10H13.4c-1-3-2.2-6.1-2.9-10l-1.9-9.4c-.2-3 1.4-5 4.4-5z"
        fill={BODY}
      />
      <Pair>
        <rect x="7.2" y="15.4" width="5.6" height="24" rx="2.8" fill={BODY} />
        <rect x="13.2" y="35.5" width="6.9" height="28" rx="3.3" fill={BODY} />
      </Pair>
      {m.view === 'front' ? <Front on={on} /> : <Back on={on} />}
    </svg>
  );
}

/** Quadratische Kachel mit Muskel-Icon */
export function MuscleTile({ muscle, className = '' }: { muscle?: string; className?: string }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 ${className}`}>
      <MuscleIcon muscle={muscle} size={34} />
    </span>
  );
}
